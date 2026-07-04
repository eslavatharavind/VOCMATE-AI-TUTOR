import React from "react";
import { useNavigate } from "react-router-dom";
import "./PracticeTopics.css";

// Extended list of practice topics for a richer feel
const practiceTopics = [
  "Basic Greetings",
  "Introducing Yourself",
  "Daily Conversations",
  "Travel English",
  "Business English",
  "Academic English",
  "Social Media English",
  "Job Interviews",
  "Phone Conversations",
  "Restaurant English"
];

// Quick-start guidelines shown right here so learners know what to expect
const sessionGuidelines = [
  { icon: "🎧", text: "Use a working microphone & camera in a quiet, well-lit space." },
  { icon: "🗣️", text: "Speak clearly and naturally — don't hesitate to ask questions." },
  { icon: "🧠", text: "Practice pronunciation, grammar, vocabulary and fluency." },
  { icon: "⏱️", text: "Take your time. Learning is a process, not a race." },
  { icon: "💡", text: "Ask for explanations, examples or corrections anytime." },
  { icon: "🔒", text: "Your privacy is respected — no audio or video is ever saved." }
];

// PracticeTopics: The sophisticated gateway to AI Tutoring
export default function PracticeTopics() {
  const navigate = useNavigate();

  const handleTopicClick = (topic) => {
    navigate(`/practice/${encodeURIComponent(topic)}`);
  };

  const handleTutorClick = () => {
    navigate(`/practice/General conversation`);
  };

  return (
    <div className="practice-topics-bg">
      {/* Ambient glowing backdrops (dashboard palette) */}
      <div className="topics-blob topics-blob-1"></div>
      <div className="topics-blob topics-blob-2"></div>

      {/* Premium Back Navigation */}
      <div className="back-btn-wrapper">
        <button onClick={() => navigate('/dashboard')} className="premium-back-btn">
          ← Back to Dashboard
        </button>
      </div>

      <div className="topics-container">
        <header className="topics-header">
          <span className="topics-eyebrow">AI SPEAKING SESSION</span>
          <h1 className="topics-title">Choose Your Path</h1>
          <p className="topics-subtitle">Select a topic or start a free-flowing conversation with your AI tutor</p>
        </header>

        {/* --- Talk with Tutor: The Primary Action --- */}
        <div className="tutor-hero-card" onClick={handleTutorClick}>
          <div className="tutor-hero-content">
            <h3>Talk with Tutor 🚀</h3>
            <p>Start a normal, free-flowing conversation to practice your overall fluency.</p>
            <span className="tutor-hero-cta">Start free chat →</span>
          </div>
          <div className="tutor-hero-icon">
            💬
          </div>
        </div>

        {/* --- Topic Selection Grid --- */}
        <div className="topics-section-label">
          <span>Or pick a focused topic</span>
        </div>
        <div className="topics-grid">
          {practiceTopics.map((topic, idx) => (
            <button
              key={idx}
              className="topic-btn"
              onClick={() => handleTopicClick(topic)}
            >
              <span>{topic}</span>
              <span className="topic-arrow">→</span>
            </button>
          ))}
        </div>

        {/* --- Built-in Session Guidelines --- */}
        <div className="topics-guidelines">
          <h2 className="guidelines-title">📋 Before You Begin</h2>
          <p className="guidelines-subtitle">A few quick tips to get the most out of your session.</p>
          <div className="guidelines-grid">
            {sessionGuidelines.map((g, idx) => (
              <div key={idx} className="guideline-item">
                <span className="guideline-icon">{g.icon}</span>
                <span className="guideline-text">{g.text}</span>
              </div>
            ))}
          </div>
          <p className="guidelines-hint">
            Pick any option above — you'll enable your camera &amp; microphone on the next screen to begin.
          </p>
        </div>
      </div>
    </div>
  );
}
