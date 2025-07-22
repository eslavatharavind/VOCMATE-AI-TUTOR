import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    border: "2px solid #000",
    outline: "6px solid white",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "0.5rem",
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  passwordContainer: {
    position: "relative",
  },
  inputWithIcon: {
    width: "100%",
    padding: "0.75rem",
    paddingRight: "2.5rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  eyeIcon: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    userSelect: "none",
  },
  button: {
    backgroundColor: "#000",
    color: "#fff",
    padding: "0.75rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  dividerWrapper: {
    display: "flex",
    alignItems: "center",
    margin: "1.5rem 0",
    gap: "0.5rem",
  },
  divider: {
    flex: 1,
    height: "1px",
    backgroundColor: "#ccc",
  },
  orText: {
    fontSize: "0.75rem",
    color: "#888",
  },
  googleButton: {
    padding: "0.75rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontWeight: "500",
  },
  googleIcon: {
    width: "18px",
    height: "18px",
  },
  message: {
    color: "red",
    marginTop: "1rem",
    textAlign: "center",
  },
  footerText: {
    textAlign: "center",
    marginTop: "1.5rem",
  },
  link: {
    color: "#000",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:5173/", // Change to your deployed site in prod
        data: { username },
      },
    });

    setLoading(false);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("✅ Check your email to confirm your signup.");
    }
  };

  const handleGoogleSignup = async () => {
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173/dashboard", // Replace with your real dashboard route
      },
    });

    if (error) {
      setMessage("Google Sign-up error: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create an account</h2>
        <p style={styles.subtitle}>Sign up to get started</p>

        <form style={styles.form} onSubmit={handleSignup}>
          <label>Username</label>
          <input
            style={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <div style={styles.passwordContainer}>
            <input
              style={styles.inputWithIcon}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <div style={styles.dividerWrapper}>
          <hr style={styles.divider} />
          <span style={styles.orText}>OR CONTINUE WITH</span>
          <hr style={styles.divider} />
        </div>

        <button
          type="button"
          style={styles.googleButton}
          onClick={handleGoogleSignup}
          disabled={loading}
          aria-label="Sign up with Google"
        >
          <svg
            style={styles.googleIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 533.5 544.3"
          >
            <path
              fill="#4285f4"
              d="M533.5 278.4c0-17.4-1.6-34.3-4.6-50.7H272v95.9h146.9c-6.3 34.3-25 63.4-53.6 82.9v68h86.7c50.7-46.8 79.5-115.6 79.5-196.1z"
            />
            <path
              fill="#34a853"
              d="M272 544.3c72.7 0 133.7-24 178.2-65.2l-86.7-68c-24.1 16.2-55.1 25.7-91.5 25.7-70.4 0-130-47.6-151.3-111.6h-89.7v69.7c44.4 87.2 134.7 149.4 241 149.4z"
            />
            <path
              fill="#fbbc04"
              d="M120.7 327.2c-10.9-32.8-10.9-68.4 0-101.2v-69.7h-89.7c-38.6 75.6-38.6 165.7 0 241.3l89.7-69.7z"
            />
            <path
              fill="#ea4335"
              d="M272 107.7c38.7 0 73.5 13.3 100.9 39.3l75.7-75.7C404.8 25.7 347.6 0 272 0 165.7 0 75.4 62.2 31 149.4l89.7 69.7c21.1-64 80.7-111.4 151.3-111.4z"
            />
          </svg>
          Continue with Google
        </button>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/signin" style={styles.link}>
            Sign in
          </Link>
        </p>

        <p style={styles.footerText}>
          <Link to="/" style={styles.link}>
            ← Go back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
