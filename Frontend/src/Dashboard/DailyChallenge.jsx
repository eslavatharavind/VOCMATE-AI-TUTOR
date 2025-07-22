import React from 'react';

const DailyChallenge = ({
  dailyChallenge,
  isListening,
  spokenText,
  startListening,
  submitDailyChallenge
}) => (
  <div className="daily-challenge">
    <h3>Daily Speaking Challenge</h3>
    {dailyChallenge && (
      <div className="challenge-content">
        <div className="challenge-display">
          <h4>Today's Challenge:</h4>
          <p className="challenge-text">{dailyChallenge.challenge}</p>
        </div>
        <div className="recording-controls">
          <button 
            onClick={startListening} 
            disabled={isListening}
            className="record-btn"
          >
            {isListening ? 'Listening...' : 'Start Recording'}
          </button>
          {spokenText && (
            <div className="spoken-text">
              <h4>Your Response:</h4>
              <p>{spokenText}</p>
              <button onClick={submitDailyChallenge} className="submit-btn">
                Submit Challenge
              </button>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

export default DailyChallenge; 