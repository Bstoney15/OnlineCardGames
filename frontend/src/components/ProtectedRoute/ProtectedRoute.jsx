/**
 * ProtectedRoute component for securing routes that require authentication.
 * Checks user authentication status and redirects to login if not authenticated.
 * Periodically pings the auth endpoint to keep the session alive.
 *
 * @author Benjamin Stonestreet
 * @date 2025-10-15
 */

import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { checkAuth } from "/src/lib/apiClient";
import LoadingSpinner from "/src/components/LoadingSpinner/LoadingSpinner.jsx"


/**
 * ProtectedRoute - Route wrapper that requires user authentication.
 * Displays a loading spinner while checking auth, redirects to home if
 * not authenticated, or renders child routes if authenticated.
 * @returns {JSX.Element} Loading spinner, redirect, or child routes
 */
function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {

    const verifyUser = async () => {
      const Auth = await checkAuth();
      setIsAuthenticated(Auth.success);
    };

    verifyUser();

    // Ping auth endpoint every 60 seconds to keep session alive and check status
    const intervalId = setInterval(verifyUser, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
}

export default ProtectedRoute;
