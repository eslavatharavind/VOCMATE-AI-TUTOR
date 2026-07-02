import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
// Import the new ultra-premium authentication styles
import "./Auth.css";

// Signin component: A modern, glassmorphic entry point
export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Authentication Logic
  const handleSignin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("Error: " + error.message);
    } else if (!data.session?.user?.email_confirmed_at) {
      setMessage("Please confirm your email before signing in.");
    } else {
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    }
  };



  return (
    <div className="auth-wrapper">
      {/* Cinematic decorative background elements */}
      <div className="auth-blob-1"></div>
      <div className="auth-blob-2"></div>

      <div className="auth-card">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Enter your credentials to access your account</p>

        <form className="auth-form" onSubmit={handleSignin}>
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
              placeholder="••••••••"
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
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>


        {message && (
          <p className={`status-msg ${message.includes("Error") ? "error" : "success"}`}>
            {message}
          </p>
        )}

        <p className="auth-footer">
          Don't have an account?
          <Link to="/signup" className="auth-link">Create Account</Link>
        </p>

        <p className="auth-footer">
          <Link to="/" className="auth-link">← Return to Home</Link>
        </p>
      </div>
    </div>
  );
}
