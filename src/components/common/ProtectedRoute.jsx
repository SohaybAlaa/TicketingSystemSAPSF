/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes from unauthorized access.
 * It verifies user authentication and optionally checks for specific roles
 * before rendering the protected content.
 * 
 * Features:
 * - Checks if user is authenticated via session
 * - Supports role-based access control (RBAC)
 * - Shows loading spinner during authentication check
 * - Automatically redirects to login if unauthorized
 * - Prevents memory leaks with cleanup on unmount
 * 
 * Usage:
 * <ProtectedRoute>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * Or with role requirement:
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '@/utils/auth';
import LoadingSpinner from '../LoadingSpinner';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render if authorized
 * @param {string|null} props.requiredRole - Optional role required to access (e.g., 'admin', 'user')
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  // Hook to programmatically navigate between routes
  const navigate = useNavigate();
  
  // State to track authentication status
  // isChecking: true while verifying auth with server
  // isAuthenticated: true if user has valid session and correct role
  const [authState, setAuthState] = useState({
    isChecking: true,      // Start as true to show loading spinner initially
    isAuthenticated: false, // Assume not authenticated until verified
  });

  // useEffect runs on component mount to verify authentication
  // Dependencies: [navigate, requiredRole] - re-run if these change
  useEffect(() => {
    // Track if component is still mounted to prevent state updates after unmount
    // This prevents "Can't perform a React state update on an unmounted component" warning
    let isMounted = true;

    // Async function to verify user authentication
    const verifyAuth = async () => {
      try {
        // Call backend to check if user has valid session
        // Returns { isAuthenticated: boolean, user: object|null }
        const { isAuthenticated, user } = await checkAuth();
        
        // If component unmounted during async call, don't update state
        if (!isMounted) return;

        // CASE 1: User is not authenticated at all
        if (!isAuthenticated) {
          setAuthState({ isChecking: false, isAuthenticated: false });
          // Redirect to login page
          // replace: true prevents user from going back to protected page
          navigate('/login', { replace: true });
          return;
        }

        // CASE 2: User is authenticated but doesn't have required role
        // Example: regular user trying to access admin-only page
        if (requiredRole && user?.role !== requiredRole) {
          setAuthState({ isChecking: false, isAuthenticated: false });
          // Redirect to login (could also redirect to "access denied" page)
          navigate('/login', { replace: true });
          return;
        }

        // CASE 3: User is authenticated and has correct role (or no role required)
        // Allow access to protected content
        setAuthState({ isChecking: false, isAuthenticated: true });
      } catch (error) {
        // Handle errors during authentication check (network errors, etc.)
        console.error('Auth verification error:', error);
        // Only update state if component is still mounted
        if (isMounted) {
          setAuthState({ isChecking: false, isAuthenticated: false });
          // On error, redirect to login for safety
          navigate('/login', { replace: true });
        }
      }
    };

    // Execute the authentication verification
    verifyAuth();

    // Cleanup function runs when component unmounts
    // Sets isMounted to false to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [navigate, requiredRole]); // Re-run effect if navigate or requiredRole changes

  // RENDER PHASE 1: Still checking authentication
  // Show loading spinner while waiting for server response
  if (authState.isChecking) {
    return <LoadingSpinner />;
  }

  // RENDER PHASE 2: Authentication check complete but user is not authorized
  // Return null (render nothing) - user will be redirected to login
  if (!authState.isAuthenticated) {
    return null;
  }

  // RENDER PHASE 3: User is authenticated and authorized
  // Render the protected content (children)
  return <>{children}</>;
}
