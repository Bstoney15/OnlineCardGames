import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { checkAuth } from "/src/lib/apiClient";
import LoadingSpinner from "/src/components/LoadingSpinner/LoadingSpinner.jsx"


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
