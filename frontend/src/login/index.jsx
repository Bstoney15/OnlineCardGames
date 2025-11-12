import { Link, useNavigate } from 'react-router-dom'
import { useState } from "react";
import { loginUser } from '/src/lib/apiClient';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    navigate("/home");
    /*try {
      const data = await loginUser({ email, password });
      console.log(data)
      if(data.success)
      {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message);
    }*/
  }

  return (
      <div className='min-h-screen flex flex-col items-center justify-center'>
        <h1 className='my-2'>Login Page</h1>
        <form onSubmit={handleSubmit} className='form-background'>
          <label>Email</label>
          <input
          type="text"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
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