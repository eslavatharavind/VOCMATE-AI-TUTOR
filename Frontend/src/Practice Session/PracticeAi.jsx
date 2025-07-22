import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import "./Practice_Main.css";

function VocMateTutor() {
  const userContext = useUser();
  
  // Local state fallback for segments
  const [localSegments, setLocalSegments] = useState([]);
  
  // Check if context is available and provide fallbacks
  const segments = userContext?.segments || localSegments;
  const setSegments = userContext?.setSegments || setLocalSegments;
  const {voiceId} = useUser();
  
  // Session states
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [stream, setStream] = useState(null);
  
  // Conversation states
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showListening, setShowListening] = useState(true);

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
    // Example: map avatar IDs to gender (customize as needed)
    const femaleIds = ['cgSgspJ2msm6clMCkdW9', '21m00Tcm4TlvDq8ikWAM', 'Lily', 'Anne'];
    if (femaleIds.includes(voiceId)) {
      // Try to find a female English voice
      return voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().match(/female|woman|girl|susan|zoe|emma|linda|samantha|victoria|karen/)) || voices.find(v => v.lang.startsWith('en') && v.gender === 'female') || voices[0];
    }
    // Default: try to find a male English voice
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
            console.warn('ElevenLabs API key or voiceId not configured, using browser speech synthesis');
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel(); // Stop any ongoing speech
              const utterance = new window.SpeechSynthesisUtterance(text);
              utterance.rate = 0.9;
              utterance.pitch = 1;
              // Use avatar-based voice selection
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
          
          // Fallback to browser speech synthesis on API error
          if ('speechSynthesis' in window) {
            console.log('Falling back to browser speech synthesis');
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
    processingRef.current = true;
    stopRecording();
    setSegments(prev => [...prev, { from: 'user', text: message }]);

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
    if (isSpeakingRef.current || processingRef.current) {
      return;
    }
  
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
    if (processingRef.current || isSpeakingRef.current) {
      console.log('Cannot start listening - currently processing or speaking');
      return;
    }
  
    stopRecording();
  
    const deepgramApiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      console.error('Deepgram API key not configured');
      return;
    }
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;
  
      const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?${new URLSearchParams({
        model: 'nova-3',
        language: 'en-US',
        interim_results: 'true',
        endpointing: '5000',
        vad_events: 'true',
        punctuate: 'true',
      })}`, ['token', deepgramApiKey]);
  
      socketRef.current = socket;
      
      socket.onopen = () => {
        const recorder = new MediaRecorder(stream, { 
          mimeType: 'audio/webm;codecs=opus' 
        });
        recorderRef.current = recorder;
  
        recorder.ondataavailable = (e) => {
          if (socket.readyState === WebSocket.OPEN && !isSpeakingRef.current) {
            socket.send(e.data);
          }
        };
  
        recorder.onerror = (e) => {
          console.error('Recorder error:', e);
        };
  
        recorder.start(100);
      };
  
      socket.onmessage = handleDeepgramMessage;
      socket.onclose = (e) => {
        console.log('WebSocket closed:', e.code, e.reason);
        // Attempt to restart listening if connection was lost
        if (e.code !== 1000 && !isSpeakingRef.current && !processingRef.current) {
          setTimeout(() => {
            startListening();
          }, 2000);
        }
      };
      socket.onerror = (e) => {
        console.error('WebSocket error:', e);
      };
  
    } catch (err) {
      console.error('Microphone access error:', err);
    }
  }, [stopRecording]);

  const requestPermissions = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(userStream);
      setPermissionsGranted(true);

      // Initialize conversation
      setTimeout(async () => {
        const welcomeMessage = "Hello! I'm your English AI tutor. What would you like to practice today?";
        setSegments([{ from: 'ai', text: welcomeMessage }]);
        await speak(welcomeMessage);
      }, 100);

    } catch (error) {
      alert('Permissions denied. Please allow access to camera and microphone. Click the lock (or)❕ icon in the address bar → Site settings → Allow camera/mic.');
      console.error('Permission error:', error);
    }
  };

  const stopSession = async () => {
    try {
      console.log('Stopping session...');
      
      // 1. Stop all speech synthesis immediately
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.pause();
      }
  
      // 2. Set flags to prevent any new operations
      isSpeakingRef.current = false;
      processingRef.current = true; // Set to true to block new operations
      setIsSpeaking(false);
  
      // 3. Stop and clear all audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current = null;
      }
  
      // 4. Clear all timeouts
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
  
      // 5. Stop recording and close WebSocket
      stopRecording();
  
      // 6. Force close Deepgram socket if still open
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN || 
            socketRef.current.readyState === WebSocket.CONNECTING) {
          socketRef.current.close(1000, 'Session ended');
        }
        socketRef.current = null;
      }
  
      // 7. Stop MediaRecorder if still active
      if (recorderRef.current) {
        try {
          if (recorderRef.current.state === 'recording' || 
              recorderRef.current.state === 'paused') {
            recorderRef.current.stop();
          }
        } catch (err) {
          console.log('MediaRecorder already stopped');
        }
        recorderRef.current = null;
      }
  
      // 8. Stop all media streams
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        setStream(null);
      }
  
      // 9. Stop media stream from ref
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        mediaStreamRef.current = null;
      }
  
      // 10. Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.pause();
      }
  
      // 11. Clear transcript data
      transcriptsBufferRef.current = [];
      setTranscript('');
  
      // 12. Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));
  
      // 13. Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error stopping session:', error);
      // Force navigation even if there's an error
      navigate('/dashboard');
    }
  };
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Set video stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      stopRecording();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stream, stopRecording]);

  return (
    <div>
      {!permissionsGranted && (
        <div>
          <button onClick={handleBackToDashboard} className='back-to-dashboard-btn'>
            🡐 Back to Dashboard
          </button>
        </div>
      )}

      {!permissionsGranted ? (
        <div className='pre_session'>
          <h2 className='vocmate_rules'>📚 VocMate Tutoring Guidelines</h2>
          <ul className='rules'>
            <li>Ensure your microphone and camera are working properly.</li>
            <li>Find a quiet, well-lit place to focus on learning.</li>
            <li>Speak clearly and don't hesitate to ask questions.</li>
            <li>Practice pronunciation, grammar, vocabulary, or conversation skills.</li>
            <li>Take your time - learning is a process, not a race.</li>
            <li>Feel free to ask for explanations, examples, or corrections.</li>
            <li>We respect your privacy — no audio or video recordings are saved.</li>
            <li>If you encounter any issues, feel free to contact us anytime.</li>
            <li>Allow access to your camera and microphone to begin learning.</li>
          </ul>
          <button
            onClick={requestPermissions}
            className='start_session_btn'
          >
            Start Learning Session
          </button>
        </div>
      ) : (
        <div className='active_session'>
          <h2 className='vocmate_session_head'>VocMate - English AI Tutor</h2>
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className='user_video'
            />
            <div className={`tutor-avatar ${isSpeaking ? 'speaking' : ''}`}>
              <img 
                src={`/avatars/${voiceId}.png`} 
                alt="AI Tutor" 
                className="tutor-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.warn('Tutor image not found');
                }}
              />
            </div>
          </div>
          <button onClick={stopSession} className='end_session'>
            End Session
          </button>

          <div className='conversation_container'>
            <div className="chat-container">
              <div className="message-area">
                {segments.map((message, index) => (
                  <div key={index} className={`message ${message.from}`}>
                    <div className="message-bubble">
                      <div className="message-sender">
                        {message.from === 'user' ? 'You' : 'AI Tutor'}
                      </div>
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
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
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
                  <div className="transcript-preview">
                    <em>You're saying:</em> {transcript}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VocMateTutor;