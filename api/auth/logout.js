/**
 * User Logout Endpoint
 * 
 * Terminates the user's session and clears authentication cookies.
 * This endpoint performs a complete cleanup of both server-side session data
 * and client-side session cookies.
 * 
 * Route: POST /auth/logout
 * 
 * Response:
 * - 200: Logout successful, session destroyed and cookie cleared
 * - 400: Bad request (no session found)
 * - 405: Method not allowed (only POST is supported)
 * - 500: Internal server error
 * 
 * Security Notes:
 * - Uses POST to prevent CSRF attacks (GET logout links are vulnerable)
 * - Destroys server-side session data completely
 * - Clears client-side cookie with proper security flags
 * - Cookie settings match those used during session creation
 */
export default async function handler(req, res) {
  // Only allow POST requests - logout should be a deliberate action
  // Using GET for logout is a security risk (CSRF, browser prefetching, etc.)
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Check if session exists before attempting to destroy it
    // This prevents errors when logout is called without an active session
    if (!req.session) {
      return res.status(400).json({ 
        success: false, 
        error: 'No session found' 
      });
    }

    // Destroy the server-side session data
    // This removes all session data from the session store (memory, Redis, etc.)
    // Wrap callback-based session.destroy() in a Promise for async/await
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Clear the session cookie from the client's browser
    // Cookie name 'connect.sid' is the default for express-session
    // IMPORTANT: Cookie options must match those used when creating the cookie
    res.clearCookie('connect.sid', {
      path: '/',                    // Cookie is valid for entire domain
      httpOnly: true,               // Prevents JavaScript access (XSS protection)
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',  
      // 'strict': Production - cookie only sent to same site (CSRF protection)
      // 'lax': Development - allows some cross-site requests (easier testing)
      secure: process.env.SECURE_COOKIES === 'true'  
      // true: Cookie only sent over HTTPS (production)
      // false: Cookie sent over HTTP (development/localhost)
    });

    // Return success response
    // Frontend can now redirect to login page or update UI
    return res.status(200).json({ 
      success: true, 
      message: 'Logout successful' 
    });

  } catch (error) {
    // Catch any unexpected errors during session destruction
    // Log the full error for debugging but return generic message to client
    console.error('[AUTH] Logout error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
