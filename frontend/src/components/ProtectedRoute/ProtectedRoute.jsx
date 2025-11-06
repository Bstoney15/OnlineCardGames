
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { checkAuth } from "/src/lib/apiClient";
import LoadingSpinner from "/src/components/LoadingSpinner/LoadingSpinner.jsx"


function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        await checkAuth();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    verifyUser();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner/>
      </div> // Or a spinner component
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
}

export default ProtectedRoute;
