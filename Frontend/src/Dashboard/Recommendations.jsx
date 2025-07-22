import React from 'react';

const Recommendations = ({ recommendations, recordSession }) => (
  <div className="recommendations">
    <h3>Personalized Recommendations</h3>
    <div className="recommendations-content">
      <h4>Practice These Topics to Improve:</h4>
      <div className="recommendation-list">
        {recommendations.map((topic, index) => (
          <div key={index} className="recommendation-item">
            <span className="topic-name">{topic}</span>
            <button 
              onClick={() => recordSession(topic, 75)} // Simulate practice
              className="practice-btn"
            >
              Practice Now
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Recommendations; 