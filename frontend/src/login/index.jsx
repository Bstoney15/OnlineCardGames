import { Link } from 'react-router-dom'
import { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault()


    // TODO: somehow verify username and password are valid here
    // if invalid:
    //    setError("Invlalid username or password");
    //    return;
    // if valid:
    setError("");
    alert(`Login for ${username} successful! (placeholder)`);
    setUsername("");
    setPassword("");
  }

  return (
      <div className='min-h-screen flex flex-col items-center justify-center'>
        <h1 className='my-2'>Login Page</h1>
        <form onSubmit={handleSubmit} className='form-background'>
          <label>Username</label>
          <input
          type="text"
          className="form-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
          />

          <label>Password:</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button className="btn-white-glow" type="submit">Login</button>
        </form>
        <Link to='/' className='btn-cyan-glow my-5'>Back to Home</Link>
      </div>
  )
}

export default Login