import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUser } from "../context/UserContext";
import "./Dashboard.css";
import AdvancedFeatures from "./AdvancedFeatures";

const avatarList = [
  { label: "Alex", id: "UgBBYS2sOqTuMpoF3BR0", img: "UgBBYS2sOqTuMpoF3BR0.png" },
  { label: "Mark", id: "ErXwobaYiN019PkySvjV", img: "ErXwobaYiN019PkySvjV.png" },
  { label: "Bill", id: "TX3LPaxmHKxFdv7VOQHJ", img: "TX3LPaxmHKxFdv7VOQHJ.png" },
  { label: "Lily", id: "cgSgspJ2msm6clMCkdW9", img: "cgSgspJ2msm6clMCkdW9.png" },
  { label: "Anne", id: "21m00Tcm4TlvDq8ikWAM", img: "21m00Tcm4TlvDq8ikWAM.png" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { voiceId, setvoiceId } = useUser();
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [userId, setUserId] = useState('user123');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  // Refs for navigation
  const introRef = useRef(null);
  const avatarRef = useRef(null);

  // Carousel logic
  const visibleAvatars = [
    avatarList[(carouselIndex - 1 + avatarList.length) % avatarList.length],
    avatarList[carouselIndex],
    avatarList[(carouselIndex + 1) % avatarList.length]
  ];

  // Typing animation for subheading
  const typingTexts = [
    "Your AI English Tutor",
    "Practice. Learn. Succeed!",
    "Speak English with Confidence"
  ];
  const [typingIndex, setTypingIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentText = typingTexts[typingIndex];
    let typingSpeed = isDeleting ? 60 : 120;
    let timeout;
    if (!isDeleting && charIndex < currentText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, typingSpeed);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayedText(currentText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, typingSpeed);
    } else if (!isDeleting && charIndex === currentText.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1200);
    } else if (isDeleting && charIndex === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setTypingIndex((typingIndex + 1) % typingTexts.length);
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, typingIndex, typingTexts]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const handlePracticeClick = (topic) => {
    // Navigate to practice session with the selected topic
    navigate(`/practice/${encodeURIComponent(topic)}`);
  };

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev - 1 + avatarList.length) % avatarList.length);
  };
  const handleNext = () => {
    setCarouselIndex((prev) => (prev + 1) % avatarList.length);
  };

  // Clicking the center avatar navigates to practice topics
  const handleCenterAvatarClick = () => {
    setvoiceId(visibleAvatars[1].id);
    navigate('/practice-topics');
  };

  // Navigation bar actions
  const handleNav = (section) => {
    setNavOpen(false);
    if (section === 'intro' && introRef.current) {
      introRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (section === 'avatars' && avatarRef.current) {
      avatarRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (section === 'advanced') {
      setShowAdvancedFeatures((prev) => !prev);
    } else if (section === 'signout') {
      handleSignOut();
    }
  };

  return (
    <div className="dashboard">
      {/* Horizontal Navigation Bar */}
      <div className="dashboard-nav-horizontal">
        {!navOpen && (
          <button className="nav-toggle-btn" onClick={() => setNavOpen(true)} title="Open Menu">
            <span role="img" aria-label="Open">☰</span>
          </button>
        )}
        {navOpen && (
          <div className="nav-bar-content">
            <button className="nav-toggle-btn close" onClick={() => setNavOpen(false)} title="Close Menu">
              <span role="img" aria-label="Close">✕</span>
            </button>
            <button className="nav-btn" onClick={() => handleNav('intro')} title="Intro">
              <span role="img" aria-label="Intro">🏠</span>
              <span className="nav-label">Intro</span>
            </button>
            <button className="nav-btn" onClick={() => handleNav('avatars')} title="Avatars">
              <span role="img" aria-label="Avatars">🧑‍🤝‍🧑</span>
              <span className="nav-label">Avatars</span>
            </button>
            <button className="nav-btn" onClick={() => handleNav('advanced')} title="Show Advanced Features">
              <span role="img" aria-label="Advanced">✨</span>
              <span className="nav-label">Advanced</span>
            </button>
            <button className="nav-btn" onClick={() => handleNav('signout')} title="Sign Out">
              <span role="img" aria-label="Sign Out">🚪</span>
              <span className="nav-label">Sign Out</span>
            </button>
          </div>
        )}
      </div>
      <div className="dashboard-header">
        <div className="header-left">
          <div className="dashboard-intro-robot-row">
            <span className="robot-icon" aria-label="Robot" role="img">
              {/* Inline SVG for robot icon */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="14" width="32" height="22" rx="8" fill="#e0e7ef" stroke="#222" strokeWidth="2"/>
                <rect x="18" y="6" width="12" height="8" rx="4" fill="#b3c6e0" stroke="#222" strokeWidth="2"/>
                <circle cx="16" cy="25" r="3" fill="#222"/>
                <circle cx="32" cy="25" r="3" fill="#222"/>
                <rect x="20" y="32" width="8" height="2" rx="1" fill="#222"/>
                <rect x="6" y="20" width="4" height="8" rx="2" fill="#b3c6e0" stroke="#222" strokeWidth="2"/>
                <rect x="38" y="20" width="4" height="8" rx="2" fill="#b3c6e0" stroke="#222" strokeWidth="2"/>
              </svg>
            </span>
            <h1>VocMate AI Tutor</h1>
          </div>
          <div className="dashboard-intro-typing">
            <span className="typing-text">{displayedText}</span>
            <span className="typing-cursor">|</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {showAdvancedFeatures ? (
          <AdvancedFeatures userId={userId} onBack={() => setShowAdvancedFeatures(false)} />
        ) : (
          <div className="welcome-section">
            <h2 ref={introRef}>VOCMATE </h2>
            <h3>AI SPEAKING TUTOR</h3>
            <p>Improve Your English Speaking Skills With Our AI Conversation Partner.</p>
            <div className="animated-avatar-carousel-section" ref={avatarRef}>
              <h3>Choose Your Avatar</h3>
              <div className="animated-avatar-carousel-wrapper">
                <button className="carousel-arrow" onClick={handlePrev}>&lt;</button>
                <div className="animated-avatar-carousel">
                  {/* Left Avatar */}
                  <div className="carousel-avatar left">
                    <img
                      src={`/avatars/${visibleAvatars[0].img}`}
                      alt={visibleAvatars[0].label}
                      className="avatar-image"
                      draggable={false}
                    />
                    <div className="avatar-label">{visibleAvatars[0].label}</div>
                  </div>
                  {/* Center Avatar */}
                  <div className="carousel-avatar center" onClick={handleCenterAvatarClick} title="Go to Practice">
                    <img
                      src={`/avatars/${visibleAvatars[1].img}`}
                      alt={visibleAvatars[1].label}
                      className="avatar-image"
                      draggable={false}
                    />
                    <div className="avatar-label">{visibleAvatars[1].label}</div>
                  </div>
                  {/* Right Avatar */}
                  <div className="carousel-avatar right">
                    <img
                      src={`/avatars/${visibleAvatars[2].img}`}
                      alt={visibleAvatars[2].label}
                      className="avatar-image"
                      draggable={false}
                    />
                    <div className="avatar-label">{visibleAvatars[2].label}</div>
                  </div>
                </div>
                <button className="carousel-arrow" onClick={handleNext}>&gt;</button>
              </div>
            </div>

            <div className="feature-highlights">
              <div className="feature-card">
                <h3>🎤 Reading Practice</h3>
                <p>Practice reading with auto-scrolling text and real-time feedback</p>
              </div>
              <div className="feature-card">
                <h3>🤖 AI Tutor</h3>
                <p>Get personalized help with grammar, vocabulary, and pronunciation</p>
              </div>
              <div className="feature-card">
                <h3>📊 Progress Tracking</h3>
                <p>Monitor your learning progress with detailed analytics</p>
              </div>
              <div className="feature-card">
                <h3>🎯 Daily Challenges</h3>
                <p>Complete daily speaking challenges to improve fluency</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 