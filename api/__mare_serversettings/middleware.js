/**
 * Mare Middleware - Authentication and Security Handler
 * 
 * This middleware function runs on every incoming HTTP request to protect routes
 * and ensure only authenticated users can access protected resources.
 * 
 * Flow:
 * 1. Security check: Validates path for directory traversal attacks
 * 2. Public routes: Allows unrestricted access to public resources
 * 3. Auth routes: Allows access to authentication endpoints (login/logout/check)
 * 4. Protected routes: Requires valid session authentication
 * 
 * @param {Object} req - Express request object containing path, session, etc.
 * @param {Object} res - Express response object for sending responses
 * @param {Function} next - Callback to pass control to the next middleware
 */
export function mareMiddleware(req, res, next) {
  // Decode the URL path to handle encoded characters (e.g., %20 for space)
  const decodedPath = decodeURIComponent(req.path);
  
  // SECURITY CHECK: Prevent directory traversal attacks
  // Block paths containing '..' which could access parent directories
  // Example blocked path: '/api/../../../etc/passwd'
  if (decodedPath.includes('..')) {
    return res.status(400).json({ error: "Invalid path" });
  }
  
  // Define routes that don't require authentication
  const publicRoutes = ['/public'];
  const authRoutes = ['/auth/login', '/auth/logout', '/auth/check'];
  
  // Allow access to public routes without authentication
  // Example: /public/images/logo.png will pass through
  if (publicRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }
  
  // Allow access to authentication endpoints without being logged in
  // Users need to access /auth/login to authenticate in the first place
  if (authRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  // PROTECTED ROUTES: Check if user has a valid authenticated session
  // Session must exist, be marked as authenticated, and contain user data
  if (req.session && req.session.isAuthenticated && req.session.user) {
    return next();
  }

  // If none of the above conditions are met, deny access
  // Return 401 Unauthorized with a descriptive error message
  return res.status(401).json({ 
    success: false,
    error: "Unauthorized",
    message: "Authentication required. Please login to access this resource."
  });
}