import React from 'react';

const ShadowingMode = ({
  shadowingSentence,
  shadowingFeedback,
  isListening,
  spokenText,
  getShadowingSentence,
  startListening,
  evaluateShadowing,
  playAudio
}) => (
  <div className="shadowing-mode">
    <h3>Shadowing Practice</h3>
    <button onClick={getShadowingSentence} className="primary-btn">
      Get New Sentence
    </button>
    {shadowingSentence && (
      <div className="shadowing-content">
        <div className="sentence-display">
          <h4>Listen and Repeat:</h4>
          <p className="sentence">{shadowingSentence}</p>
          <button 
            onClick={() => {
              playAudio && playAudio(shadowingSentence);
            }}
            className="play-btn"
          >
            🔊 Play Audio
          </button>
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
              <h4>You said:</h4>
              <p>{spokenText}</p>
              <button onClick={evaluateShadowing} className="evaluate-btn">
                Evaluate
              </button>
            </div>
          )}
        </div>
        {shadowingFeedback && (
          <div className="feedback-display">
            <h4>Feedback:</h4>
            <p>Accuracy: {shadowingFeedback.accuracy.toFixed(1)}%</p>
            <p>Score: {shadowingFeedback.score.toFixed(1)}/100</p>
            {shadowingFeedback.missed_words.length > 0 && (
              <p>Missed words: {shadowingFeedback.missed_words.join(', ')}</p>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);

export default ShadowingMode; 