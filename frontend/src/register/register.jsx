import { useState } from "react";
import "./createAccount.css";
import Card from "/src/components/card/card.jsx";
import { Link } from "react-router-dom";
import { createUser, ApiError } from "/src/lib/apiClient";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await createUser({ email, password });

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // use backend response to show email
      setSuccess(`Account created for ${res.email} with ${res.balance} credits!`);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("An unexpected error occurred. Please try again.");
    } 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Card suit="0" rank="0" />
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

        <label>Email:</label>
        <input
          className="form-input"
          type="email"
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
        {success && <p className="success-text">{success}</p>}

        <button className="btn-white-glow" type="submit">
          Create Account
        </button>
      </form>

      <Link to="/" className="btn-cyan-glow my-5">
        Back to Home
      </Link>
    </div>
  );
}
