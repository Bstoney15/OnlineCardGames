import { useState } from "react";
import "./createAccount.css"; // optional styling
import Card from "/src/components/card/card.jsx";
import { Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");
    alert(`✅ Account created for ${username} (placeholder only)`);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="my-2">Create Account</h1>
      <form onSubmit={handleSubmit} className="form-background">
        <label>Username:</label>
        <input
          className="form-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />

        <label>Email</label>
        <input
          className="form-input"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Email"
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

        <label>Re-enter Password:</label>
        <input
          className="form-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button className="btn-white-glow" type="submit">Create Account</button>
      </form>

      <Link to="/" className="btn-cyan-glow my-5">
        Back to Home
      </Link>
    </div>
  );
}
