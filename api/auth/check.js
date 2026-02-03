/**
 * Authentication Check Endpoint
 * 
 * This endpoint allows the frontend to verify if a user is currently authenticated
 * without requiring credentials. It checks the server-side session state.
 * 
 * Route: GET /auth/check
 * 
 * Response:
 * - 200: Returns authentication status (true/false) and user data if authenticated
 * - 405: Method not allowed (only GET is supported)
 * - 500: Internal server error
 * 
 * @param {Object} req - Express request object with session data
 * @param {Object} res - Express response object
 */
export default function handler(req, res) {
  // Only allow GET requests - this is a read-only endpoint
  // POST, PUT, DELETE, etc. are rejected with 405 Method Not Allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // Prevent caching of authentication status
  // These headers ensure the browser always fetches fresh auth state from the server
  // Critical for security: prevents stale authentication data from being cached
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache'); // HTTP/1.0 backward compatibility
  res.setHeader('Expires', '0'); // Ensure immediate expiration

  try {
    // Check if user has a valid authenticated session
    // All three conditions must be true:
    // 1. req.session exists (session middleware is working)
    // 2. req.session.isAuthenticated is true (user logged in successfully)
    // 3. req.session.user exists (user data was stored in session)
    if (req.session && req.session.isAuthenticated && req.session.user) {
      return res.status(200).json({ 
        success: true,
        isAuthenticated: true,
        user: req.session.user // Return user data for frontend to display
      });
    }

    // User is not authenticated - return false but still 200 OK
    // This is NOT an error, just a valid "not logged in" state
    return res.status(200).json({ 
      success: true,
      isAuthenticated: false,
      user: null
    });

  } catch (error) {
    // Catch any unexpected errors during session checking
    // Log the error for debugging and return generic error to client
    console.error('[AUTH] Check session error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
