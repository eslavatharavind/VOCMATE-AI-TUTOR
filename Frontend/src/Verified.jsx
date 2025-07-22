
// src/Verified.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Verified() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Email Verified!</h2>
      <p>Your email has been successfully confirmed.</p>
      <p><Link to="/signin">Click here to sign in</Link></p>
    </div>
  );
}
