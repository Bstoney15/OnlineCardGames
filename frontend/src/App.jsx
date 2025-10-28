import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { checkAuth } from "/src/lib/apiClient";


function App() {
  const [pingResponse, setPingResponse] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // runs once when componenet is called. (mounted)
  useEffect(() => {

    const checkAuthentication = async () => {
      const auth = await checkAuth();
      setIsAuthenticated(auth);
    };
    
    checkAuthentication();
    
  }, []);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>

      <div className='casino-title'>
        <h2>Test title</h2>
      </div>

      <div className='my-5'>
        {!isAuthenticated && (
          <>
            <Link to="/login" className='btn-cyan-glow mx-4'>Go to Login Page</Link>
            <Link to="/register" className='btn-cyan-glow mx-4'>Go to Register Page</Link>
          </>
        )}
        {isAuthenticated && (
          <Link to="/home" className='btn-cyan-glow mx-4'>Go to Home</Link>
        )}
      </div>
    </div>
  );
}

export default App;
