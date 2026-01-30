// Import necessary React hooks and components
import React, { useState, useEffect, useRef } from 'react';
// Import the ReadingPractice component for use within AdvancedFeatures
import ReadingPractice from './ReadingPractice';
// Import the CSS file for styling the AdvancedFeatures component
import './AdvancedFeatures.css';

// Define the AdvancedFeatures component which takes userId and onBack as props
const AdvancedFeatures = ({ userId, onBack }) => {
  // State to track the currently active feature tab (null means showing the menu)
  const [activeTab, setActiveTab] = useState(null);
  // State to store the user's progress data loaded from the backend
  const [progressData, setProgressData] = useState(null);
  // State to store the current sentence for shadowing practice
  const [shadowingSentence, setShadowingSentence] = useState('');
  // State to track if the browser is currently listening for speech
  const [isListening, setIsListening] = useState(false);
  // State to store the transcript of what the user said
  const [spokenText, setSpokenText] = useState('');
  // State to store feedback from the shadowing evaluation
  const [shadowingFeedback, setShadowingFeedback] = useState(null);
  // State to store available conversation scenarios
  const [conversationScenarios, setConversationScenarios] = useState([]);
  // State to store the currently active conversation scenario
  const [selectedScenario, setSelectedScenario] = useState(null);
  // State to track the history of messages in a conversation
  const [conversationHistory, setConversationHistory] = useState([]);
  // State to store the daily challenge information
  const [dailyChallenge, setDailyChallenge] = useState(null);
  // State to store personalized recommendations for the user
  const [recommendations, setRecommendations] = useState([]);
  // State to track if a voice recording is in progress (obsolete if using STT)
  const [isRecording, setIsRecording] = useState(false);
  // State to store the speech recognition instance
  const [recognition, setRecognition] = useState(null);
  // State to track if the main data is still loading
  const [loading, setLoading] = useState(true);
  // State to store any error messages that occur during data fetching
  const [error, setError] = useState(null);

  // State to store messages in the AI tutor chat
  const [aiMessages, setAiMessages] = useState([]);
  // State to store the user's text input for the AI tutor
  const [aiInput, setAiInput] = useState('');
  // State to track if the AI is currently generating a response
  const [aiLoading, setAiLoading] = useState(false);

  // State to track if voice mode (ElevenLabs) is enabled for the AI tutor
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  // State to track if a voice message is currently being recorded for the AI tutor
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  // State to store the currently playing audio object
  const [currentAudio, setCurrentAudio] = useState(null);
  // State to store the MediaRecorder instance for capturing voice
  const [mediaRecorder, setMediaRecorder] = useState(null);
  // State to store chunks of recorded audio data
  const [audioChunks, setAudioChunks] = useState([]);

  // Fetch the backend API URL from environment variables, defaulting to localhost
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

  // useEffect hook to initialize features and load data when the component mounts or userId changes
  useEffect(() => {
    // Initialize the web speech recognition API
    initializeSpeechRecognition();

    // Load initial data
    loadAllFeatureData();
  }, [userId]);

  // Handle tab changes with data loading
  useEffect(() => {
    if (activeTab) {
      // Clear specific ephemeral states when switching tabs
      setSpokenText('');
      setShadowingFeedback(null);
      setIsListening(false);
    }
  }, [activeTab]);

  // Aggregate function to load all initial feature data
  const loadAllFeatureData = async () => {
    setLoading(true);
    await Promise.all([
      loadProgressData(),
      loadConversationScenarios(),
      loadDailyChallenge(),
      loadRecommendations()
    ]);
    setLoading(false);
  };

  // Function to setup speech recognition using available browser APIs
  const initializeSpeechRecognition = () => {
    try {
      // Check for supported SpeechRecognition object in different browsers
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

      // If a speech recognition API is found, configure it
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();

        // Stop automatically after a single phrase
        recognitionInstance.continuous = false;
        // Do not show intermediate results
        recognitionInstance.interimResults = false;
        // Set language to US English
        recognitionInstance.lang = 'en-US';

        // Handle the event when recognition officially starts
        recognitionInstance.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };

        // Handle the event when speech is successfully recognized
        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('Speech recognized:', transcript);
          // Save the transcript to state
          setSpokenText(transcript);
          setIsListening(false);
        };

        // Handle any errors that occur during recognition
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);

          // Provide user-friendly feedback based on the error type
          if (event.error !== 'no-speech') {
            console.warn(`Speech recognition error: ${event.error}`);
          }
        };

        // Handle the event when recognition ends (success or failure)
        recognitionInstance.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };

        // Save the configured recognition instance to state
        setRecognition(recognitionInstance);
      } else {
        console.error('Speech recognition not supported');
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
    }
  };

  // Function to trigger the speech recognition process
  const startListening = () => {
    if (recognition) {
      try {
        // Clear old results before starting again
        setSpokenText('');
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }
  };

  // Function to start a voice recording via MediaRecorder API (High Quality STT)
  const startVoiceRecording = async () => {
    try {
      // Request access to the user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Create a new MediaRecorder instance with the microphone stream
      const recorder = new MediaRecorder(stream);
      // Array to collect audio data chunks
      const chunks = [];

      // Callback to handle incoming audio data from the recorder
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      // Callback to handle the stop event when the user finishes recording
      recorder.onstop = async () => {
        // Combine chunks into a single audio Blob
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        // Process the audio through the backend STT service
        await processVoiceInput(audioBlob);
        // Clean up: stop the microphone stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Save recorder and chunks array to state
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      // Start recording
      recorder.start();
      setIsRecordingVoice(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  // Function to manually stop the ongoing voice recording
  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecordingVoice) {
      // Stop the recorder, triggering the 'onstop' callback
      mediaRecorder.stop();
      setIsRecordingVoice(false);
    }
  };

  // Function to send the recorded audio blob to the backend for speech-to-text conversion
  const processVoiceInput = async (audioBlob) => {
    try {
      // Create FormData to send binary audio data over HTTP
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.wav');

      // Post the audio data to the backend STT endpoint
      const response = await fetch(`${API_URL}/api/ai-tutor/speech-to-text`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // If STT succeeded, send the transcribed text to the AI tutor for a response
        await sendAiMessage(result.text);
      } else {
        alert('Error processing voice input: ' + result.error);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      alert('Error processing voice input. Please try again.');
    }
  };

  // Function to play audio from a provided URL or base64 data string
  const playAudio = (audioData) => {
    try {
      // If an audio clip is already playing, pause it and reset to start
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      const audio = new Audio(audioData);
      audio.onended = () => setCurrentAudio(null);
      audio.play();
      // Store the player instance for external control
      setCurrentAudio(audio);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Function to load user's progress stats from the backend
  const loadProgressData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/progress/dashboard/${userId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress data:', error);
      // Partial state update for error visibility
      setError('Progress data unavailable.');
    }
  };

  // Function to load all available conversation scenarios for the simulator
  const loadConversationScenarios = async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversation/scenarios`);
      const data = await response.json();
      setConversationScenarios(data.length ? data : ['job_interview', 'restaurant', 'hotel']);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      setConversationScenarios(['job_interview', 'restaurant', 'hotel']);
    }
  };

  // Function to load the daily challenge topic
  const loadDailyChallenge = async () => {
    try {
      const response = await fetch(`${API_URL}/api/challenges/daily`);
      const data = await response.json();
      setDailyChallenge(data);
    } catch (error) {
      console.error('Error loading daily challenge:', error);
    }
  };

  // Function to load personalized topic recommendations based on user history
  const loadRecommendations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recommendations/${userId}`);
      const data = await response.json();
      setRecommendations(data.recommendations || ['Travel', 'Business', 'Daily Life']);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations(['Travel', 'Business', 'Daily Life']);
    }
  };

  // Function to send a message to the AI tutor and handle the response
  const sendAiMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    try {
      let response;
      if (isVoiceMode) {
        response = await fetch(`${API_URL}/api/ai-tutor/voice-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message, user_id: userId })
        });
      } else {
        response = await fetch(`${API_URL}/api/english-tutor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...aiMessages.slice(-5), userMessage] })
        });
      }

      if (!response.ok) throw new Error('Failed to get AI response');
      const data = await response.json();

      const aiResponse = {
        role: 'assistant',
        content: data.ai_response || data.response
      };
      setAiMessages(prev => [...prev, aiResponse]);

      if (isVoiceMode && data.audio_url) {
        playAudio(data.audio_url);
      }
    } catch (error) {
      console.error('Error sending AI message:', error);
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Shadowing Mode: Fetch a random sentence for shadowing practice
  const getShadowingSentence = async () => {
    try {
      const response = await fetch(`${API_URL}/api/shadowing/sentence`);
      const data = await response.json();
      setShadowingSentence(data.sentence);
      setShadowingFeedback(null);
      setSpokenText('');

      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    } catch (error) {
      console.error('Error getting shadowing sentence:', error);
      setShadowingSentence('Welcome to your English learning journey.');
    }
  };

  // Shadowing Mode: Evaluate the user's performance on the current sentence
  const evaluateShadowing = async () => {
    if (!spokenText || !shadowingSentence) return;

    try {
      const response = await fetch(`${API_URL}/api/shadowing/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_sentence: shadowingSentence, spoken_text: spokenText })
      });
      const data = await response.json();
      setShadowingFeedback(data);
    } catch (error) {
      console.error('Error evaluating shadowing:', error);
    }
  };

  // Conversation Simulator: Start a roleplay based on a chosen scenario
  const startConversation = async (scenario) => {
    try {
      const response = await fetch(`${API_URL}/api/conversation/start`, {
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

  // Conversation Simulator: Send a user response to the AI roleplay partner
  const sendConversationMessage = async (message) => {
    if (!selectedScenario || !message.trim()) return;

    setConversationHistory(prev => [...prev, { type: 'user', message, timestamp: new Date() }]);

    try {
      const response = await fetch(`${API_URL}/api/conversation/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedScenario.conversation_id,
          user_message: message,
          scenario: selectedScenario.scenario?.scenario || selectedScenario.scenario
        })
      });
      const data = await response.json();

      setConversationHistory(prev => [...prev, { type: 'ai', message: data.ai_response, timestamp: new Date() }]);

      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Daily Challenge: Submit a recording for the daily speaking task
  const submitDailyChallenge = async () => {
    if (!spokenText || !dailyChallenge) return;

    try {
      const response = await fetch(`${API_URL}/api/challenges/submit`, {
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
      loadProgressData();
    } catch (error) {
      console.error('Error submitting challenge:', error);
    }
  };

  // Session Logging: Record practice results for the user's progress summary
  const recordSession = async (topic, score) => {
    try {
      await fetch(`${API_URL}/api/progress/session`, {
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
      loadProgressData();
    } catch (error) {
      console.error('Error recording session:', error);
    }
  };

  // Main UI Render Method
  return (
    <div className="advanced-features">
      {/* Decorative background blobs for the ultra-premium mesh background effect */}
      <div className="bg-blob-1"></div>
      <div className="bg-blob-2"></div>

      {/* Top Header Section with Navigation Buttons */}
      <div className="features-nav-header">
        <div className="top-nav-buttons">
          <button className="main-back-btn" onClick={onBack} title="Back to Dashboard">
            <span className="icon">🏠</span> Main Dashboard
          </button>

          {activeTab && (
            <button className="menu-back-btn" onClick={() => setActiveTab(null)} title="Back to Features Menu">
              <span className="icon">🔙</span> Features Menu
            </button>
          )}
        </div>

        {/* Feature Tab Navigation List with ultra-glassmorphism styling */}
        <div className="features-tabs">
          <button className={activeTab === 'progress' ? 'active' : ''} onClick={() => setActiveTab('progress')}>
            Progress
          </button>
          <button className={activeTab === 'reading' ? 'active' : ''} onClick={() => setActiveTab('reading')}>
            Reading
          </button>
          <button className={activeTab === 'shadowing' ? 'active' : ''} onClick={() => setActiveTab('shadowing')}>
            Shadowing
          </button>
          <button className={activeTab === 'conversation' ? 'active' : ''} onClick={() => setActiveTab('conversation')}>
            Simulator
          </button>
          <button className={activeTab === 'challenge' ? 'active' : ''} onClick={() => setActiveTab('challenge')}>
            Challenge
          </button>
          <button className={activeTab === 'ai-tutor' ? 'active' : ''} onClick={() => setActiveTab('ai-tutor')}>
            AI Tutor
          </button>
          <button className={activeTab === 'recommendations' ? 'active' : ''} onClick={() => setActiveTab('recommendations')}>
            Tips
          </button>
        </div>
      </div>

      <div className="feature-content">
        {/* Main Dashboard Menu Overlay */}
        {!activeTab && (
          <div className="features-menu-grid">
            <div className="menu-card" onClick={() => setActiveTab('progress')}>
              <div className="menu-card-icon">📊</div>
              <h4>Progress Tracker</h4>
              <p>Monitor your learning journey and achievements</p>
            </div>
            <div className="menu-card" onClick={() => setActiveTab('reading')}>
              <div className="menu-card-icon">📖</div>
              <h4>Reading Practice</h4>
              <p>Improve your reading fluency with AI feedback</p>
            </div>
            <div className="menu-card" onClick={() => setActiveTab('shadowing')}>
              <div className="menu-card-icon">🗣️</div>
              <h4>Shadowing Mode</h4>
              <p>Perfect your accent by repeating after AI</p>
            </div>
            <div className="menu-card" onClick={() => setActiveTab('conversation')}>
              <div className="menu-card-icon">💬</div>
              <h4>Conversation Simulator</h4>
              <p>Practice real-world scenarios with AI</p>
            </div>
            <div className="menu-card" onClick={() => setActiveTab('challenge')}>
              <div className="menu-card-icon">🎯</div>
              <h4>Daily Challenge</h4>
              <p>Complete your daily speaking goal</p>
            </div>
            <div className="menu-card" onClick={() => setActiveTab('ai-tutor')}>
              <div className="menu-card-icon">🤖</div>
              <h4>AI Tutor</h4>
              <p>Ask anything about English grammar & vocabulary</p>
            </div>
            <div className="menu-card" onClick={() => setActiveTab('recommendations')}>
              <div className="menu-card-icon">✨</div>
              <h4>Recommendations</h4>
              <p>Personalized tips to boost your skills</p>
            </div>
          </div>
        )}

        {/* --- Specific Feature View Contents (Updated with Lux Styling) --- */}

        {/* Reading Practice Module */}
        {activeTab === 'reading' && (
          <div className="feature-container">
            <ReadingPractice userId={userId} />
          </div>
        )}

        {/* Progress Tracker Module */}
        {activeTab === 'progress' && (
          <div className="feature-container progress-dashboard">
            <h3>Your Performance</h3>
            <div className="lux-card">
              {loading ? (
                <p>Analyzing your data...</p>
              ) : (
                <>
                  <div className="progress-stats">
                    <div className="stat-card">
                      <h4>Level</h4>
                      <p>{progressData?.user_progress?.level || 1}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Experience</h4>
                      <p>{progressData?.user_progress?.experience || 0} XP</p>
                    </div>
                    <div className="stat-card">
                      <h4>Accuracy</h4>
                      <p>{(progressData?.user_progress?.average_score || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="badges-section">
                    <h4>Milestones Reached</h4>
                    <div className="badges">
                      {(progressData?.user_progress?.badges || []).map((badge, index) => (
                        <span key={index} className="badge">⭐ {badge}</span>
                      ))}
                      {(!progressData?.user_progress?.badges || progressData?.user_progress?.badges.length === 0) && (
                        <p>No milestones yet. Keep practicing!</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Shadowing Practice Module */}
        {activeTab === 'shadowing' && (
          <div className="feature-container shadowing-mode">
            <h3>Shadowing Exercise</h3>
            <div className="lux-card shadowing-content">
              <button onClick={getShadowingSentence} className="lux-button">
                🔄 Load New Sentence
              </button>

              {shadowingSentence && (
                <div className="sentence-display">
                  <h4>Listen & Repeat</h4>
                  <p className="sentence">"{shadowingSentence}"</p>
                  <button
                    onClick={() => {
                      fetch(`${API_URL}/api/ai-tutor/text-to-speech`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: shadowingSentence })
                      }).then(res => res.json()).then(data => {
                        if (data.audio_url) playAudio(data.audio_url);
                      });
                    }}
                    className="lux-button lux-button-secondary"
                  >
                    🔊 Hear AI Pronunciation
                  </button>
                </div>
              )}

              <div className="recording-zone">
                <button
                  onClick={startListening}
                  disabled={isListening}
                  className={`lux-button ${isListening ? 'listening' : ''}`}
                >
                  {isListening ? '🎙️ Mic Active...' : '🎤 Start My Recording'}
                </button>

                {spokenText && (
                  <div className="spoken-review">
                    <p><strong>Your Attempt:</strong> "{spokenText}"</p>
                    <button onClick={evaluateShadowing} className="lux-button">
                      ✨ Get Feedback
                    </button>
                  </div>
                )}
              </div>

              {shadowingFeedback && (
                <div className="feedback-display lux-card" style={{ marginTop: '20px', background: '#f8fafc' }}>
                  <h4>Analysis Result:</h4>
                  <div className="scores-row" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <p>Accuracy: <strong>{shadowingFeedback.accuracy.toFixed(1)}%</strong></p>
                    <p>Overall: <strong>{shadowingFeedback.score.toFixed(1)}/100</strong></p>
                  </div>
                  {shadowingFeedback.missed_words?.length > 0 && (
                    <p style={{ color: '#dc2626', marginTop: '10px' }}>
                      <strong>Focus on:</strong> {shadowingFeedback.missed_words.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversation Simulator Module */}
        {activeTab === 'conversation' && (
          <div className="feature-container conversation-simulator">
            <h3>Scenario Simulator</h3>

            {!selectedScenario ? (
              <div className="lux-card scenario-selection">
                <h4>Select a Roleplay Setting</h4>
                <div className="scenario-buttons">
                  {conversationScenarios.map((scenario, index) => (
                    <button
                      key={index}
                      onClick={() => startConversation(scenario)}
                      className="lux-button"
                    >
                      {typeof scenario === 'string' ? scenario.replace('_', ' ').toUpperCase() : 'SCENARIO'}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="lux-card conversation-interface">
                <div className="conversation-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <p><strong>Scenario:</strong> {selectedScenario.scenario?.role || 'Dialogue'}</p>
                  <button className="lux-button lux-button-secondary" onClick={() => setSelectedScenario(null)}>Leave</button>
                </div>

                <div className="conversation-messages" style={{ height: '300px', overflowY: 'auto', padding: '10px', background: '#f8fafc', borderRadius: '16px', marginBottom: '20px' }}>
                  {conversationHistory.map((msg, index) => (
                    <div key={index} style={{ textAlign: msg.type === 'user' ? 'right' : 'left', margin: '10px 0' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '10px 16px',
                        borderRadius: '16px',
                        background: msg.type === 'user' ? '#4f46e5' : '#ffffff',
                        color: msg.type === 'user' ? 'white' : '#1e1b4b',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        maxWidth: '80%'
                      }}>
                        {msg.message}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="message-input" style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Say something to the AI..."
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendConversationMessage(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button className="lux-button" onClick={() => {
                    const input = document.querySelector('.message-input input');
                    sendConversationMessage(input.value);
                    input.value = '';
                  }}>Send</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daily Speaking Challenge Module */}
        {activeTab === 'challenge' && (
          <div className="feature-container daily-challenge">
            <h3>Active Challenge</h3>
            <div className="lux-card challenge-content">
              {dailyChallenge ? (
                <>
                  <p className="challenge-text">"{dailyChallenge.challenge}"</p>
                  <div className="recording-controls">
                    <button
                      onClick={startListening}
                      disabled={isListening}
                      className="lux-button"
                    >
                      {isListening ? '🎙️ Reading...' : '🎤 Record Response'}
                    </button>

                    {spokenText && (
                      <div className="spoken-review" style={{ marginTop: '20px' }}>
                        <p><strong>Transcribed:</strong> "{spokenText}"</p>
                        <button onClick={submitDailyChallenge} className="lux-button">
                          🚀 Submit Now
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : <p>Loading today's challenge...</p>}
            </div>
          </div>
        )}

        {/* AI Tutor Chatbot Module */}
        {activeTab === 'ai-tutor' && (
          <div className="ai-tutor">
            <h3 style={{ marginBottom: '10px' }}>English Companion</h3>
            <div className="voice-mode-toggle" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '600' }}>
                <input
                  type="checkbox"
                  checked={isVoiceMode}
                  onChange={(e) => setIsVoiceMode(e.target.checked)}
                />
                🎤 Enable High-Fidelity Voice
              </label>
            </div>

            <div className="ai-tutor-interface">
              <div className="ai-messages">
                {aiMessages.length === 0 && (
                  <div className="welcome-message" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>👋 I'm your AI tutor. How can I help with your English today?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                      <span className="badge">Grammar</span>
                      <span className="badge">Idioms</span>
                      <span className="badge">Pronunciation</span>
                    </div>
                  </div>
                )}
                {aiMessages.map((msg, index) => (
                  <div key={index} className={`ai-message ${msg.role}`}>
                    <div className="message-content">{msg.content}</div>
                    {isVoiceMode && msg.role === 'assistant' && (
                      <button
                        onClick={() => {
                          fetch(`${API_URL}/api/ai-tutor/text-to-speech`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: msg.content })
                          }).then(res => res.json()).then(data => {
                            if (data.audio_url) playAudio(data.audio_url);
                          });
                        }}
                        className="play-voice-btn"
                      >
                        🔊 Replay AI Voice
                      </button>
                    )}
                  </div>
                ))}
                {aiLoading && (
                  <div className="ai-message assistant thinking">
                    <div className="message-content">AI is evaluating...</div>
                  </div>
                )}
              </div>

              <div className="ai-input">
                {isVoiceMode && (
                  <button
                    onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                    className={`lux-button ${isRecordingVoice ? 'recording' : ''}`}
                    style={{ minWidth: '160px' }}
                  >
                    {isRecordingVoice ? '🛑 Stop' : '🎤 Speak'}
                  </button>
                )}

                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={isVoiceMode ? "Or type a message..." : "Ask me anything..."}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && aiInput.trim()) sendAiMessage(aiInput);
                  }}
                />
                <button
                  className="lux-button"
                  onClick={() => sendAiMessage(aiInput)}
                  disabled={!aiInput.trim() || aiLoading}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Personalized Tips Module */}
        {activeTab === 'recommendations' && (
          <div className="feature-container recommendations">
            <h3>Personalized Recommendations</h3>
            <div className="lux-card">
              <h4>Tailored Study Topics:</h4>
              <div className="recommendation-list">
                {recommendations.map((topic, index) => (
                  <div key={index} className="recommendation-item">
                    <span className="topic-name">{topic}</span>
                    <button
                      onClick={() => recordSession(topic, 75)}
                      className="lux-button lux-button-secondary"
                    >
                      🎯 Quick Practice
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