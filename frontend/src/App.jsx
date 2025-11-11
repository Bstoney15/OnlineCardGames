//import { useState } from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { checkAuth } from '/src/lib/apiClient.js';
import { Navigate } from 'react-router-dom';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    <div className='min-h-screen flex flex-col items-center justify-center'>

      


      <div className='my-5'>
        <Link to="/login" className='btn-cyan-glow mx-4'>Go to Login Page</Link>
        <Link to="/register" className='btn-pink-glow mx-4'>Go to Register Page</Link>
      </div>
    </div>
  );
}

export default App;
