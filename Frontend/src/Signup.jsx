import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
// Import shared ultra-premium auth styles
import "./Auth.css";

// Signup component: A cinematic onboarding experience
export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Signup Logic with Supabase
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/signin`,
        data: { username },
      },
    });

    setLoading(false);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("✅ Success! Please check your email to confirm your account.");
    }
  };



  return (
    <div className="auth-wrapper">
      {/* Cinematic decorative background elements */}
      <div className="auth-blob-1"></div>
      <div className="auth-blob-2"></div>

      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join VocMate and start your fluency journey</p>

        <form className="auth-form" onSubmit={handleSignup}>
          <label className="auth-label">Username</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Choose a nickname"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label className="auth-label">Email Address</label>
          <input
            className="auth-input"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="auth-label">Password</label>
          <div className="password-container">
            <input
              className="auth-input password-input"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Get Started Now"}
          </button>
        </form>


        {message && (
          <p className={`status-msg ${message.includes("Error") ? "error" : "success"}`}>
            {message}
          </p>
        )}

        <p className="auth-footer">
          Already have an account?
          <Link to="/signin" className="auth-link">Sign in</Link>
        </p>

        <p className="auth-footer">
          <Link to="/" className="auth-link">← Return to Home</Link>
        </p>
      </div>
    </div>
  );
}
