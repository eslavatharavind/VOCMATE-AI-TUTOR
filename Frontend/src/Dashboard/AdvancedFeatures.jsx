import React, { useState, useEffect, useRef } from 'react';
import ReadingPractice from './ReadingPractice';
import './AdvancedFeatures.css';

const AdvancedFeatures = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('progress');
  const [progressData, setProgressData] = useState(null);
  const [shadowingSentence, setShadowingSentence] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [shadowingFeedback, setShadowingFeedback] = useState(null);
  const [conversationScenarios, setConversationScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // AI Tutor states
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Voice states
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    // Initialize speech recognition
    initializeSpeechRecognition();

    // Load initial data
    loadProgressData();
    loadConversationScenarios();
    loadDailyChallenge();
    loadRecommendations();
  }, [userId]);

  const initializeSpeechRecognition = () => {
    try {
      // Check for different speech recognition APIs
      let SpeechRecognition = null;
      
      if ('SpeechRecognition' in window) {
        SpeechRecognition = window.SpeechRecognition;
      } else if ('webkitSpeechRecognition' in window) {
        SpeechRecognition = window.webkitSpeechRecognition;
      } else if ('mozSpeechRecognition' in window) {
        SpeechRecognition = window.mozSpeechRecognition;
      } else if ('msSpeechRecognition' in window) {
        SpeechRecognition = window.msSpeechRecognition;
      }
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };
        
        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('Speech recognized:', transcript);
          setSpokenText(transcript);
          setIsListening(false);
        };
        
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          // Handle specific errors
          switch (event.error) {
            case 'not-allowed':
              alert('Microphone access denied. Please allow microphone permissions and try again.');
              break;
            case 'no-speech':
              alert('No speech detected. Please speak clearly and try again.');
              break;
            case 'network':
              alert('Network error. Please check your internet connection.');
              break;
            default:
              alert(`Speech recognition error: ${event.error}. Please try again.`);
          }
        };
        
        recognitionInstance.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
      } else {
        console.error('Speech recognition not supported');
        // Don't show alert for unsupported browsers, just log it
        console.log('Speech recognition not supported in this browser. Use Chrome, Edge, or Safari for best experience.');
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      console.log('Speech recognition initialization failed. Some features may not work properly.');
    }
  };

  const startListening = () => {
    if (recognition) {
      try {
        setSpokenText(''); // Clear previous text
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Error starting speech recognition. Please try again.');
      }
    } else {
      alert('Speech recognition not available. Please refresh the page.');
    }
  };

  // Voice recording functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      recorder.start();
      setIsRecordingVoice(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecordingVoice) {
      mediaRecorder.stop();
      setIsRecordingVoice(false);
    }
  };

  const processVoiceInput = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.wav');
      
      const response = await fetch('http://localhost:10000/api/ai-tutor/speech-to-text', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Send the transcribed text to AI tutor
        await sendAiMessage(result.text);
      } else {
        alert('Error processing voice input: ' + result.error);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      alert('Error processing voice input. Please try again.');
    }
  };

  const playAudio = (audioData) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      
      const audio = new Audio(audioData);
      audio.onended = () => setCurrentAudio(null);
      audio.play();
      setCurrentAudio(audio);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:10000/api/progress/dashboard/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress data:', error);
      setError('Failed to load progress data. Using demo data.');
      // Set demo data as fallback
      setProgressData({
        user_progress: {
          level: 1,
          experience: 0,
          badges: ['Demo User'],
          total_sessions: 0,
          average_score: 0
        },
        recent_sessions: [],
        weekly_average: 0,
        weekly_sessions_count: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConversationScenarios = async () => {
    try {
      const response = await fetch('http://localhost:10000/api/conversation/scenarios');
      const data = await response.json();
      setConversationScenarios(data);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      setConversationScenarios(['job_interview', 'restaurant', 'hotel']);
    }
  };

  const loadDailyChallenge = async () => {
    try {
      const response = await fetch('http://localhost:10000/api/challenges/daily');
      const data = await response.json();
      setDailyChallenge(data);
    } catch (error) {
      console.error('Error loading daily challenge:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await fetch(`http://localhost:10000/api/recommendations/${userId}`);
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations(['Travel', 'Business', 'Daily Life']);
    }
  };

  // AI Tutor functions
  const sendAiMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    try {
      let response;
      
      if (isVoiceMode) {
        // Use voice chat endpoint
        response = await fetch('http://localhost:10000/api/ai-tutor/voice-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: message,
            user_id: userId 
          })
        });
      } else {
        // Use regular chat endpoint
        response = await fetch('http://localhost:10000/api/english-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...aiMessages, userMessage] })
        });
      }

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiResponse = {
        role: 'assistant',
        content: data.ai_response || data.response
      };

      setAiMessages(prev => [...prev, aiResponse]);
      
      // Play audio if in voice mode and audio data is available
      if (isVoiceMode && data.audio_url) {
        playAudio(data.audio_url);
      }
    } catch (error) {
      console.error('Error sending AI message:', error);
      const errorResponse = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setAiMessages(prev => [...prev, errorResponse]);
    } finally {
      setAiLoading(false);
    }
  };

  // Shadowing Mode
  const getShadowingSentence = async () => {
    try {
      const response = await fetch('http://localhost:10000/api/shadowing/sentence');
      const data = await response.json();
      setShadowingSentence(data.sentence);
      setShadowingFeedback(null);
      
      // Play the sentence audio if available
      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    } catch (error) {
      console.error('Error getting shadowing sentence:', error);
      setShadowingSentence('Welcome to your English learning journey.');
    }
  };

  const evaluateShadowing = async () => {
    if (!spokenText || !shadowingSentence) return;

    try {
      const response = await fetch('http://localhost:10000/api/shadowing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_sentence: shadowingSentence,
          spoken_text: spokenText
        })
      });
      const data = await response.json();
      setShadowingFeedback(data);
    } catch (error) {
      console.error('Error evaluating shadowing:', error);
    }
  };

  // Conversation Simulator
  const startConversation = async (scenario) => {
    try {
      const response = await fetch('http://localhost:10000/api/conversation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await response.json();
      setSelectedScenario(data);
      setConversationHistory([{
        type: 'ai',
        message: data.first_message,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const sendConversationMessage = async (message) => {
    if (!selectedScenario) return;

    // Add user message to history
    const userMessage = {
      type: 'user',
      message,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const response = await fetch('http://localhost:10000/api/conversation/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedScenario.conversation_id,
          user_message: message,
          scenario: selectedScenario.scenario.scenario
        })
      });
      const data = await response.json();
      
      // Add AI response to history
      const aiMessage = {
        type: 'ai',
        message: data.ai_response,
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, aiMessage]);
      
      // Play audio if available
      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Daily Challenge
  const submitDailyChallenge = async () => {
    if (!spokenText || !dailyChallenge) return;

    try {
      const response = await fetch('http://localhost:10000/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          challenge_text: dailyChallenge.challenge,
          spoken_text: spokenText
        })
      });
      const data = await response.json();
      alert(`Challenge completed! Score: ${data.total_score.toFixed(1)}/100`);
      setSpokenText('');
    } catch (error) {
      console.error('Error submitting challenge:', error);
    }
  };

  // Record session for progress tracking
  const recordSession = async (topic, score) => {
    try {
      await fetch('http://localhost:10000/api/progress/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          topic,
          total_score: score,
          fluency_score: score * 0.4,
          accuracy_score: score * 0.4,
          speed_score: score * 0.2,
          mistakes: []
        })
      });
      loadProgressData(); // Refresh progress data
    } catch (error) {
      console.error('Error recording session:', error);
    }
  };

  return (
    <div className="advanced-features">
      <div className="features-tabs">
        <button 
          className={activeTab === 'progress' ? 'active' : ''} 
          onClick={() => setActiveTab('progress')}
        >
          Progress Tracker
        </button>
        <button 
          className={activeTab === 'reading' ? 'active' : ''} 
          onClick={() => setActiveTab('reading')}
        >
          Reading Practice
        </button>
        <button 
          className={activeTab === 'shadowing' ? 'active' : ''} 
          onClick={() => setActiveTab('shadowing')}
        >
          Shadowing Mode
        </button>
        <button 
          className={activeTab === 'conversation' ? 'active' : ''} 
          onClick={() => setActiveTab('conversation')}
        >
          Conversation Simulator
        </button>
        <button 
          className={activeTab === 'challenge' ? 'active' : ''} 
          onClick={() => setActiveTab('challenge')}
        >
          Daily Challenge
        </button>
        <button 
          className={activeTab === 'ai-tutor' ? 'active' : ''} 
          onClick={() => setActiveTab('ai-tutor')}
        >
          AI Tutor
        </button>
        <button 
          className={activeTab === 'recommendations' ? 'active' : ''} 
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
        </button>
      </div>

      <div className="feature-content">
        {/* Reading Practice */}
        {activeTab === 'reading' && (
          <ReadingPractice userId={userId} />
        )}

        {/* Progress Tracker */}
        {activeTab === 'progress' && (
          <div className="progress-dashboard">
            <h3>Your Progress Dashboard</h3>
            {loading && <p>Loading progress data...</p>}
            {error && <p style={{color: 'orange'}}>{error}</p>}
            {progressData && !loading && (
              <>
                <div className="progress-stats">
                  <div className="stat-card">
                    <h4>Level {progressData.user_progress?.level || 1}</h4>
                    <p>Experience: {progressData.user_progress?.experience || 0} XP</p>
                  </div>
                  <div className="stat-card">
                    <h4>Total Sessions</h4>
                    <p>{progressData.user_progress?.total_sessions || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Average Score</h4>
                    <p>{(progressData.user_progress?.average_score || 0).toFixed(1)}%</p>
                  </div>
                  <div className="stat-card">
                    <h4>Weekly Average</h4>
                    <p>{(progressData.weekly_average || 0).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="badges-section">
                  <h4>Badges Earned</h4>
                  <div className="badges">
                    {(progressData.user_progress?.badges || []).map((badge, index) => (
                      <span key={index} className="badge">{badge}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Shadowing Mode */}
        {activeTab === 'shadowing' && (
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
                      const response = fetch('http://localhost:10000/api/ai-tutor/text-to-speech', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: shadowingSentence })
                      }).then(res => res.json()).then(data => {
                        if (data.audio_url) {
                          playAudio(data.audio_url);
                        }
                      });
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
        )}

        {/* Conversation Simulator */}
        {activeTab === 'conversation' && (
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
                    placeholder="Type your response..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        sendConversationMessage(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button onClick={() => {
                    const input = document.querySelector('.message-input input');
                    if (input.value.trim()) {
                      sendConversationMessage(input.value);
                      input.value = '';
                    }
                  }}>
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daily Challenge */}
        {activeTab === 'challenge' && (
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
        )}

        {/* AI Tutor */}
        {activeTab === 'ai-tutor' && (
          <div className="ai-tutor">
            <h3>AI English Tutor</h3>
            
            {/* Voice Mode Toggle */}
            <div className="voice-mode-toggle">
              <label>
                <input 
                  type="checkbox" 
                  checked={isVoiceMode} 
                  onChange={(e) => setIsVoiceMode(e.target.checked)}
                />
                🎤 Voice Mode (ElevenLabs)
              </label>
            </div>
            
            <div className="ai-tutor-interface">
              <div className="ai-messages">
                {aiMessages.length === 0 && (
                  <div className="welcome-message">
                    <p>👋 Hello! I'm your AI English tutor. Ask me anything about:</p>
                    <ul>
                      <li>Grammar and vocabulary</li>
                      <li>Pronunciation tips</li>
                      <li>Writing help</li>
                      <li>Study strategies</li>
                      <li>English learning advice</li>
                    </ul>
                    {isVoiceMode && (
                      <p style={{marginTop: '15px', fontSize: '14px'}}>
                        🎤 Voice mode enabled! You can speak to me and I'll respond with voice.
                      </p>
                    )}
                  </div>
                )}
                {aiMessages.map((msg, index) => (
                  <div key={index} className={`ai-message ${msg.role}`}>
                    <div className="message-content">
                      {msg.role === 'user' ? 'You' : 'AI Tutor'}: {msg.content}
                    </div>
                    {isVoiceMode && msg.role === 'assistant' && (
                      <button 
                        onClick={() => {
                          fetch('http://localhost:10000/api/ai-tutor/text-to-speech', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: msg.content })
                          }).then(res => res.json()).then(data => {
                            if (data.audio_url) {
                              playAudio(data.audio_url);
                            }
                          });
                        }}
                        className="play-voice-btn"
                      >
                        🔊 Play
                      </button>
                    )}
                  </div>
                ))}
                {aiLoading && (
                  <div className="ai-message assistant">
                    <div className="message-content">
                      AI Tutor: Thinking...
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ai-input">
                {isVoiceMode && (
                  <button 
                    onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                    className={`voice-record-btn ${isRecordingVoice ? 'recording' : ''}`}
                  >
                    {isRecordingVoice ? '🛑 Stop Recording' : '🎤 Start Voice Recording'}
                  </button>
                )}
                
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={isVoiceMode ? "Or type your message here..." : "Ask me anything about English..."}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && aiInput.trim()) {
                      sendAiMessage(aiInput);
                    }
                  }}
                />
                <button 
                  onClick={() => sendAiMessage(aiInput)}
                  disabled={!aiInput.trim() || aiLoading}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {activeTab === 'recommendations' && (
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
        )}
      </div>
    </div>
  );
};

export default AdvancedFeatures; 