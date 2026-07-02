import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="landing-page-container">
      {/* Decorative ambient glowing backdrops */}
      <div className="bg-blob-1"></div>
      <div className="bg-blob-2"></div>
      <div className="home-bg-glow"></div>

      {/* 1. Premium Sticky Header */}
      <header className="home-header">
        <div className="brand" onClick={() => navigate("/")}>
          <span className="brand-icon">🚀</span>
          <h1 className="brand-name">VOCMATE</h1>
        </div>

        <button 
          className={`menu-toggle ${isMenuOpen ? "active" : ""}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          aria-label="Toggle Menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <nav className={`header-nav ${isMenuOpen ? "active" : ""}`}>
          <a href="#how-it-works" className="nav-link" onClick={() => setIsMenuOpen(false)}>How It Works</a>
          <button className="nav-signin-btn" onClick={() => { setIsMenuOpen(false); navigate("/signin"); }}>
            Login
          </button>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-content-left">
            <div className="hero-pill">
              <span>AI-POWERED ENGLISH SPEAKING PARTNER</span>
            </div>
            <h2 className="hero-title">
              Speak English Confidently with Your Personal <span className="text-highlight">VOCMATE</span> AI Tutor
            </h2>
            <p className="hero-subtitle">
              Practice real conversations, improve pronunciation, receive grammar feedback, and build confidence with your AI speaking partner.
            </p>
            <div className="hero-actions">
              <button className="primary-btn pulse" onClick={() => navigate("/signup")}>
                Start Learning
              </button>
              <button className="secondary-btn" onClick={() => document.getElementById('how-it-works').scrollIntoView()}>
                Watch Demo
              </button>
            </div>
          </div>

          <div className="hero-content-right">
            <div className="visual-hero-card">
              <div className="visual-avatar-wrapper">
                <div className="visual-avatar">🤖</div>
                <div className="visual-glow-ring"></div>
              </div>
              <div className="voice-waves">
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
              </div>
              <div className="visual-chat-mock">
                <div className="mock-chat-bubble ai">
                  <span>Hello! I'm your AI speaking coach. Go ahead, speak!</span>
                </div>
                <div className="mock-chat-bubble user">
                  <span>I want to improve my speaking skills...</span>
                </div>
              </div>
              <div className="visual-mic-indicator">
                <span className="mic-icon">🎙️</span>
                <span className="mic-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="section-padding alternate-bg">
        <div className="section-header-centered">
          <span className="section-label">THE PROCESS</span>
          <h3 className="section-title">How VOCMATE Works</h3>
        </div>
        <div className="timeline-grid">
          <div className="timeline-step">
            <div className="timeline-num">01</div>
            <h5>Choose Your AI Avatar</h5>
            <p>Select your favorite AI coach, speaking tempo, and accent profile.</p>
          </div>
          <div className="timeline-connector"></div>
          <div className="timeline-step">
            <div className="timeline-num">02</div>
            <h5>Select a Practice Mode</h5>
            <p>Pick reading passages, open speech chats, or airport/office roleplay simulations.</p>
          </div>
          <div className="timeline-connector"></div>
          <div className="timeline-step">
            <div className="timeline-num">03</div>
            <h5>Start Speaking</h5>
            <p>Talk naturally using voice inputs. VOCMATE transcribes your voice in real-time.</p>
          </div>
          <div className="timeline-connector"></div>
          <div className="timeline-step">
            <div className="timeline-num">04</div>
            <h5>Receive Instant AI Feedback</h5>
            <p>See immediate suggestions on accent improvement, tenses, and alternative phrasing.</p>
          </div>
        </div>
      </section>

      {/* 4. Call to Action Section */}
      <section className="final-cta-section">
        <div className="final-cta-card">
          <h3>Ready to Speak English with Confidence?</h3>
          <p>Join thousands of learners practicing speaking daily in a judgment-free environment.</p>
          <button className="primary-btn pulse" onClick={() => navigate("/signup")}>
            Start Learning
          </button>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="footer-section">
        <div className="footer-links-grid">
          <div className="footer-brand-column">
            <h2>VOCMATE</h2>
            <p>An intelligent AI English partner designed to build your spoken confidence.</p>
          </div>
          <div className="footer-links-col">
            <h6>Navigation</h6>
            <a href="#how-it-works">How It Works</a>
          </div>
          <div className="footer-links-col">
            <h6>Legal</h6>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms & Conditions</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 VOCMATE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
