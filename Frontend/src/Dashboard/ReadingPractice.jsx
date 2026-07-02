// Import necessary React hooks and references
import React, { useState, useEffect, useRef } from 'react';
// Import the styling for the Reading Practice component
import './ReadingPractice.css';

// Define the ReadingPractice component which takes the current user's ID as a prop
const ReadingPractice = ({ userId }) => {
  // State to store the list of available reading topics from the backend
  const [topics, setTopics] = useState([]);
  // State to track which topic is currently selected by the user
  const [selectedTopic, setSelectedTopic] = useState(null);
  // State to store the full content (title, paragraphs) of the selected topic
  const [readingContent, setReadingContent] = useState(null);
  // State to track the current paragraph index the user is reading
  const [currentParagraph, setCurrentParagraph] = useState(0);
  // State to track if the reading session is currently active
  const [isReading, setIsReading] = useState(false);
  // State to track if the reading session is currently paused
  const [isPaused, setIsPaused] = useState(false);
  // State to track if the microphone is currently listening for speech
  const [isListening, setIsListening] = useState(false);
  // State to store the final transcribed text of the user's reading
  const [spokenText, setSpokenText] = useState('');
  // State to track the elapsed reading time in seconds
  const [readingTime, setReadingTime] = useState(0);
  // State to store the timestamp of when the user started reading
  const [startTime, setStartTime] = useState(null);
  // State to control the speed of the automatic scrolling (in relative units)
  const [scrollSpeed, setScrollSpeed] = useState(1);
  // State to store the AI-generated feedback and performance metrics after analysis
  const [feedback, setFeedback] = useState(null);
  // State to control the visibility of the results/feedback panel
  const [showResults, setShowResults] = useState(false);
  // State to store the Web Speech API recognition instance
  const [recognition, setRecognition] = useState(null);
  // State to store the currently playing audio object (TTS)
  const [currentAudio, setCurrentAudio] = useState(null);
  // State to track if the main data or analysis is still loading
  const [loading, setLoading] = useState(false);
  // State to store and display any error messages that occur
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // References to DOM elements for manipulation
  const textRef = useRef(null);
  // References for timers to ensure they can be cleared across renders
  const timerRef = useRef(null);
  const scrollTimerRef = useRef(null);

  // State to track if Deepgram (Real-time STT) is currently active
  const [isDeepgramListening, setIsDeepgramListening] = useState(false);
  // State to store the real-time transcript coming from Deepgram
  const [deepgramTranscript, setDeepgramTranscript] = useState('');
  // Refs to manage the low-level WebSocket and Media objects for Deepgram
  const deepgramSocketRef = useRef(null);
  const deepgramRecorderRef = useRef(null);
  const deepgramMediaStreamRef = useRef(null);
  // Ref for the silence timeout to auto-end recording once the user stops talking
  const [deepgramSilenceTimeout, setDeepgramSilenceTimeout] = useState(null);

  // Define the base API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

  // Load available topics as soon as the component is mounted
  useEffect(() => {
    loadTopics();
  }, []);

  // When the user selects a new topic, fetch its specific reading content
  useEffect(() => {
    if (selectedTopic) {
      loadReadingContent(selectedTopic);
    }
  }, [selectedTopic]);

  // Manage timers and auto-scrolling based on the active reading state
  useEffect(() => {
    if (isReading && !isPaused) {
      // Start the stopwatch for reading duration
      startReadingTimer();
      // Start moving the text display upward
      startAutoScroll();
    } else {
      // Stop logic when paused or finished
      stopReadingTimer();
      stopAutoScroll();
    }
  }, [isReading, isPaused, scrollSpeed]);

  // Automatically trigger performance analysis once the transcript is ready and session ends
  useEffect(() => {
    if (!isReading && spokenText && !showResults && readingContent) {
      analyzePerformance();
    }
  }, [spokenText]);

  // Fetch the list of reading topics (e.g., Business, Travel) from the backend API
  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/reading/topics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTopics(data.topics);
    } catch (error) {
      // Provide hardcoded fallback topics if the network request fails
      console.error('Error loading topics:', error);
      setError('Failed to load reading topics. Using demo topics.');
      setTopics([
        { id: 'travel', title: 'Travel & Tourism' },
        { id: 'business', title: 'Business English' },
        { id: 'daily_conversations', title: 'Daily Conversations' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCategorizedTopics = () => {
    const categories = {
      "✈️ Travel & Socializing": [],
      "💼 Business & Careers": [],
      "🔬 Science & Technology": [],
      "🏛️ History & Society": [],
      "🥗 Health & Wellness": [],
      "🎨 Arts & Literature": [],
      "🌍 Nature & Environment": [],
      "☕ Everyday Life & Hobbies": []
    };

    topics.forEach(topic => {
      const id = topic.id;
      if (['travel', 'ecotourism', 'directions', 'hotel_checkin', 'restaurant_order', 'shopping_conversations', 'daily_conversations', 'work_socializing', 'describing_feelings'].includes(id)) {
        categories["✈️ Travel & Socializing"].push(topic);
      } else if (['business', 'presentations', 'job_interview', 'email_writing', 'negotiation', 'future_of_jobs', 'time_management'].includes(id)) {
        categories["💼 Business & Careers"].push(topic);
      } else if (['science', 'ai', 'quantum', 'space_colonization', 'renewable_energy', 'climate_change', 'marine_biology', 'genetics', 'cybersecurity', 'internet_history', 'robotics', 'vr', 'nanotechnology', 'big_data', 'self_driving', 'printing_press'].includes(id)) {
        categories["🔬 Science & Technology"].push(topic);
      } else if (['history', 'pyramids', 'roman_empire', 'silk_road', 'renaissance', 'industrial_revolution', 'ww2', 'greek_philosophy', 'space_race', 'maya', 'feudal_japan', 'great_wall', 'writing_history', 'vikings', 'printing_press', 'agriculture_origins', 'academic', 'news', 'microeconomics', 'behavioral_psychology', 'anthropology', 'media_sociology', 'political_philosophy', 'urban_planning', 'public_speaking', 'eq', 'sports_history', 'sustainable_architecture', 'learning_psychology'].includes(id)) {
        categories["🏛️ History & Society"].push(topic);
      } else if (['health', 'nutrition', 'mental_health', 'yoga', 'sleep_science', 'cardio', 'longevity', 'stress_science', 'gardening', 'walking_benefits', 'hydration', 'first_aid'].includes(id)) {
        categories["🥗 Health & Wellness"].push(topic);
      } else if (['music', 'art', 'classical_music', 'modern_art', 'cinema_history', 'architecture_wonders', 'photography', 'mythology', 'theater', 'creative_writing', 'dance_history', 'fashion', 'literature'].includes(id)) {
        categories["🎨 Arts & Literature"].push(topic);
      } else if (['national_parks', 'ocean_currents', 'desert_ecosystems', 'rainforest', 'volcanoes', 'glaciers', 'bird_migration', 'solar_system', 'deep_sea', 'microbes', 'space'].includes(id)) {
        categories["🌍 Nature & Environment"].push(topic);
      } else {
        categories["☕ Everyday Life & Hobbies"].push(topic);
      }
    });

    return categories;
  };

  // Fetch the actual paragraphs and metadata for a specific topic
  const loadReadingContent = async (topicId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/reading/content/${topicId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Save data and reset all session-specific states
      setReadingContent(data);
      setCurrentParagraph(0);
      setSpokenText('');
      setReadingTime(0);
      setFeedback(null);
      setShowResults(false);
    } catch (error) {
      // Display error to user if content fails to load
      console.error('Error loading reading content:', error);
      setError('Failed to load reading content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize the reading session and start the microphone listener
  const startReading = () => {
    if (!readingContent) return;

    setIsReading(true);
    setIsPaused(false);
    setStartTime(Date.now());
    setSpokenText('');
    setFeedback(null);
    setShowResults(false);
    setError(null);

    // Connect to Deepgram WebSockets for real-time transcription
    startDeepgramListening();
  };

  // Temporarily halt the reading session and microphone
  const pauseReading = () => {
    setIsPaused(true);
    stopDeepgramListening();
  };

  // Resume the reading session and microphone from where it left off
  const resumeReading = () => {
    setIsPaused(false);
    startDeepgramListening();
  };

  // Finalize the reading session and process results
  const stopReading = () => {
    setIsReading(false);
    setIsPaused(false);
    setReadingTime(0);
    // Cut the mic connection immediately
    stopDeepgramListening();

    // If we captured words, analyze them immediately
    if (spokenText && readingContent) {
      analyzePerformance();
    } else if (!spokenText) {
      // Warn user if no audio was captured
      setError('No speech was detected. Please ensure your microphone is working and try again.');
    }
  };

  // Replay the current paragraph transcript and clear evaluation state for a retry
  const repeatParagraph = () => {
    if (!readingContent) return;

    setSpokenText('');
    setReadingTime(0);
    setFeedback(null);
    setShowResults(false);
  };

  // Advance to the next section of the text
  const nextParagraph = () => {
    if (!readingContent || currentParagraph >= readingContent.paragraphs.length - 1) return;

    setCurrentParagraph(prev => prev + 1);
    setSpokenText('');
    setReadingTime(0);
    setFeedback(null);
    setShowResults(false);
  };

  // Start a 100ms interval timer to track reading duration
  const startReadingTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (startTime) {
        // Calculate total seconds elapsed since start
        const elapsed = (Date.now() - startTime) / 1000;
        setReadingTime(elapsed);
      }
    }, 100);
  };

  // Clear the reading duration timer
  const stopReadingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Start an interval to automatically scroll the text container based on current scrollSpeed
  const startAutoScroll = () => {
    if (scrollTimerRef.current) clearInterval(scrollTimerRef.current);

    const scrollStep = 1; // Increment scroll by 1 pixel per tick
    // Interval timing logic based on user-defined speed
    const stepInterval = 1000 / (scrollSpeed * 10);

    scrollTimerRef.current = setInterval(() => {
      if (textRef.current) {
        // Increment the scrollTop property of the display area
        textRef.current.scrollTop += scrollStep;
      }
    }, stepInterval);
  };

  // Clear the auto-scrolling interval
  const stopAutoScroll = () => {
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  };

  // Send the captured transcript and metrics to the backend for scoring
  const analyzePerformance = async () => {
    if (!readingContent || !spokenText) return;

    try {
      setLoading(true);
      const fullText = readingContent.paragraphs.join("\n\n");

      const response = await fetch(`${API_URL}/api/reading/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_text: fullText,
          spoken_text: spokenText,
          reading_time: readingTime,
          user_id: userId,
          topic: selectedTopic
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analysis = await response.json();
      // Store metrics (fluency, accuracy, etc.) in state for display
      setFeedback(analysis);
      setShowResults(true);
    } catch (error) {
      // Show error if analysis server is unreachable
      console.error('Error analyzing performance:', error);
      setError('Failed to analyze performance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manage playing various audio clips and stopping current tracks
  const playAudio = (audioData) => {
    try {
      // If audio is already active, kill it to prevent layering
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      const audio = new Audio(audioData);
      // Clean up ref on finish
      audio.onended = () => setCurrentAudio(null);
      audio.play();
      setCurrentAudio(audio);
    } catch (error) {
      // Log errors if audio file is corrupted or blocked by browser
      console.error('Error playing audio:', error);
    }
  };

  // Convert raw seconds into a MM:SS string for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Robust Deepgram WebSocket Initialization for real-time speech-to-text
  const startDeepgramListening = async () => {
    setDeepgramTranscript('');
    setSpokenText('');
    // Use the nova-2 model as it is stable and highly accurate
    const deepgramApiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;

    // Safety check for credential availability
    if (!deepgramApiKey) {
      setError('Deepgram API key not configured. Please check your environment variables.');
      return;
    }

    try {
      // Request mic stream from the OS
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      deepgramMediaStreamRef.current = stream;

      // Open WebSocket connection to Deepgram using the API key
      const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&interim_results=true&punctuate=true`, ['token', deepgramApiKey]);
      deepgramSocketRef.current = socket;

      socket.onopen = () => {
        // On success, start capturing raw mic data chunks
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        deepgramRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          // Stream binary audio to the WebSocket
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(e.data);
          }
        };

        // Push audio data every 100ms
        recorder.start(100);
        setIsDeepgramListening(true);
      };

      socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          const transcript = data?.channel?.alternatives?.[0]?.transcript?.trim();

          if (transcript) {
            // Live update for the user to see their words appearing
            setDeepgramTranscript(transcript);
          }

          // Logic for finalizing a spoken sequence
          if (data.is_final && transcript) {
            if (deepgramSilenceTimeout) clearTimeout(deepgramSilenceTimeout);
            // Append transcribed words to the total spoken text collection
            setSpokenText(prev => prev ? prev + ' ' + transcript : transcript);

            // Set a long timeout (30s) to allow for pauses in reading
            setDeepgramSilenceTimeout(setTimeout(() => {
              stopDeepgramListening();
            }, 30000));
          }
        } catch (error) {
          console.error('Error parsing Deepgram message:', error);
        }
      };

      // Cleanup events for the socket
      socket.onclose = () => setIsDeepgramListening(false);
      socket.onerror = (e) => {
        console.error('Deepgram WebSocket error:', e);
        setError('Speech recognition connection error. Please try again.');
        setIsDeepgramListening(false);
      };

    } catch (err) {
      // Catch hardware or permission errors
      console.error('Error starting Deepgram listening:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone permissions.');
      } else {
        setError(`Microphone error: ${err.message}`);
      }
      setIsDeepgramListening(false);
    }
  };

  // Cleanly terminate the Deepgram WebSocket and Recorder connections
  const stopDeepgramListening = () => {
    if (deepgramRecorderRef.current?.state === 'recording') {
      deepgramRecorderRef.current.stop();
    }
    if (deepgramMediaStreamRef.current) {
      // Loop through tracks and cut off the microphone hardware
      deepgramMediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (deepgramSocketRef.current?.readyState === WebSocket.OPEN) {
      deepgramSocketRef.current.close();
    }
    setIsDeepgramListening(false);
    if (deepgramSilenceTimeout) {
      clearTimeout(deepgramSilenceTimeout);
    }
    setDeepgramSilenceTimeout(null);
  };

  // Helper function to return a bold heading string based on the current error type
  const getErrorHeading = (errorMsg) => {
    if (!errorMsg) return null;
    if (errorMsg.toLowerCase().includes('microphone')) return 'Microphone Error';
    if (errorMsg.toLowerCase().includes('deepgram')) return 'Speech Recognition Error';
    if (errorMsg.toLowerCase().includes('network') || errorMsg.toLowerCase().includes('http error')) return 'Network Error';
    return 'Problem Occurred';
  };

  // Utility to check if an error is client-side hardware related
  const isBrowserError = (errorMsg) => {
    if (!errorMsg) return false;
    return (
      errorMsg.toLowerCase().includes('microphone') ||
      errorMsg.toLowerCase().includes('deepgram') ||
      errorMsg.toLowerCase().includes('speech recognition')
    );
  };

  // Initial loading spinner
  if (loading && !topics.length) {
    return <div className="reading-practice-loading">Loading reading practice...</div>;
  }

  // --- Main Structure Render ---
  return (
    <div className="reading-practice">
      <h2>Reading Practice</h2>

      {/* Visual error alerts with specific troubleshooting steps */}
      {error && (
        <div className="error-message">
          <h5>{getErrorHeading(error)}</h5>
          <p>{error}</p>
          {isBrowserError(error) && (
            <div className="error-solutions">
              <h6>Solutions:</h6>
              <ul>
                <li>Enable microphone access in your browser settings.</li>
                <li>Ensure you are using a modern browser like Chrome or Safari.</li>
                <li>Check your internet connection speed.</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Grid view shown when user needs to select a topic to start */}
      {!selectedTopic && (
        <div className="topic-selection" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>Choose a Reading Category</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(getCategorizedTopics()).map(([categoryName, categoryTopics]) => {
              const isExpanded = activeCategory === categoryName;
              return (
                <div 
                  key={categoryName} 
                  className="lux-card" 
                  style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s ease',
                    background: isExpanded ? '#faf5ff' : 'white'
                  }}
                  onClick={() => setActiveCategory(isExpanded ? null : categoryName)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.08rem', fontWeight: '700', color: '#1e1b4b' }}>
                      {categoryName}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>
                      {categoryTopics.length} Topics
                    </span>
                  </div>

                  {isExpanded && (
                    <div 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                        gap: '12px', 
                        marginTop: '16px',
                        animation: 'fadeIn 0.25s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {categoryTopics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => setSelectedTopic(topic.id)}
                          className="lux-button"
                          style={{
                            padding: '14px',
                            textAlign: 'left',
                            fontSize: '0.92rem',
                            fontWeight: '600',
                            borderRadius: '10px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            color: '#1e1b4b',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          📖 {topic.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active reading view with paragraphs and control panels */}
      {selectedTopic && readingContent && (
        <div className="reading-interface">
          <div className="reading-header">
            <h3>{readingContent.title}</h3>
            <div className="reading-controls">
              {/* Reset session and go back to topic list */}
              <button
                onClick={() => setSelectedTopic(null)}
                className="back-to-topics-btn"
              >
                ← Change Topic
              </button>
            </div>
          </div>

          <div className="reading-content">
            <div className="text-display-container">
              {/* Container for the text being read. Uses ref for scroll control. */}
              <div
                ref={textRef}
                className="text-display"
                style={{
                  height: '300px',
                  overflowY: 'auto'
                }}
              >
                <div className="paragraph-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {readingContent.paragraphs.map((para, idx) => (
                    <p key={idx} style={{ margin: 0, lineHeight: '1.6', fontSize: '1.05rem', color: '#1e1b4b', textAlign: 'left' }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Control panel for microphone, volume, and navigation */}
            <div className="reading-controls-panel">
              <div className="control-buttons">
                {!isReading ? (
                  <button onClick={startReading} className="start-btn">
                    🎤 Start Reading
                  </button>
                ) : (
                  <>
                    {/* Toggle pause and resume */}
                    {isPaused ? (
                      <button onClick={resumeReading} className="resume-btn">
                        ▶️ Resume
                      </button>
                    ) : (
                      <button onClick={pauseReading} className="pause-btn">
                        ⏸️ Pause
                      </button>
                    )}
                    <button onClick={stopReading} className="stop-btn">
                      ⏹️ Stop Session
                    </button>
                  </>
                )}

                <button onClick={repeatParagraph} className="repeat-btn">
                  🔄 Restart
                </button>
              </div>

              {/* Live Mic Animation when audio data is successfully streaming to Deepgram */}
              {isDeepgramListening && (
                <div className="deepgram-mic-wave">
                  <span role="img" aria-label="Mic">🎤</span>
                  <div className="wave-animation">
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                  </div>
                </div>
              )}

              {/* One-click TTS audio play back for pronunciation help - Toggles playback on/off */}
              <button
                onClick={async () => {
                  if (currentAudio) {
                    currentAudio.pause();
                    setCurrentAudio(null);
                    return;
                  }
                  
                  try {
                    const fullText = readingContent.paragraphs.join(" ");
                    const res = await fetch(`${API_URL}/api/ai-tutor/text-to-speech`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: fullText })
                    });
                    const data = await res.json();
                    if (data.audio_url) {
                      const audio = new Audio(data.audio_url);
                      audio.onended = () => setCurrentAudio(null);
                      audio.play();
                      setCurrentAudio(audio);
                    }
                  } catch (error) {
                    console.error('Error playing dynamic TTS guide:', error);
                  }
                }}
                className="tts-btn"
                style={{
                  background: currentAudio ? '#ef4444' : '#f1f5f9',
                  color: currentAudio ? 'white' : '#4f46e5',
                  fontWeight: '600'
                }}
              >
                {currentAudio ? '🛑 Stop AI Voice' : '🔊 AI Pronunciation Guide'}
              </button>

              {/* Real-time statistics about the reading session */}
              <div className="reading-stats">
                <div className="stat">
                  <span>Time: {formatTime(readingTime)}</span>
                </div>
                <div className="stat">
                  <span>Scroll:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                  />
                  <span>{scrollSpeed.toFixed(1)}x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual confirmation of the captured transcript for user validation */}
          {spokenText && (
            <div className="spoken-text-display">
              <h4>Voice Log:</h4>
              <div className="spoken-text">
                {spokenText}
              </div>
            </div>
          )}

          {/* Feedback UI layer: appears after the "Stop" button is clicked and analysis is done */}
          {showResults && feedback && (
            <div className="results-panel">
              <h3>Reading Performance Analysis</h3>

              {/* High-level score cards (Accuracy, Fluency, WPM) */}
              <div className="performance-scores">
                <div className="score-card">
                  <h4>Overall</h4>
                  <div className="score">{feedback.overall_score}%</div>
                </div>
                <div className="score-card">
                  <h4>Accuracy</h4>
                  <div className="score">{feedback.accuracy_score}%</div>
                </div>
                <div className="score-card">
                  <h4>Fluency</h4>
                  <div className="score">{feedback.fluency_score}%</div>
                </div>
                <div className="score-card">
                  <h4>Pace</h4>
                  <div className="score">{feedback.words_per_minute} WPM</div>
                </div>
              </div>

              {/* Written critique from the AI analysis server */}
              <div className="detailed-feedback">
                <h4>Narrative Feedback</h4>
                <p>{feedback.feedback}</p>

                {/* List of specific missed or mispronounced words for targeted practice */}
                {feedback.missed_words?.length > 0 && (
                  <div className="missed-words">
                    <h5>Words to practice:</h5>
                    <div className="word-tags">
                      {feedback.missed_words.slice(0, 10).map((word, index) => (
                        <span key={index} className="word-tag">{word}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Post-analysis actions: retry or proceed */}
              <div className="action-buttons">
                <button onClick={repeatParagraph} className="practice-again-btn">
                  Try Again
                </button>
                {currentParagraph < readingContent.paragraphs.length - 1 && (
                  <button onClick={nextParagraph} className="next-paragraph-btn">
                    Next Section
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Explicit default export for the component
export default ReadingPractice; 