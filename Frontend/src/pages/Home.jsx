
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Top Navigation */}
      <header className="topbar">
        <div className="top-left">
          
          
        </div>
        <nav className="top-nav">
          <a href="#intro">Intro</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
          <button className="signin-btn" onClick={() => navigate("/signin")}>
            Sign In
          </button>
        </nav>
      </header>

      {/* Scrollable Page Sections */}
      <h1 className="title">VOCMATE</h1>
          <p className="subtitle">Your AI-powered English Speaking Partner</p>
      <main className="main-content">
        
        <section id="intro" className="section intro">
          <h2 className="animated-subtitle">AI-Powered English Speaking Partner</h2>
          <p>
            VOCMATE helps you practice and perfect your English through real-time
            conversations, adapting to your fluency level and tracking your
            progress through intelligent analysis.
          </p>
        </section>

        <section id="features" className="section features">
          <h2>Key Features</h2>
          <ul>
            <li><strong>Multimodal Interaction:</strong> Voice-to-text, text-to-voice, and text chat support</li>
            <li><strong>Topic Library:</strong> Adaptive modules like Travel, Business, and Daily Life</li>
            <li><strong>Dynamic Avatars:</strong> Choose tutors with accents or styles</li>
            <li><strong>Real-Time Feedback:</strong> Grammar, vocabulary, and pronunciation suggestions</li>
            <li><strong>Progress Analytics:</strong> Dashboard with streaks, goals, and vocabulary</li>
          </ul>
        </section>

        <section id="pricing" className="section pricing">
          <h2>Pricing</h2>
          <div className="pricing-cards">
            <div className="card">
              <h3>Free</h3>
              <p>Limited topics and feedback</p>
              <p className="price">$0/month</p>
            </div>
            <div className="card featured">
              <h3>Pro</h3>
              <p>Full access with feedback and analytics</p>
              <p className="price">$9.99/month</p>
            </div>
            <div className="card">
              <h3>Enterprise</h3>
              <p>Custom plans for institutions</p>
              <p className="price">Contact Us</p>
            </div>
          </div>
        </section>

        <section id="contact" className="section contact">
          <h2>Contact</h2>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </section>
      </main>
    </div>
  );
}
