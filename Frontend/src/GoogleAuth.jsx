
// src/GoogleAuth.jsx
import React from "react";
import { supabase } from "./supabaseClient";

export default function GoogleAuth() {
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173/dashboard", // Adjust to your local or prod URL
      },
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
    }
  };

  return (
    <button onClick={handleGoogleSignIn} className="google-signin-btn">
      Continue with Google
    </button>
  );
}
