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
      {/* Cinematic decorative background elements */}
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
          <h1 className="topics-title">Choose Your Path</h1>
          <p className="topics-subtitle">Select a topic or start a free-flowing conversation</p>
        </header>

        {/* --- Talk with Tutor: The Primary Action --- */}
        <div className="tutor-hero-card" onClick={handleTutorClick}>
          <div className="tutor-hero-content">
            <h3>Talk with Tutor 🚀</h3>
            <p>Start a normal, free-flowing conversation to practice your overall fluency.</p>
          </div>
          <div className="tutor-hero-icon">
            💬
          </div>
        </div>

        {/* --- Topic Selection Grid --- */}
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
      </div>
    </div>
  );
}