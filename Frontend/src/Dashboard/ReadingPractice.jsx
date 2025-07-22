import React, { useState, useEffect, useRef } from 'react';
import './ReadingPractice.css';

const ReadingPractice = ({ userId }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [readingContent, setReadingContent] = useState(null);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [readingTime, setReadingTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [scrollSpeed, setScrollSpeed] = useState(1); // words per second
  const [feedback, setFeedback] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const textRef = useRef(null);
  const timerRef = useRef(null);
  const scrollTimerRef = useRef(null);

  // Add manual input mode
  // const [manualInput, setManualInput] = useState('');
  // const [isManualMode, setIsManualMode] = useState(false);

  const [isDeepgramListening, setIsDeepgramListening] = useState(false);
  const [deepgramTranscript, setDeepgramTranscript] = useState('');
  const deepgramSocketRef = useRef(null);
  const deepgramRecorderRef = useRef(null);
  const deepgramMediaStreamRef = useRef(null);
  const [deepgramSilenceTimeout, setDeepgramSilenceTimeout] = useState(null);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      loadReadingContent(selectedTopic);
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (isReading && !isPaused) {
      startReadingTimer();
      startAutoScroll();
    } else {
      stopReadingTimer();
      stopAutoScroll();
    }
  }, [isReading, isPaused, scrollSpeed]);

  // Automatically analyze performance when spokenText is set and reading has stopped
  useEffect(() => {
    if (!isReading && spokenText && !showResults && readingContent) {
      analyzePerformance();
    }
    // Only run when spokenText changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spokenText]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:10000/api/reading/topics');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTopics(data.topics);
    } catch (error) {
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

  const loadReadingContent = async (topicId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:10000/api/reading/content/${topicId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReadingContent(data);
      setCurrentParagraph(0);
      setSpokenText('');
      setReadingTime(0);
      setFeedback(null);
      setShowResults(false);
      
      // Play audio if available
      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    } catch (error) {
      console.error('Error loading reading content:', error);
      setError('Failed to load reading content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startReading = () => {
    if (!readingContent) return;
    
    setIsReading(true);
    setIsPaused(false);
    setStartTime(Date.now());
    setSpokenText('');
    setFeedback(null);
    setShowResults(false);
    setError(null);
    
    // Start Deepgram listening
    startDeepgramListening();
  };

  const pauseReading = () => {
    setIsPaused(true);
    stopDeepgramListening();
  };

  const resumeReading = () => {
    setIsPaused(false);
    startDeepgramListening();
  };

  const stopReading = () => {
    setIsReading(false);
    setIsPaused(false);
    setReadingTime(0);
    stopDeepgramListening(); // Ensure Deepgram listening is stopped immediately
    
    // Analyze performance if there's spoken text
    if (spokenText && readingContent) {
      analyzePerformance();
    } else if (!spokenText) {
      setError('No speech was detected. Please ensure your microphone is working and try again.');
    }
  };

  const repeatParagraph = () => {
    if (!readingContent) return;
    
    setSpokenText('');
    setReadingTime(0);
    setFeedback(null);
    setShowResults(false);
    
    // Generate audio for current paragraph
    const currentText = readingContent.paragraphs[currentParagraph];
    fetch('http://localhost:10000/api/reading/paragraph-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: currentText })
    }).then(res => res.json()).then(data => {
      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    });
  };

  const nextParagraph = () => {
    if (!readingContent || currentParagraph >= readingContent.paragraphs.length - 1) return;
    
    setCurrentParagraph(prev => prev + 1);
    setSpokenText('');
    setReadingTime(0);
    setFeedback(null);
    setShowResults(false);
    
    // Generate audio for next paragraph
    const nextText = readingContent.paragraphs[currentParagraph + 1];
    fetch('http://localhost:10000/api/reading/paragraph-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: nextText })
    }).then(res => res.json()).then(data => {
      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    });
  };

  const startReadingTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      if (startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        setReadingTime(elapsed);
      }
    }, 100);
  };

  const stopReadingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAutoScroll = () => {
    if (scrollTimerRef.current) clearInterval(scrollTimerRef.current);
    
    const scrollStep = 1; // pixels per step
    const stepInterval = 1000 / (scrollSpeed * 10); // adjust for smooth scrolling
    
    scrollTimerRef.current = setInterval(() => {
      if (textRef.current) {
        textRef.current.scrollTop += scrollStep;
      }
    }, stepInterval);
  };

  const stopAutoScroll = () => {
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  };

  const analyzePerformance = async () => {
    if (!readingContent || !spokenText) return;
    
    try {
      setLoading(true);
      const currentText = readingContent.paragraphs[currentParagraph];
      
      const response = await fetch('http://localhost:10000/api/reading/analyze', {
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
      setFeedback(analysis);
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing performance:', error);
      setError('Failed to analyze performance. Please try again.');
    } finally {
      setLoading(false);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualInput = (e) => {
    setManualInput(e.target.value);
  };

  const submitManualInput = () => {
    if (manualInput.trim()) {
      setSpokenText(manualInput);
      setManualInput('');
      setIsManualMode(false);
    }
  };

  const startDeepgramListening = async () => {
    setDeepgramTranscript('');
    setSpokenText('');
    const deepgramApiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
    
    // Better error handling for missing API key
    if (!deepgramApiKey) {
      setError('Deepgram API key not configured. Please check your environment variables.');
      console.error('Deepgram API key is missing');
      return;
    }
    
    console.log('Starting Deepgram listening...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      deepgramMediaStreamRef.current = stream;
      
      const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-3&language=en-US&interim_results=true&punctuate=true`, ['token', deepgramApiKey]);
      deepgramSocketRef.current = socket;
      
      socket.onopen = () => {
        console.log('Deepgram WebSocket connected');
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        deepgramRecorderRef.current = recorder;
        
        recorder.ondataavailable = (e) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(e.data);
            console.log('Audio data sent to Deepgram');
          }
        };
        
        recorder.start(100);
        setIsDeepgramListening(true);
        console.log('Deepgram recording started');
      };
      
      socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          console.log('Deepgram response:', data);
          
          const transcript = data?.channel?.alternatives?.[0]?.transcript?.trim();
          if (transcript) {
            console.log('Transcript received:', transcript);
            setDeepgramTranscript(transcript);
          }
          
          if (data.is_final && transcript) {
            console.log('Final transcript received, setting silence timeout');
            // Increase silence timeout to allow user to complete reading
            if (deepgramSilenceTimeout) clearTimeout(deepgramSilenceTimeout);
            setDeepgramSilenceTimeout(setTimeout(() => {
              console.log('Silence timeout reached, finalizing spoken text');
              setSpokenText(prev => prev ? prev + ' ' + transcript : transcript);
              stopDeepgramListening();
            }, 30000)); // 30 seconds to allow user to complete reading
          }
        } catch (error) {
          console.error('Error parsing Deepgram message:', error);
        }
      };
      
      socket.onclose = (event) => {
        console.log('Deepgram WebSocket closed:', event.code, event.reason);
        setIsDeepgramListening(false);
      };
      
      socket.onerror = (error) => {
        console.error('Deepgram WebSocket error:', error);
        setError('Deepgram connection error. Please check your API key and try again.');
        setIsDeepgramListening(false);
      };
      
    } catch (err) {
      console.error('Error starting Deepgram listening:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Microphone error: ${err.message}`);
      }
      setIsDeepgramListening(false);
    }
  };

  const stopDeepgramListening = () => {
    console.log('Stopping Deepgram listening...');
    if (deepgramRecorderRef.current?.state === 'recording') {
      deepgramRecorderRef.current.stop();
      console.log('MediaRecorder stopped');
    }
    if (deepgramMediaStreamRef.current) {
      deepgramMediaStreamRef.current.getTracks().forEach(track => track.stop());
      console.log('Media stream tracks stopped');
    }
    if (deepgramSocketRef.current?.readyState === WebSocket.OPEN) {
      deepgramSocketRef.current.close();
      console.log('WebSocket closed');
    }
    setIsDeepgramListening(false);
    if (deepgramSilenceTimeout) {
      clearTimeout(deepgramSilenceTimeout);
      console.log('Silence timeout cleared');
    }
    setDeepgramSilenceTimeout(null);
  };

  // Helper to determine error type for heading and solutions
  const getErrorHeading = (errorMsg) => {
    if (!errorMsg) return null;
    if (errorMsg.toLowerCase().includes('microphone')) return 'Microphone Error';
    if (errorMsg.toLowerCase().includes('deepgram')) return 'Speech Recognition Error';
    if (errorMsg.toLowerCase().includes('network') || errorMsg.toLowerCase().includes('http error')) return 'Network Error';
    if (errorMsg.toLowerCase().includes('content')) return 'Content Error';
    if (errorMsg.toLowerCase().includes('topic')) return 'Topic Error';
    return 'Error';
  };

  const isBrowserError = (errorMsg) => {
    if (!errorMsg) return false;
    return (
      errorMsg.toLowerCase().includes('microphone') ||
      errorMsg.toLowerCase().includes('deepgram') ||
      errorMsg.toLowerCase().includes('speech recognition')
    );
  };

  if (loading && !topics.length) {
    return <div className="reading-practice-loading">Loading reading practice...</div>;
  }

  return (
    <div className="reading-practice">
      <h2>Reading Practice</h2>
      
      {error && (
        <div className="error-message">
          <h5>{getErrorHeading(error)}</h5>
          <p>{error}</p>
          {isBrowserError(error) && (
            <div className="error-solutions">
              <h6>Solutions:</h6>
              <ul>
                <li>Use Chrome, Edge, or Safari for best speech recognition support</li>
                <li>Allow microphone permissions when prompted</li>
                <li>Ensure you're on HTTPS or localhost for microphone access</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Topic Selection */}
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
      
      {/* Reading Interface */}
      {selectedTopic && readingContent && (
        <div className="reading-interface">
          <div className="reading-header">
            <h3>{readingContent.title}</h3>
            <div className="reading-controls">
              <button
                onClick={() => setSelectedTopic(null)}
                className="back-btn"
              >
                ← Back to Topics
              </button>
            </div>
          </div>
          
          <div className="reading-content">
            <div className="text-display-container">
              <div
                ref={textRef}
                className="text-display"
                style={{
                  animationPlayState: isReading && !isPaused ? 'running' : 'paused',
                  height: '120px', // Ensure fixed height for scrolling
                  overflowY: 'auto' // Ensure scrollable
                }}
              >
                <div className="paragraph-content">
                  {readingContent.paragraphs[currentParagraph]}
                </div>
              </div>
            </div>
            
            <div className="reading-controls-panel">
              <div className="control-buttons">
                {!isReading ? (
                  <button onClick={startReading} className="start-btn">
                    🎤 Start Reading
                  </button>
                ) : (
                  <>
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
                      ⏹️ Stop
                    </button>
                  </>
                )}
                
                <button onClick={repeatParagraph} className="repeat-btn">
                  🔄 Repeat
                </button>
                
                {currentParagraph < readingContent.paragraphs.length - 1 && (
                  <button onClick={nextParagraph} className="next-btn">
                    ⏭️ Next Paragraph
                  </button>
                )}
              </div>
              {/* Show mic/wave animation when Deepgram is listening */}
              {isDeepgramListening && (
                <div className="deepgram-mic-wave" style={{ margin: '10px 0' }}>
                  <span role="img" aria-label="Mic" style={{ fontSize: 32 }}>🎤</span>
                  <span className="wave-animation" style={{ marginLeft: 10 }}>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                  </span>
                </div>
              )}
              {/* ElevenLabs TTS button */}
              <button
                onClick={async () => {
                  const res = await fetch('http://localhost:10000/api/ai-tutor/text-to-speech', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: readingContent.paragraphs[currentParagraph] })
                  });
                  const data = await res.json();
                  if (data.audio_url) playAudio(data.audio_url);
                }}
                className="tts-btn"
                style={{ marginTop: 8 }}
              >
                🔊 Listen (AI Voice)
              </button>
              
              <div className="reading-stats">
                <div className="stat">
                  <span>Paragraph:</span>
                  <span>{currentParagraph + 1} of {readingContent.paragraphs.length}</span>
                </div>
                <div className="stat">
                  <span>Time:</span>
                  <span>{formatTime(readingTime)}</span>
                </div>
                <div className="stat">
                  <span>Speed:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                    className="speed-slider"
                  />
                  <span>{scrollSpeed.toFixed(1)}x</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Spoken Text Display */}
          {spokenText && (
            <div className="spoken-text-display">
              <h4>What you said:</h4>
              <div className="spoken-text">
                {spokenText}
              </div>
            </div>
          )}
          
          {/* Results */}
          {showResults && !feedback && (
            <div className="results-panel">
              <h3>Generating Feedback...</h3>
              <div style={{textAlign: 'center', padding: '30px'}}>
                <span role="status" aria-live="polite">⏳ Please wait while we analyze your reading...</span>
              </div>
            </div>
          )}
          {showResults && feedback && (
            <div className="results-panel">
              <h3>Reading Performance Analysis</h3>
              
              <div className="performance-scores">
                <div className="score-card">
                  <h4>Overall Score</h4>
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
                  <h4>Speed</h4>
                  <div className="score">{feedback.words_per_minute} WPM</div>
                </div>
              </div>
              
              <div className="detailed-feedback">
                <h4>Detailed Feedback</h4>
                <p>{feedback.feedback}</p>
                
                {feedback.missed_words.length > 0 && (
                  <div className="missed-words">
                    <h5>Words to practice:</h5>
                    <div className="word-tags">
                      {feedback.missed_words.slice(0, 10).map((word, index) => (
                        <span key={index} className="word-tag">{word}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="performance-stats">
                  <p><strong>Reading Time:</strong> {formatTime(feedback.reading_time)}</p>
                  <p><strong>Words Spoken:</strong> {feedback.total_spoken_words}</p>
                  <p><strong>Words Correct:</strong> {feedback.correct_words}</p>
                  <p><strong>Fluency Level:</strong> {feedback.fluency_level}</p>
                </div>
              </div>
              
              <div className="action-buttons">
                <button onClick={repeatParagraph} className="practice-again-btn">
                  Practice Again
                </button>
                {currentParagraph < readingContent.paragraphs.length - 1 && (
                  <button onClick={nextParagraph} className="next-paragraph-btn">
                    Next Paragraph
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Manual Input Mode (fallback) */}
        </div>
      )}
    </div>
  );
};

export default ReadingPractice; 