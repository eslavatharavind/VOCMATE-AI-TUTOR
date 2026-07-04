import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import "./Practice_Main.css";

function VocMateTutor() {
  const userContext = useUser();

  // Local state fallback for segments
  const [localSegments, setLocalSegments] = useState([]);

  // Check if context is available and provide fallbacks
  const segments = userContext?.segments || localSegments;
  const setSegments = userContext?.setSegments || setLocalSegments;
  const { voiceId } = useUser();

  // Session states
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [stream, setStream] = useState(null);

  // Conversation states
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showListening, setShowListening] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    userMessages: 0,
    aiMessages: 0,
    duration: 0,
    startTime: null
  });

  // Refs
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const recorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const transcriptsBufferRef = useRef([]);
  const processingRef = useRef(false);
  const currentSegmentsRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const audioRef = useRef(null);
  const sessionStartRef = useRef(null);

  const { topic } = useParams();
  const navigate = useNavigate();

  // Update segments ref when segments change
  useEffect(() => {
    currentSegmentsRef.current = segments;
  }, [segments]);

  // Handle listening indicator delay
  useEffect(() => {
    if (!isSpeaking) {
      setShowListening(false);

      const timer = setTimeout(() => {
        setShowListening(true);
      }, 1700);

      return () => clearTimeout(timer);
    } else {
      setShowListening(false);
    }
  }, [isSpeaking]);

  const clearSilenceTimeout = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const stopRecording = useCallback(() => {
    clearSilenceTimeout();

    try {
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stop();
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
    }

    recorderRef.current = null;
    mediaStreamRef.current = null;
    socketRef.current = null;
    transcriptsBufferRef.current = [];
    setTranscript('');
  }, []);

  function getVoiceForAvatar(voiceId) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const femaleIds = ['cgSgspJ2msm6clMCkdW9', '21m00Tcm4TlvDq8ikWAM', 'Lily', 'Anne'];
    if (femaleIds.includes(voiceId)) {
      return voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().match(/female|woman|girl|susan|zoe|emma|linda|samantha|victoria|karen/)) || voices.find(v => v.lang.startsWith('en') && v.gender === 'female') || voices[0];
    }
    return voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().match(/male|man|boy|david|alex|daniel|fred|tom/)) || voices.find(v => v.lang.startsWith('en') && v.gender === 'male') || voices[0];
  }

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      const performSpeak = async () => {
        try {
          stopRecording();
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
          transcriptsBufferRef.current = [];
          setTranscript('');
          isSpeakingRef.current = true;
          setIsSpeaking(true);
          const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
          if (!apiKey || !voiceId || voiceId === 'default-voice-id') {
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              const utterance = new window.SpeechSynthesisUtterance(text);
              utterance.rate = 0.9;
              utterance.pitch = 1;
              const selectedVoice = getVoiceForAvatar(voiceId);
              if (selectedVoice) utterance.voice = selectedVoice;
              utterance.onend = () => {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                setTimeout(() => {
                  if (!processingRef.current && !isSpeakingRef.current) {
                    startListening();
                  }
                }, 100);
                resolve();
              };
              utterance.onerror = () => {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                setTimeout(() => {
                  if (!processingRef.current && !isSpeakingRef.current) {
                    startListening();
                  }
                }, 100);
                resolve();
              };
              window.speechSynthesis.speak(utterance);
            } else {
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              setTimeout(() => {
                if (!processingRef.current && !isSpeakingRef.current) {
                  startListening();
                }
              }, 2000);
              resolve();
            }
            return;
          }

          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
              text: text,
              model_id: 'eleven_flash_v2_5',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
              }
            })
          });

          if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);

          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          const handleEnd = () => {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            setTimeout(() => {
              if (!processingRef.current && !isSpeakingRef.current) {
                startListening();
              }
            }, 100);
            resolve();
          };

          audio.onended = handleEnd;
          audio.onerror = (error) => {
            console.error('Audio playback error:', error);
            handleEnd();
          };

          await audio.play();

        } catch (error) {
          console.error('ElevenLabs TTS error:', error);
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.onend = () => {
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              setTimeout(() => {
                if (!processingRef.current && !isSpeakingRef.current) {
                  startListening();
                }
              }, 100);
              resolve();
            };
            utterance.onerror = () => {
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              setTimeout(() => {
                if (!processingRef.current && !isSpeakingRef.current) {
                  startListening();
                }
              }, 100);
              resolve();
            };
            window.speechSynthesis.speak(utterance);
          } else {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            setTimeout(() => {
              if (!processingRef.current && !isSpeakingRef.current) {
                startListening();
              }
            }, 2000);
            resolve();
          }
        }
      };
      performSpeak();
    });
  }, [stopRecording, voiceId]);

  const sendToAI = async (message) => {
    if (!message.trim() || processingRef.current || isSpeakingRef.current) return;
    setSegments(prev => [...prev, { from: 'user', text: message }]);
    setSessionStats(prev => ({ ...prev, userMessages: prev.userMessages + 1 }));
    processingRef.current = true;
    stopRecording();

    try {
      const messagesToSend = currentSegmentsRef.current
        .concat({ from: 'user', text: message })
        .map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/english-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend
        })
      });

      const data = await response.json();
      const aiResponse = data.response || "Could you please repeat that?";

      setSegments(prev => [...prev, { from: 'ai', text: aiResponse }]);
      setSessionStats(prev => ({ ...prev, aiMessages: prev.aiMessages + 1 }));
      await speak(aiResponse);

    } catch (error) {
      console.error('API error:', error);
      const errorMessage = "Connection error. Please try again.";
      setSegments(prev => [...prev, { from: 'ai', text: errorMessage }]);
      await speak(errorMessage);
    } finally {
      processingRef.current = false;
    }
  };

  const handleDeepgramMessage = (message) => {
    if (isSpeakingRef.current || processingRef.current) return;
    try {
      const data = JSON.parse(message.data);
      const transcript = data?.channel?.alternatives?.[0]?.transcript?.trim();
      const isFinal = data.is_final;
      if (!transcript) return;
      if (isFinal) {
        clearSilenceTimeout();
        const currentBuffer = transcriptsBufferRef.current;
        const newTranscript = transcript.toLowerCase();
        if (!currentBuffer.join(' ').toLowerCase().includes(newTranscript)) {
          currentBuffer.push(transcript);
        }
        const fullTranscript = currentBuffer.join(' ').trim();
        setTranscript(`"${fullTranscript}"`);
        silenceTimeoutRef.current = setTimeout(() => {
          if (!isSpeakingRef.current && !processingRef.current && fullTranscript) {
            sendToAI(fullTranscript);
            transcriptsBufferRef.current = [];
            setTranscript('');
          }
        }, 5000);
      } else {
        const currentBuffer = transcriptsBufferRef.current;
        setTranscript(`"${currentBuffer.join(' ')} ${transcript}"`);
      }
    } catch (err) {
      console.error('Deepgram error:', err);
    }
  };

  const startListening = useCallback(async () => {
    if (processingRef.current || isSpeakingRef.current) return;
    stopRecording();
    const deepgramApiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
    if (!deepgramApiKey) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      mediaStreamRef.current = stream;
      const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?${new URLSearchParams({
        model: 'nova-2', language: 'en-US', interim_results: 'true', endpointing: '5000', vad_events: 'true', punctuate: 'true',
      })}`, ['token', deepgramApiKey]);
      socketRef.current = socket;
      socket.onopen = () => {
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        recorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (socket.readyState === WebSocket.OPEN && !isSpeakingRef.current) socket.send(e.data);
        };
        recorder.start(100);
      };
      socket.onmessage = handleDeepgramMessage;
      socket.onclose = (e) => {
        if (e.code !== 1000 && !isSpeakingRef.current && !processingRef.current) {
          setTimeout(() => startListening(), 2000);
        }
      };
    } catch (err) { console.error('Microphone error:', err); }
  }, [stopRecording]);

  const requestPermissions = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(userStream);
      setPermissionsGranted(true);
      sessionStartRef.current = new Date();
      setSessionStats(prev => ({ ...prev, startTime: new Date() }));
      setTimeout(async () => {
        let welcomeMessage = "Hello! I'm your English AI tutor. What would you like to practice today?";

        const currentTopic = decodeURIComponent(topic || "General conversation");

        if (currentTopic && currentTopic !== "General conversation") {
          // Send a hidden prompt to the AI to get a topic-specific opening question
          processingRef.current = true;
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/english-tutor`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [
                  {
                    role: 'user',
                    content: `I want to practice the topic: "${currentTopic}". Please start the conversation by introducing yourself as a tutor and asking me an opening question related to this topic.`
                  }
                ]
              })
            });

            const data = await response.json();
            welcomeMessage = data.response || `Hello! Let's practice "${currentTopic}". To start, could you tell me why you're interested in this topic?`;

            setSegments([{ from: 'ai', text: welcomeMessage }]);
            setSessionStats(prev => ({ ...prev, aiMessages: prev.aiMessages + 1 }));
            await speak(welcomeMessage);
          } catch (error) {
            console.error('Error getting topic welcome:', error);
            welcomeMessage = `Hello! Let's practice "${currentTopic}". How can I help you with this today?`;
            setSegments([{ from: 'ai', text: welcomeMessage }]);
            await speak(welcomeMessage);
          } finally {
            processingRef.current = false;
          }
        } else {
          setSegments([{ from: 'ai', text: welcomeMessage }]);
          await speak(welcomeMessage);
        }
      }, 100);
    } catch (error) {
      alert('Permissions denied.');
      console.error('Permission error:', error);
    }
  };

  const stopSession = async () => {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
      processingRef.current = true;
      setIsSpeaking(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      clearSilenceTimeout();
      stopRecording();

      // Compute final duration
      const endTime = new Date();
      const durationMs = sessionStartRef.current ? (endTime - sessionStartRef.current) : 0;
      const durationSec = Math.floor(durationMs / 1000);
      setSessionStats(prev => ({ ...prev, duration: durationSec }));

      setShowReport(true);
    } catch (error) {
      console.error('Error stopping session:', error);
      setShowReport(true);
    }
  };

  const finalExit = () => {
    navigate('/dashboard', { state: { showAnalytics: true } });
  };

  const handleBackToTopics = () => {
    if (permissionsGranted && !showReport) {
      if (stream) stream.getTracks().forEach(track => track.stop());
      stopRecording();
    }
    navigate('/practice-topics');
  };

  const handleBackToDashboard = () => navigate('/dashboard', { state: { showAnalytics: true } });

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      stopRecording();
      if (audioRef.current) audioRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [stream, stopRecording]);

  return (
    <div className='active_session_wrapper'>
      {!permissionsGranted && (
        <div className="pre-session-nav">
          <button onClick={handleBackToDashboard} className='back-to-dashboard-btn'>
            🡐 Back to Dashboard
          </button>
        </div>
      )}

      {!permissionsGranted ? (
        <div className='pre_session'>
          <div className="pre-session-avatar">
            <img src={`/avatars/${voiceId || 'cgSgspJ2msm6clMCkdW9'}.png`} alt="Your AI Tutor" />
            <span className="pre-session-avatar-ring"></span>
          </div>
          <span className="pre-session-eyebrow">READY TO PRACTICE</span>
          <h2 className='vocmate_rules'>
            {decodeURIComponent(topic || 'General conversation') === 'General conversation'
              ? 'Free Conversation'
              : decodeURIComponent(topic)}
          </h2>
          <p className="pre-session-desc">
            Your AI tutor is ready to talk. Enable your camera and microphone to begin your live speaking session.
          </p>
          <button onClick={requestPermissions} className='start_session_btn'>
            🎙️ Enable Camera &amp; Start
          </button>
          <p className="pre-session-note">🔒 Your privacy is respected — no audio or video is ever saved.</p>
        </div>
      ) : (
        <div className='active_session'>
          <div className="session-header">
            <button onClick={handleBackToTopics} className="session-back-btn">
              ← Exit to Topics
            </button>
            <h2 className='vocmate_session_head'>VocMate AI Tutor</h2>
            <button onClick={stopSession} className='end_session'>
              End Session
            </button>
          </div>

          {showReport && (
            <div className="report-overlay">
              <div className="report-card">
                <div className="report-icon">🏆</div>
                <h2>Session Complete!</h2>
                <p className="report-subtitle">Great job practicing your English today.</p>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{sessionStats.userMessages}</span>
                    <span className="stat-label">Messages</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{Math.floor(sessionStats.duration / 60)}:{(sessionStats.duration % 60).toString().padStart(2, '0')}</span>
                    <span className="stat-label">Time Spent</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{sessionStats.aiMessages}</span>
                    <span className="stat-label">Responses</span>
                  </div>
                </div>
                <div className="report-actions">
                  <button onClick={finalExit} className="report-exit-btn">
                    Finish & Return
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`session-layout ${showReport ? 'blurred' : ''}`}>
            <div className="video-container">
              <video ref={videoRef} autoPlay playsInline muted className='user_video' />
              <div className={`tutor-avatar ${isSpeaking ? 'speaking' : ''}`}>
                <img src={`/avatars/${voiceId}.png`} alt="AI Tutor" className="tutor-image" />
              </div>
            </div>

            <div className='conversation_container'>
              <div className="chat-container">
                <div className="message-area">
                  {segments.map((message, index) => (
                    <div key={index} className={`message ${message.from}`}>
                      <div className="message-bubble">
                        <div className="message-sender">{message.from === 'user' ? 'You' : 'AI Tutor'}</div>
                        <div className="message-text">{message.text}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="status-bar">
                  <div className="status-indicator">
                    {isSpeaking ? (
                      <div className="sound-wave-container">
                        <div className="sound-wave">
                          <div className="wave"></div><div className="wave"></div><div className="wave"></div><div className="wave"></div><div className="wave"></div>
                        </div>
                      </div>
                    ) : (
                      <div className={`pulse-border listening`} />
                    )}
                    <span className="status-text">
                      {isSpeaking ? 'Tutor is speaking...' : (showListening ? 'Listening...' : 'Processing...')}
                    </span>
                  </div>
                  {transcript && !isSpeaking && (
                    <div className="transcript-preview"><em>You:</em> {transcript}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VocMateTutor;