import React from "react";
import { useNavigate } from "react-router-dom";
import "./PracticeTopics.css";

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

export default function PracticeTopics() {
  const navigate = useNavigate();

  const handleTopicClick = (topic) => {
    navigate(`/practice/${encodeURIComponent(topic)}`);
  };

  return (
    <div className="practice-topics-bg">
      <div style={{ maxWidth: 500, margin: "60px auto", textAlign: "center" }}>
        <button className="back-btn right" onClick={() => navigate('/dashboard')} style={{marginBottom: 18}}>&larr; Back to Dashboard</button>
        <h2>Select a Practice Topic</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {practiceTopics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => handleTopicClick(topic)}
              style={{
                padding: "16px 0",
                fontSize: "1.1rem",
                borderRadius: 10,
                border: "2px solid #667eea",
                background: "#f7f8fa",
                color: "#333",
                margin: "8px 0",
                cursor: "pointer",
                fontWeight: 600,
                transition: "background 0.2s, color 0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
              onMouseOut={e => e.currentTarget.style.background = '#f7f8fa'}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 