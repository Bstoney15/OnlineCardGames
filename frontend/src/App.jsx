/**
 * App component - Main landing page for the Vice Casino application.
 * Handles initial authentication check and displays the welcome screen
 * with navigation options to login or register pages.
 *
 * @author Multiple Contributors
 * @date 2025-10-23
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { checkAuth } from '/src/lib/apiClient.js';
import { Navigate } from 'react-router-dom';
import WelcomeAnimation from '/src/components/loadingScreen/LoadingScreenAnimation.jsx';

/**
 * App - Root component that serves as the landing page.
 * Checks if user is authenticated and redirects to home if so,
 * otherwise displays the welcome animation and login/register options.
 * @returns {JSX.Element} The landing page or redirect to home
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // runs once when componenet is called. (mounted)
  useEffect(() => {

    const checkAuthentication = async () => {
      const auth = await checkAuth();
      setIsAuthenticated(auth.success);
    };
    
    checkAuthentication();
  }, []);


  if (isAuthenticated) {
     return <Navigate to="/home" />;
  }

  return (
    <>
    {!isLoading &&  <WelcomeAnimation onComplete={() => setIsLoading(true)} />}
    <div className='min-h-screen flex flex-col items-center justify-center'>

      {/* Title with retro font and pink glow */}
      <h1 className="casino-title mb-12">
        VICE CASINO
      </h1>

      <div className='my-5'>
        <Link to="/login" className='btn-cyan-glow mx-4'>Go to Login Page</Link>
        <Link to="/register" className='btn-pink-glow mx-4'>Go to Register Page</Link>

      </div>
    </div>
    </>
  );
}

export default App;
