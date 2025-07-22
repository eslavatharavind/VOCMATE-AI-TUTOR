import React from 'react';

const ConversationSimulator = ({
  conversationScenarios,
  selectedScenario,
  conversationHistory,
  startConversation,
  setSelectedScenario,
  sendConversationMessage
}) => (
  <div className="conversation-simulator">
    <h3>Conversation Simulator</h3>
    {!selectedScenario ? (
      <div className="scenario-selection">
        <h4>Choose a Scenario:</h4>
        <div className="scenario-buttons">
          {conversationScenarios.map((scenario, index) => (
            <button 
              key={index} 
              onClick={() => startConversation(scenario)}
              className="scenario-btn"
            >
              {scenario.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    ) : (
      <div className="conversation-interface">
        <div className="conversation-header">
          <h4>Role: {selectedScenario.scenario.role}</h4>
          <button onClick={() => setSelectedScenario(null)}>End Conversation</button>
        </div>
        <div className="conversation-messages">
          {conversationHistory.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <span className="message-text">{msg.message}</span>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
        <div className="message-input">
          <input
            type="text"
            placeholder="Type your message..."
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                sendConversationMessage(e.target.value);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>
    )}
  </div>
);

export default ConversationSimulator; 