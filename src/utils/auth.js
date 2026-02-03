/**
 * Frontend Authentication Utilities
 * 
 * This module provides client-side functions for interacting with the
 * authentication API endpoints. These functions handle session checking
 * and logout functionality from the browser.
 * 
 * All functions use 'credentials: include' to send session cookies with requests.
 */

/**
 * Check if the current user is authenticated
 * 
 * Calls the backend /api/auth/check endpoint to verify if the user has
 * a valid session. This is typically called on page load or when checking
 * if a user should have access to protected content.
 * 
 * Use cases:
 * - On app initialization to determine if user is logged in
 * - Before showing protected UI components
 * - To get current user data for display (username, role, etc.)
 * 
 * @returns {Promise<Object>} Object with isAuthenticated (boolean) and user (object or null)
 * 
 * Example usage:
 * const { isAuthenticated, user } = await checkAuth();
 * if (isAuthenticated) {
 *   console.log('Logged in as:', user.username);
 * }
 */
export async function checkAuth() {
  try {
    // Make GET request to auth check endpoint
    // credentials: 'include' ensures session cookie is sent with the request
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      credentials: 'include',  // CRITICAL: Sends cookies (session ID) to server
    });

    // Parse JSON response from server
    const data = await response.json();
    
    // Check if request was successful (200 OK) and server returned success
    // Server returns { success: true, isAuthenticated: true/false, user: {...} }
    if (response.ok && data.success) {
      return {
        isAuthenticated: data.isAuthenticated,  // true if logged in, false if not
        user: data.user  // User object if authenticated, null if not
      };
    }
    
    // If response wasn't ok or success was false, treat as not authenticated
    return {
      isAuthenticated: false,
      user: null
    };
  } catch (error) {
    // Catch network errors, JSON parse errors, etc.
    // Log for debugging but return safe default (not authenticated)
    console.error('Auth check error:', error);
    return {
      isAuthenticated: false,
      user: null
    };
  }
}

/**
 * Log out the current user
 * 
 * Calls the backend /api/auth/logout endpoint to destroy the session
 * and clear authentication cookies. On success, redirects to login page.
 * 
 * Use cases:
 * - When user clicks "Logout" button
 * - When session expires and user needs to re-authenticate
 * 
 * @returns {Promise<boolean>} True if logout successful, false otherwise
 * 
 * Example usage:
 * const success = await logout();
 * if (success) {
 *   // User will be redirected to /login automatically
 * }
 */
export async function logout() {
  try {
    // Make POST request to logout endpoint
    // credentials: 'include' ensures session cookie is sent for destruction
    const response = await fetch('/api/auth/logout', {
      method: 'POST',  // POST to prevent accidental logout from browser prefetch/cache
      credentials: 'include',  // CRITICAL: Sends session cookie to be destroyed
    });

    // Parse JSON response from server
    const data = await response.json();
    
    // Check if logout was successful
    // Server returns { success: true, message: 'Logout successful' }
    if (response.ok && data.success) {
      // Redirect to login page after successful logout
      // This ensures user can't access protected pages without re-authenticating
      window.location.href = '/login';
      return true;
    }
    
    // Logout failed (shouldn't happen often)
    return false;
  } catch (error) {
    // Catch network errors, JSON parse errors, etc.
    // Log for debugging and return false to indicate failure
    console.error('Logout error:', error);
    return false;
  }
}
