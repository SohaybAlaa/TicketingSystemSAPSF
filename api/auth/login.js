/**
 * User Login Endpoint
 * 
 * Authenticates users by verifying their credentials and creating a server-side session.
 * This is the primary entry point for user authentication in the application.
 * 
 * Route: POST /auth/login
 * 
 * Request Body:
 * - username: User's username (required)
 * - password: User's password in plain text (required)
 * 
 * Response:
 * - 200: Login successful, returns user data and creates session
 * - 400: Bad request (missing username or password)
 * - 401: Unauthorized (invalid credentials)
 * - 405: Method not allowed (only POST is supported)
 * - 500: Internal server error
 * 
 * Security Notes:
 * - Password is verified using bcrypt hashing (never stored in plain text)
 * - Same error message for invalid username/password (prevents user enumeration)
 * - Session is saved server-side before responding to client
 */

// Import user data functions from the data layer
// - findUserByUsername: Looks up user in database/storage
// - verifyPassword: Compares plain text password with stored hash using bcrypt
// - getUserSafeData: Strips sensitive data (like passwordHash) before sending to client
import { findUserByUsername, verifyPassword, getUserSafeData } from '../data/users.js';

export default async function handler(req, res) {
  // Only allow POST requests - login requires sending credentials in request body
  // GET would expose credentials in URL (insecure), so we reject it
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Extract username and password from request body
    // Client should send JSON: { "username": "...", "password": "..." }
    const { username, password } = req.body;

    // Validate that both fields are provided
    // Return 400 Bad Request if either is missing or empty
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }

    // Look up user in the database by username
    // Returns user object if found, null/undefined if not found
    const user = findUserByUsername(username);

    // SECURITY: Use same error message for "user not found" as "wrong password"
    // This prevents attackers from determining which usernames exist in the system
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }

    // Verify the provided password against the stored hash
    // Uses bcrypt to compare: bcrypt.compare(plaintext, hash)
    // This is async because bcrypt hashing is computationally intensive
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    // If password doesn't match, reject with same generic error message
    // SECURITY: Same error as "user not found" to prevent user enumeration
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }

    // Authentication successful! Create session for the user
    // Store safe user data (without sensitive fields like passwordHash)
    req.session.user = getUserSafeData(user);
    // Mark session as authenticated (used by middleware to protect routes)
    req.session.isAuthenticated = true;

    // Explicitly save the session to ensure it's persisted before responding
    // This is critical: if session isn't saved and server crashes, user won't be logged in
    // Wrap callback-based session.save() in a Promise for async/await
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Return success response with user data
    // Frontend can use this data to update UI (show username, profile, etc.)
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      user: req.session.user
    });

  } catch (error) {
    // Catch any unexpected errors (database errors, session errors, etc.)
    // Log the full error for debugging but return generic message to client
    // SECURITY: Don't expose internal error details to client
    console.error('[AUTH] Login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
