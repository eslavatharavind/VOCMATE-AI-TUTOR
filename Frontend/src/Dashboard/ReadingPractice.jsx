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

      // If the content comes with a pre-recorded audio guide, play it
      if (data.audio_url) {
        playAudio(data.audio_url);
      }
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

    // Request a TTS audio clip of the current text from the server
    const currentText = readingContent.paragraphs[currentParagraph];
    fetch(`${API_URL}/api/reading/paragraph-audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: currentText })
    }).then(res => res.json()).then(data => {
      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    });
  };

  // Advance to the next section of the text
  const nextParagraph = () => {
    if (!readingContent || currentParagraph >= readingContent.paragraphs.length - 1) return;

    setCurrentParagraph(prev => prev + 1);
    // Reset states for the new paragraph
    setSpokenText('');
    setReadingTime(0);
    setFeedback(null);
    setShowResults(false);

    // Fetch and play TTS audio for the new paragraph to guide the user
    const nextText = readingContent.paragraphs[currentParagraph + 1];
    fetch(`${API_URL}/api/reading/paragraph-audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: nextText })
    }).then(res => res.json()).then(data => {
      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    });
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
      const currentText = readingContent.paragraphs[currentParagraph];

      const response = await fetch(`${API_URL}/api/reading/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_text: currentText,
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
        <div className="topic-selection">
          <h3>Choose a Reading Topic</h3>
          <div className="topics-grid">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className="topic-card"
              >
                <h4>{topic.title}</h4>
                <p>Practice reading with {topic.title.toLowerCase()} content</p>
              </button>
            ))}
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
                  height: '150px',
                  overflowY: 'auto'
                }}
              >
                <div className="paragraph-content">
                  {readingContent.paragraphs[currentParagraph]}
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

                {/* Reset or navigate paragraphs */}
                <button onClick={repeatParagraph} className="repeat-btn">
                  🔄 Restart
                </button>

                {currentParagraph < readingContent.paragraphs.length - 1 && (
                  <button onClick={nextParagraph} className="next-btn">
                    ⏭️ Next Section
                  </button>
                )}
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

              {/* One-click TTS audio play back for pronunciation help */}
              <button
                onClick={async () => {
                  const res = await fetch(`${API_URL}/api/ai-tutor/text-to-speech`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: readingContent.paragraphs[currentParagraph] })
                  });
                  const data = await res.json();
                  if (data.audio_url) playAudio(data.audio_url);
                }}
                className="tts-btn"
              >
                🔊 AI Pronunciation Guide
              </button>

              {/* Real-time statistics about the reading session */}
              <div className="reading-stats">
                <div className="stat">
                  <span>Part: {currentParagraph + 1} / {readingContent.paragraphs.length}</span>
                </div>
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