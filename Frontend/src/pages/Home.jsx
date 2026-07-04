import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

// 10 Features list
const FEATURES = [
  { icon: "🎙️", title: "AI Voice Conversations", desc: "Speak naturally with our advanced AI voices that mimic real human cadence and rhythm." },
  { icon: "🗣️", title: "Pronunciation Feedback", desc: "Get targeted pointers on how to articulate specific vowel sounds and syllable accents." },
  { icon: "🧠", title: "Grammar Correction", desc: "See corrections on phrasing, verb tenses, and context in real-time." },
  { icon: "📖", title: "Reading Practice", desc: "Read passages aloud and check your speed, pauses, and articulation." },
  { icon: "🎧", title: "Shadowing Practice", desc: "Repeat sentences directly after a native speaker to master rhythm and speech flow." },
  { icon: "💼", title: "AI Interview Simulator", desc: "Prepare for jobs with realistic tech, product, or sales interview prompts." },
  { icon: "✈️", title: "Real-Life Conversation Scenarios", desc: "Simulate speaking at a restaurant, hotel front desk, airport customs, or retail shopping." },
  { icon: "📊", title: "Progress Tracking", desc: "Monitor grammar accuracy over time and view customized vocab review sheets." },
  { icon: "🤖", title: "Multiple AI Avatars", desc: "Switch accents, speaking speeds, and avatar personalities anytime." },
  { icon: "🎯", title: "Personalized Learning Experience", desc: "Vocabulary adapts dynamically to match your verbal level and flow." }
];

export default function Home() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="home-container">
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
          <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>Features</a>
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
              Practice real conversations, improve pronunciation, receive grammar feedback, and build confidence using your AI speaking partner.
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

      {/* 3. Features Section */}
      <section id="features" className="section-padding">
        <div className="section-header-centered">
          <span className="section-label">FEATURES</span>
          <h3 className="section-title">Everything You Need to Master Spoken English</h3>
        </div>
        <div className="why-grid">
          {FEATURES.map((feat, index) => (
            <div key={index} className="why-card">
              <div className="why-icon">{feat.icon}</div>
              <h5>{feat.title}</h5>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works Section */}
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

      {/* 5. AI Tutor Preview Section */}
      <section className="section-padding">
        <div className="preview-split">
          <div className="preview-info">
            <span className="section-label">AI TUTOR PREVIEW</span>
            <h3 className="section-title">Real-Time Conversation & Score Analysis</h3>
            <p className="section-desc-para">
              Experience what it is like to practice with a structured, instant feedback system. Check pronunciation metrics and grammar adjustments in a split second.
            </p>
            <div className="stats-box">
              <div className="metric">
                <span className="val">98%</span>
                <span className="lbl">Grammar</span>
              </div>
              <div className="metric">
                <span className="val">92%</span>
                <span className="lbl">Fluency</span>
              </div>
              <div className="metric">
                <span className="val">95%</span>
                <span className="lbl">Confidence</span>
              </div>
            </div>
          </div>
          <div className="preview-chat-container">
            <div className="chat-window">
              <div className="chat-header-bar">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="chat-title">VocMate Live Feedback</span>
              </div>
              <div className="chat-body">
                <div className="preview-bubble user">
                  <p>I would like to ordering a coffee, please.</p>
                </div>
                <div className="preview-bubble feedback">
                  <div className="fb-tag">💡 GRAMMAR CORRECTION</div>
                  <p>Instead of <strong>"to ordering"</strong>, say <strong>"to order"</strong>.</p>
                  <p className="alternative">"I would like to order a coffee, please."</p>
                </div>
                <div className="preview-bubble ai">
                  <p>Sure! Would you like milk or sugar in your coffee?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Section */}
      <section className="final-cta-section">
        <div className="final-cta-card">
          <h3>Ready to Speak English with Confidence?</h3>
          <p>Join thousands of learners practicing speaking daily in a judgment-free environment.</p>
          <button className="primary-btn pulse" onClick={() => navigate("/signup")}>
            Start Learning
          </button>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="footer-section">
        <div className="footer-links-grid">
          <div className="footer-brand-column">
            <h2>VOCMATE</h2>
            <p>An intelligent AI English partner designed to build your spoken confidence.</p>
          </div>
          <div className="footer-links-col">
            <h6>Navigation</h6>
            <a href="#features">Features</a>
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
