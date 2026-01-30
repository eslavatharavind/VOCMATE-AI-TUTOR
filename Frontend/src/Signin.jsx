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

  // Google OAuth Logic: Robust social login integration
  const handleGoogleSignIn = async () => {
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage("Google Sign-in error: " + error.message);
      setLoading(false);
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
            {loading ? "Verifying..." : "Sign in to Dashboard"}
          </button>
        </form>

        <div className="auth-divider">
          <div className="line"></div>
          <span className="divider-text">OR CONTINUE WITH</span>
          <div className="line"></div>
        </div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 533.5 544.3">
            <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.6-34.3-4.6-50.7H272v95.9h146.9c-6.3 34.3-25 63.4-53.6 82.9v68h86.7c50.7-46.8 79.5-115.6 79.5-196.1z" />
            <path fill="#34a853" d="M272 544.3c72.7 0 133.7-24 178.2-65.2l-86.7-68c-24.1 16.2-55.1 25.7-91.5 25.7-70.4 0-130-47.6-151.3-111.6h-89.7v69.7c44.4 87.2 134.7 149.4 241 149.4z" />
            <path fill="#fbbc04" d="M120.7 327.2c-10.9-32.8-10.9-68.4 0-101.2v-69.7h-89.7c-38.6 75.6-38.6 165.7 0 241.3l89.7-69.7z" />
            <path fill="#ea4335" d="M272 107.7c38.7 0 73.5 13.3 100.9 39.3l75.7-75.7C404.8 25.7 347.6 0 272 0 165.7 0 75.4 62.2 31 149.4l89.7 69.7c21.1-64 80.7-111.4 151.3-111.4z" />
          </svg>
          Google Account
        </button>

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
