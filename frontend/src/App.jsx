import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0);
  const [pingResponse, setPingResponse] = useState(false);

  // runs once when componenet is called. (mounted)
  useEffect(() => {
    fetch('http://localhost:8080/ping')
      .then(response => response.json())
      .then(data => setPingResponse(data.success))
      .catch(error => console.error('Error fetching ping:', error));
  }, []);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <h1 className='my-2'>CardGames React App</h1>
      <h2 className='my-2'>UseState example</h2>

      <button className='btn-white-glow my-2' onClick={() => setCount(count + 1)}>
        Click me to increment count
      </button>

      <p className='my-2'>The value of count: {count}</p>
      <p className='my-2'>Server status: {pingResponse ? 'Connected' : 'Disconnected'}</p>

      <div className='my-5'>
        <Link to="/login" className='btn-cyan-glow mx-4'>Go to Login Page</Link>
        <Link to="/register" className='btn-pink-glow mx-4'>Go to Register Page</Link>
      </div>
    </div>
  );
}

export default App;
