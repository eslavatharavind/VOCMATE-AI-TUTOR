import React from "react";
import { useNavigate } from "react-router-dom";
// Import the refined dashboard-aligned styling for the home page
import "./Home.css";

// Home component: The gateway to the VocMate experience
export default function Home() {
  // Navigation hook for routing to signin/signup
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Decorative background elements Ported from the high-end dashboard */}
      <div className="bg-blob-1"></div>
      <div className="bg-blob-2"></div>
      <div className="home-bg-glow"></div>

      {/* Premium Fixed Navigation Header */}
      <header className="home-header">
        <div className="brand">
          <span className="brand-icon">🚀</span>
          <h1 className="brand-name">VOCMATE</h1>
        </div>
        <nav className="header-nav">
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#features" className="nav-link">Features</a>
          <button className="nav-auth-btn" onClick={() => navigate("/signin")}>
            GO TO DASHBOARD
          </button>
        </nav>
      </header>

      {/* Hero Section: The First Impression */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-eyebrow">AI-Powered English Speaking Partner</span>
          <h2 className="hero-title">
            Unlock Your Fluency with <span className="text-highlight">VOCMATE</span>
          </h2>
          <p className="hero-subtitle">
            VOCMATE is an intelligent English speaking assistant designed to help learners
            practice real-world conversations, improve fluency, and build confidence
            through interactive voice and text-based practice.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => navigate("/signup")}>
              START PRACTICING NOW
            </button>
            <button className="secondary-btn" onClick={() => document.getElementById('overview').scrollIntoView()}>
              EXPLORE OVERVIEW
            </button>
          </div>
        </div>
      </section>

      {/* Overview Section: The Mission */}
      <section id="overview" className="section-padding">
        <div className="lux-glass-card overview-card">
          <span className="section-label">OVERVIEW</span>
          <h3 className="section-title">A Judgment-Free Learning Zone</h3>
          <p className="section-description">
            Speaking English confidently requires consistent practice. VOCMATE provides a structured,
            judgment-free environment where users can communicate naturally and receive
            instant AI-driven feedback on grammar, vocabulary, and sentence formation.
          </p>
        </div>
      </section>

      {/* How It Works: The Process */}
      <section id="how-it-works" className="section-padding">
        <div className="section-header-centered">
          <span className="section-label">THE PROCESS</span>
          <h3 className="section-title">How VOCMATE Works</h3>
        </div>

        <div className="step-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h4>Speak or Type</h4>
            <p>Communicate using voice or text, just like a real conversation with a human tutor.</p>
          </div>
          <div className="step-card active-step">
            <div className="step-number">02</div>
            <h4>AI-Driven Response</h4>
            <p>VOCMATE responds instantly with short, clear, and contextual replies tailored to you.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h4>Continuous Improvement</h4>
            <p>Receive corrections and guidance that improve your fluency steadily over time.</p>
          </div>
        </div>
      </section>

      {/* Core Features: The Toolset */}
      <section id="features" className="section-padding">
        <div className="section-header-centered">
          <span className="section-label">TECHNOLOGY</span>
          <h3 className="section-title">Core Features</h3>
        </div>
        <div className="premium-grid">
          <div className="lux-glass-card feat-item">
            <div className="feat-icon">🤖</div>
            <h5>AI English Tutor</h5>
            <p>Real-time conversation practice with an intelligent companion.</p>
          </div>
          <div className="lux-glass-card feat-item">
            <div className="feat-icon">🎙️</div>
            <h5>Voice Interaction</h5>
            <p>Full voice-to-voice support with standard and premium AI voices.</p>
          </div>
          <div className="lux-glass-card feat-item">
            <div className="feat-icon">✍️</div>
            <h5>Instant Corrections</h5>
            <p>Real-time grammar, vocabulary, and sentence structure feedback.</p>
          </div>
          <div className="lux-glass-card feat-item">
            <div className="feat-icon">🎭</div>
            <h5>Scenario Practice</h5>
            <p>Roleplay based on interviews, daily life, or travel situations.</p>
          </div>
          <div className="lux-glass-card feat-item">
            <div className="feat-icon">📖</div>
            <h5>Reading & Shadowing</h5>
            <p>Techniques designed specifically for pronunciation improvement.</p>
          </div>
          <div className="lux-glass-card feat-item">
            <div className="feat-icon">🎯</div>
            <h5>Progress Tracking</h5>
            <p>Visual scores, level-ups, and daily challenges to keep you motivated.</p>
          </div>
        </div>
      </section>

      {/* Designed For: The Audience */}
      <section className="section-padding alternate-bg">
        <div className="audience-grid">
          <div className="audience-content">
            <span className="section-label">WHO IS IT FOR?</span>
            <h3 className="section-title">Designed For You</h3>
            <ul className="audience-list">
              <li><span>🎓</span> Students and beginners learning spoken English</li>
              <li><span>💼</span> Job seekers preparing for interviews</li>
              <li><span>🏙️</span> Professionals improving workplace communication</li>
              <li><span>✨</span> Anyone practicing daily conversation and fluency</li>
            </ul>
          </div>
          <div className="lux-glass-card why-choose-card">
            <h4 className="card-mini-title">Why Choose VOCMATE?</h4>
            <ul className="benefits-list">
              <li>Practice without fear or hesitation</li>
              <li>Beginner-friendly and easy to use</li>
              <li>Short, focused AI responses</li>
              <li>Accessible anytime, anywhere</li>
              <li>Free voice support available</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sample Interaction: Preview the AI */}
      <section className="section-padding">
        <div className="interaction-preview">
          <h3 className="preview-title">Sample Interaction</h3>
          <div className="chat-mockup">
            <div className="mock-message user">
              <p>I want to improve my English speaking skills</p>
            </div>
            <div className="mock-message assistant">
              <p>That’s great. Tell me about your daily routine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="lux-glass-card cta-card">
          <h3>Get Started Today</h3>
          <p>Start practicing English conversations with VOCMATE and develop confidence through consistent speaking practice.</p>
          <button className="primary-btn pulse" onClick={() => navigate("/signup")}>
            START PRACTICING NOW
          </button>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>VOCMATE</h2>
            <p>An AI-powered platform for confident English communication.</p>
          </div>
          <div className="footer-info">
            <p>© 2026 VOCMATE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
