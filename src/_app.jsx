/**
 * Main application component that sets up the layout and routing
 * @returns {JSX.Element} The application root component
 */
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MainLayout from "./_MainLayout";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "../styles/global.css";

export default function App() {
  const location = useLocation();
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Check if current route is under /admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <MainLayout>
      <Suspense fallback={<LoadingSpinner />}>
        {isAdminRoute ? (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ) : (
          <Outlet />
        )}
      </Suspense>
    </MainLayout>
  );
}
