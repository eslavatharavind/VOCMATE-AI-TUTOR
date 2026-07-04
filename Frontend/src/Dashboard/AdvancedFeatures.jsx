// Import necessary React hooks and components
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the ReadingPractice component for use within AdvancedFeatures
import ReadingPractice from './ReadingPractice';
// Import the CSS file for styling the AdvancedFeatures component
import './AdvancedFeatures.css';

// Define the AdvancedFeatures component which takes userId and onBack as props
const AdvancedFeatures = (props) => {
  const navigate = useNavigate();
  const { userId, onBack, initialTab } = props;
  // State to track the currently active feature tab (null means showing the menu)
  const [localActiveTab, setLocalActiveTab] = useState(initialTab || null);
  const activeTab = props.activeTab !== undefined ? props.activeTab : localActiveTab;
  const setActiveTab = props.setActiveTab !== undefined ? props.setActiveTab : setLocalActiveTab;

  // Sync active tab if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  // State to store the user's progress data loaded from the backend
  const [progressData, setProgressData] = useState(null);
  // State to store the current sentence for shadowing practice
  const [shadowingSentence, setShadowingSentence] = useState('');
  // State to store the current topic for shadowing practice
  const [shadowingTopic, setShadowingTopic] = useState('Daily Life');
  // State to store the audio URL of the current shadowing sentence (cached)
  const [shadowingAudioUrl, setShadowingAudioUrl] = useState('');
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
  
  // Conversation Simulator new state variables for custom topics and durations
  const [simulationMethod, setSimulationMethod] = useState('select'); // 'select' or 'custom'
  const [selectedPredefinedScenario, setSelectedPredefinedScenario] = useState(null);
  const [customSimulationTopic, setCustomSimulationTopic] = useState('');
  const [simulationDuration, setSimulationDuration] = useState(5); // 5, 10, or 15 minutes
  const [simulationTimeLeft, setSimulationTimeLeft] = useState(null); // remaining seconds
  const [isSimulationTimeUp, setIsSimulationTimeUp] = useState(false);
  const [simulationValidationError, setSimulationValidationError] = useState('');
  const timerIntervalRef = useRef(null);
  const [simulatorInputText, setSimulatorInputText] = useState('');
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const isChallengeActiveRef = useRef(false);
  const challengeTimeLeftRef = useRef(null);
  const [isSimulatorVoiceEnabled, setIsSimulatorVoiceEnabled] = useState(true);

  // New Speaking Challenges states
  const [selectedChallengeType, setSelectedChallengeType] = useState(null); // null, 'daily', 'jam', 'picture', 'story', 'roleplay', 'debate'
  const [challengeReport, setChallengeReport] = useState(null);
  const [isChallengeLoading, setIsChallengeLoading] = useState(false);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(null);
  const [isChallengeTimeUp, setIsChallengeTimeUp] = useState(false);
  const [challengeValidationError, setChallengeValidationError] = useState('');

  // JAM Challenge states
  const [jamSearchQuery, setJamSearchQuery] = useState('');
  const [jamTopic, setJamTopic] = useState('');
  const [jamCustomTopic, setJamCustomTopic] = useState('');
  const [isJamActive, setIsJamActive] = useState(false);
  const jamSuggestedTopics = ['Climate Change', 'Artificial Intelligence', 'Healthy Living', 'My Role Model', 'Importance of Time', 'Dream Vacation'];

  // Picture Description states
  const [pictureUrl, setPictureUrl] = useState('');
  const [isPictureActive, setIsPictureActive] = useState(false);

  // Story Building states
  const [storyWords, setStoryWords] = useState([]);
  const [isStoryActive, setIsStoryActive] = useState(false);

  // Role Play Challenge states
  const [roleplaySearchQuery, setRoleplaySearchQuery] = useState('');
  const [roleplayScenario, setRoleplayScenario] = useState(null);
  const [roleplayDuration, setRoleplayDuration] = useState(3); // 3 or 5 minutes
  const [roleplayHistory, setRoleplayHistory] = useState([]);
  const [roleplayInputText, setRoleplayInputText] = useState('');
  const [isRoleplayVoiceEnabled, setIsRoleplayVoiceEnabled] = useState(true);
  const roleplayScenariosList = [
    { id: 'job_interview', title: 'Job Interview', role: 'Interviewer', context: 'You are interviewing a candidate for a position.' },
    { id: 'restaurant', title: 'Restaurant', role: 'Waiter', context: 'You are a waiter at a busy restaurant.' },
    { id: 'doctor_visit', title: 'Doctor Visit', role: 'Doctor', context: 'You are a doctor discussing symptoms with a patient.' },
    { id: 'shopping', title: 'Shopping', role: 'Store Assistant', context: 'You are a shop assistant helping a customer.' },
    { id: 'hotel', title: 'Hotel Check-in', role: 'Receptionist', context: 'You are a hotel receptionist helping guests.' },
    { id: 'airport_checkin', title: 'Airport', role: 'Customs Officer', context: 'You are a customs officer checking a traveler\'s passport.' },
    { id: 'customer_support', title: 'Customer Support', role: 'Support Agent', context: 'You are helping a customer resolve an account issue.' },
    { id: 'college_admission', title: 'College Admission', role: 'Admissions Officer', context: 'You are interviewing a candidate for university admission.' },
    { id: 'project_meeting', title: 'Business Meeting', role: 'Project Manager', context: 'You are a manager leading a project status update.' },
    { id: 'banking', title: 'Banking', role: 'Bank Teller', context: 'You are a bank teller helping a customer.' }
  ];

  // Debate Challenge states
  const [debateSearchQuery, setDebateSearchQuery] = useState('');
  const [debateTopic, setDebateTopic] = useState('');
  const [debateCustomTopic, setDebateCustomTopic] = useState('');
  const [debateStance, setDebateStance] = useState('For'); // 'For' or 'Against'
  const [debateDuration, setDebateDuration] = useState(2); // 2 or 5 minutes
  const [isDebateActive, setIsDebateActive] = useState(false);
  const debateTopicsList = [
    'Is AI replacing jobs?',
    'Social Media: Good or Bad?',
    'Online Learning vs Classroom Learning',
    'Should Homework be Banned?',
    'Electric Cars vs Fuel Cars',
    'Should College Education be Free?',
    'Remote Work vs Office Work',
    'Can Technology Replace Teachers?'
  ];

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
  const [showConfetti, setShowConfetti] = useState(false);

  // Vocabulary Builder states
  const [vocabSession, setVocabSession] = useState('setup'); // 'setup' | 'practice' | 'quiz' | 'result'
  const [vocabWords, setVocabWords] = useState([]);
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [vocabQuizScore, setVocabQuizScore] = useState(0);
  const [vocabQuizAnswers, setVocabQuizAnswers] = useState([]);
  const [vocabLoading, setVocabLoading] = useState(false);
  const [favoriteWords, setFavoriteWords] = useState([]);

  // Grammar Practice states
  const [grammarSession, setGrammarSession] = useState('setup'); // 'setup' | 'practice' | 'result'
  const [grammarExercises, setGrammarExercises] = useState([]);
  const [currentGrammarIndex, setCurrentGrammarIndex] = useState(0);
  const [grammarScore, setGrammarScore] = useState(0);
  const [grammarAnswers, setGrammarAnswers] = useState([]);
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarFeedback, setGrammarFeedback] = useState([]);

  // Pronunciation Coach states
  const [pronSession, setPronSession] = useState('setup'); // 'setup' | 'practice' | 'result'
  const [pronWords, setPronWords] = useState([]);
  const [currentPronIndex, setCurrentPronIndex] = useState(0);
  const [pronAttempt, setPronAttempt] = useState('');
  const [pronScore, setPronScore] = useState(0);
  const [pronFeedback, setPronFeedback] = useState('');
  const [pronWordScores, setPronWordScores] = useState([]);
  const [pronLoading, setPronLoading] = useState(false);
  
  // Ref to handle SpeechRecognition.onresult callback dynamically and avoid React stale closures
  const onSpeechRecognizedRef = useRef(null);
  // Ref for live (interim) transcript so modules can show words as the user speaks
  const onInterimTranscriptRef = useRef(null);

  // --- Deepgram streaming STT (reliable, cross-browser — same engine as the main tutor) ---
  const dgSocketRef = useRef(null);
  const dgRecorderRef = useRef(null);
  const dgStreamRef = useRef(null);
  const dgBufferRef = useRef([]);
  const dgSilenceRef = useRef(null);
  const dgMaxRef = useRef(null); // safety cap so a single-shot recording can't get stuck
  const dgContinuousRef = useRef(false); // keep streaming for timed challenges
  const isListeningRef = useRef(false);

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
    // Release the microphone if a recording was active when switching modules
    if (isListeningRef.current) {
      stopListening();
    }
    if (activeTab) {
      // Clear specific ephemeral states when switching tabs
      setSpokenText('');
      setShadowingFeedback(null);
      setIsListening(false);
      setVocabSession('setup');
      setGrammarSession('setup');
      setPronSession('setup');
    }
  }, [activeTab]);

  // Release the microphone when the component unmounts
  useEffect(() => {
    return () => {
      if (isListeningRef.current) {
        stopListening();
      }
    };
  }, []);

  // Trigger confetti milestone celebration when progress dashboard displays milestone celebration today
  useEffect(() => {
    if (activeTab === 'progress' && progressData?.streak?.milestone_celebration) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, progressData]);

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
          setIsListening(false);
          if (onSpeechRecognizedRef.current) {
            onSpeechRecognizedRef.current(transcript);
          }
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
          if (isChallengeActiveRef.current && challengeTimeLeftRef.current > 0) {
            try {
              recognitionInstance.start();
              setIsListening(true);
            } catch (err) {
              console.log("Speech restart ignored:", err);
            }
          }
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

  // Stop any active Deepgram listening session and release the microphone
  const stopListening = () => {
    if (dgSilenceRef.current) {
      clearTimeout(dgSilenceRef.current);
      dgSilenceRef.current = null;
    }
    if (dgMaxRef.current) {
      clearTimeout(dgMaxRef.current);
      dgMaxRef.current = null;
    }
    try {
      if (dgRecorderRef.current && dgRecorderRef.current.state === 'recording') {
        dgRecorderRef.current.stop();
      }
      if (dgStreamRef.current) {
        dgStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (dgSocketRef.current && dgSocketRef.current.readyState === WebSocket.OPEN) {
        dgSocketRef.current.close();
      }
    } catch (err) {
      console.error('Error stopping listening:', err);
    }
    dgRecorderRef.current = null;
    dgStreamRef.current = null;
    dgSocketRef.current = null;
    dgContinuousRef.current = false;
    isListeningRef.current = false;
    setIsListening(false);
  };

  // Start voice capture using Deepgram real-time STT. Reliable across browsers and
  // gives clear feedback if the microphone is blocked (fixes silent "no recording").
  const startListening = async () => {
    // Already recording? Treat a second trigger as "finish": send whatever we captured, then stop.
    if (isListeningRef.current) {
      if (!dgContinuousRef.current) {
        const finalText = dgBufferRef.current.join(' ').trim();
        if (finalText && onSpeechRecognizedRef.current) onSpeechRecognizedRef.current(finalText);
      }
      stopListening();
      return;
    }

    const deepgramApiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      alert('Speech service is not configured. Please add a Deepgram API key.');
      return;
    }

    // Timed challenges keep the mic open and accumulate the whole answer.
    dgContinuousRef.current = !!isChallengeActiveRef.current;
    setSpokenText('');
    dgBufferRef.current = [];

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Could not access your microphone. Please allow microphone access in your browser and try again.');
      setIsListening(false);
      return;
    }

    dgStreamRef.current = stream;
    isListeningRef.current = true;
    setIsListening(true);

    // Safety cap for single-shot modes: auto-finish so the mic can never get stuck on.
    if (!dgContinuousRef.current) {
      dgMaxRef.current = setTimeout(() => {
        const finalText = dgBufferRef.current.join(' ').trim();
        if (finalText && onSpeechRecognizedRef.current) onSpeechRecognizedRef.current(finalText);
        stopListening();
      }, 20000);
    }

    try {
      const socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?${new URLSearchParams({
          model: 'nova-2', language: 'en-US', interim_results: 'true', endpointing: '2500', punctuate: 'true'
        })}`,
        ['token', deepgramApiKey]
      );
      dgSocketRef.current = socket;

      socket.onopen = () => {
        if (!dgStreamRef.current) return;
        const recorder = new MediaRecorder(dgStreamRef.current, { mimeType: 'audio/webm;codecs=opus' });
        dgRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (socket.readyState === WebSocket.OPEN && e.data.size > 0) socket.send(e.data);
        };
        recorder.start(250);
      };

      socket.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          const piece = data?.channel?.alternatives?.[0]?.transcript?.trim();
          if (!piece) return;

          if (data.is_final) {
            dgBufferRef.current.push(piece);
            const full = dgBufferRef.current.join(' ').trim();
            setSpokenText(full);

            if (dgContinuousRef.current) {
              // Challenge: feed each finalized phrase to the shared handler (it accumulates).
              if (onSpeechRecognizedRef.current) onSpeechRecognizedRef.current(piece);
            } else {
              // Single-shot: finalize shortly after the user stops talking.
              if (dgSilenceRef.current) clearTimeout(dgSilenceRef.current);
              dgSilenceRef.current = setTimeout(() => {
                const finalText = dgBufferRef.current.join(' ').trim();
                if (finalText && onSpeechRecognizedRef.current) onSpeechRecognizedRef.current(finalText);
                stopListening();
              }, 1200);
            }
          } else {
            // Show interim words live for responsiveness.
            const preview = (dgBufferRef.current.join(' ') + ' ' + piece).trim();
            setSpokenText(preview);
            // Also surface the live words in modules that show them in an input box
            if (onInterimTranscriptRef.current) onInterimTranscriptRef.current(preview);
          }
        } catch (err) {
          console.error('Deepgram message error:', err);
        }
      };

      socket.onerror = () => {
        console.error('Speech connection error.');
        setIsListening(false);
      };

      socket.onclose = () => {
        isListeningRef.current = false;
        setIsListening(false);
      };
    } catch (err) {
      console.error('Error starting Deepgram session:', err);
      alert('Could not start the speech service. Please try again.');
      stopListening();
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
      const response = await fetch(`${API_URL}/api/shadowing/sentence?topic=${encodeURIComponent(shadowingTopic)}`);
      const data = await response.json();
      setShadowingSentence(data.sentence);
      setShadowingFeedback(null);
      setSpokenText('');
      setShadowingAudioUrl(data.audio_url || '');

      if (data.audio_url) {
        playAudio(data.audio_url);
      }
    } catch (error) {
      console.error('Error getting shadowing sentence:', error);
      setShadowingSentence('Welcome to your English learning journey.');
      setShadowingAudioUrl('');
    }
  };

  // Shadowing Mode: Evaluate the user's performance on the current sentence
  const evaluateShadowing = async (text = spokenText) => {
    const textToEvaluate = text || spokenText;
    if (!textToEvaluate || !shadowingSentence) return;

    try {
      const response = await fetch(`${API_URL}/api/shadowing/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_sentence: shadowingSentence, spoken_text: textToEvaluate })
      });
      const data = await response.json();
      setShadowingFeedback(data);
    } catch (error) {
      console.error('Error evaluating shadowing:', error);
    }
  };

  // Keep the speech recognized callback ref updated on every render to avoid closure bugs
  useEffect(() => {
    onSpeechRecognizedRef.current = (transcript) => {
      setSpokenText(transcript);
      if (activeTab === 'shadowing') {
        evaluateShadowing(transcript);
      } else if (activeTab === 'conversation') {
        setSimulatorInputText(transcript);
      } else if (activeTab === 'challenge' && selectedChallengeType) {
        setAccumulatedTranscript(prev => {
          const sep = prev ? ' ' : '';
          return prev + sep + transcript;
        });
      } else if (activeTab === 'pronunciation') {
        setPronAttempt(transcript);
        evaluatePronunciation(transcript);
      }
    };

    // Live interim words — show them the moment the user starts speaking so it is
    // obvious the mic is recording (the conversation input otherwise stays empty
    // until the phrase is finalized).
    onInterimTranscriptRef.current = (preview) => {
      if (activeTab === 'conversation') {
        setSimulatorInputText(preview);
      }
    };
  });

  // Synchronize active challenge refs to prevent stale closure bugs in browser STT events
  useEffect(() => {
    isChallengeActiveRef.current = (
      isJamActive || isPictureActive || isStoryActive || (roleplayScenario !== null && !isChallengeTimeUp) || isDebateActive
    );
  }, [isJamActive, isPictureActive, isStoryActive, roleplayScenario, isDebateActive, isChallengeTimeUp]);

  useEffect(() => {
    challengeTimeLeftRef.current = challengeTimeLeft;
  }, [challengeTimeLeft]);

  // Format remaining seconds into MM:SS format
  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Conversation Simulator: Start a roleplay based on a chosen scenario
  const startConversation = async (scenario = null, customTopic = null) => {
    try {
      setSimulationValidationError('');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      const payload = {
        duration: simulationDuration
      };
      
      if (customTopic) {
        payload.custom_topic = customTopic;
      } else {
        payload.scenario = scenario;
      }
      
      const response = await fetch(`${API_URL}/api/conversation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.error) {
        setSimulationValidationError(data.error);
        return;
      }
      
      setSelectedScenario(data);
      setConversationHistory([{
        type: 'ai',
        message: data.first_message,
        timestamp: new Date()
      }]);
      
      // Initialize countdown timer
      const durationSeconds = simulationDuration * 60;
      setSimulationTimeLeft(durationSeconds);
      setIsSimulationTimeUp(false);
      
      let secondsLeft = durationSeconds;
      timerIntervalRef.current = setInterval(() => {
        secondsLeft -= 1;
        setSimulationTimeLeft(secondsLeft);
        
        if (secondsLeft <= 0) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          setIsSimulationTimeUp(true);
          
          // Auto-append wrap up AI message and stop conversation
          setConversationHistory(prev => [
            ...prev,
            {
              type: 'ai',
              message: "Time is up! Let's wrap up our conversation. Great job practicing today!",
              grammar_check: "Tip: Practice regularly to maintain your momentum!",
              timestamp: new Date()
            }
          ]);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setSimulationValidationError('Failed to connect to the server. Please try again.');
    }
  };

  // Conversation Simulator: Send a user response to the AI roleplay partner
  const sendConversationMessage = async (message) => {
    if (!selectedScenario || !message.trim() || isSimulationTimeUp) return;

    const updatedHistory = [...conversationHistory, { type: 'user', message, timestamp: new Date() }];
    setConversationHistory(updatedHistory);
    setSimulatorInputText('');

    try {
      const response = await fetch(`${API_URL}/api/conversation/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedScenario.conversation_id,
          user_message: message,
          scenario: selectedScenario.scenario?.scenario || selectedScenario.scenario,
          history: updatedHistory,
          duration: simulationDuration,
          time_left: simulationTimeLeft,
          skip_tts: !isSimulatorVoiceEnabled
        })
      });
      const data = await response.json();

      setConversationHistory(prev => [
        ...prev, 
        { 
          type: 'ai', 
          message: data.ai_response, 
          grammar_check: data.grammar_check, 
          timestamp: new Date() 
        }
      ]);

      if (data.audio_url && isSimulatorVoiceEnabled) {
        playAudio(data.audio_url);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Clean up simulator timer resources
  const handleLeaveSimulation = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setSelectedScenario(null);
    setSelectedPredefinedScenario(null);
    setCustomSimulationTopic('');
    setSimulatorInputText('');
    setSimulationValidationError('');
    setIsSimulationTimeUp(false);
  };

  // Clear timer interval on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

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

  const formatSpeakingTime = (secs) => {
    if (!secs) return '0s';
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    
    let res = '';
    if (hours > 0) res += `${hours}h `;
    if (minutes > 0 || hours > 0) res += `${minutes}m `;
    res += `${seconds}s`;
    return res;
  };

  const renderChallengeReport = (report, challengeType) => {
    if (!report) return null;
    
    // Category mapping to display category-specific scores nicely
    const categories = [];
    if (report.fluency_score !== undefined) categories.push({ label: 'Fluency', score: report.fluency_score });
    if (report.grammar_score !== undefined) categories.push({ label: 'Grammar', score: report.grammar_score });
    if (report.vocabulary_score !== undefined) categories.push({ label: 'Vocabulary', score: report.vocabulary_score });
    if (report.pronunciation_score !== undefined) categories.push({ label: 'Pronunciation', score: report.pronunciation_score });
    if (report.confidence_score !== undefined) categories.push({ label: 'Confidence', score: report.confidence_score });
    if (report.observation_score !== undefined) categories.push({ label: 'Observation', score: report.observation_score });
    if (report.creativity_score !== undefined) categories.push({ label: 'Creativity', score: report.creativity_score });
    if (report.coherence_score !== undefined) categories.push({ label: 'Coherence', score: report.coherence_score });
    if (report.conversation_score !== undefined) categories.push({ label: 'Conversation Skills', score: report.conversation_score });
    if (report.relevance_score !== undefined) categories.push({ label: 'Response Relevance', score: report.relevance_score });
    if (report.professionalism_score !== undefined) categories.push({ label: 'Professionalism', score: report.professionalism_score });
    if (report.reasoning_score !== undefined) categories.push({ label: 'Logical Reasoning', score: report.reasoning_score });
    if (report.persuasiveness_score !== undefined) categories.push({ label: 'Persuasiveness', score: report.persuasiveness_score });
    if (report.structure_score !== undefined) categories.push({ label: 'Argument Structure', score: report.structure_score });

    const total = report.total_score || 60;
    
    // HSL-based colors for total score
    let scoreColor = '#ef4444'; // Red
    let scoreBg = '#fef2f2';
    if (total >= 85) {
      scoreColor = '#10b981'; // Green
      scoreBg = '#ecfdf5';
    } else if (total >= 70) {
      scoreColor = '#3b82f6'; // Blue
      scoreBg = '#eff6ff';
    } else if (total >= 55) {
      scoreColor = '#f59e0b'; // Amber
      scoreBg = '#fffbeb';
    }

    return (
      <div className="lux-card challenge-report" style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <h4 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.25rem' }}>🎯 Challenge Evaluation Report</h4>
          <button className="lux-button lux-button-secondary" onClick={handleLeaveChallenge} style={{ padding: '6px 16px' }}>
            ← Back to Challenges
          </button>
        </div>

        {/* Hero Score Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: scoreBg,
            border: `6px solid ${scoreColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: scoreColor }}>{total}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Score</span>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#1e1b4b', fontSize: '1.1rem' }}>AI Coach Feedback</h5>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {report.feedback}
            </p>
            {report.suggestion && (
              <p style={{ margin: '8px 0 0 0', color: '#4f46e5', fontSize: '0.9rem', fontStyle: 'italic' }}>
                💡 {report.suggestion}
              </p>
            )}
            {report.wpm !== undefined && (
              <div style={{ marginTop: '12px' }}>
                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.85rem', padding: '6px 12px', borderRadius: '12px' }}>
                  ⚡ Pace: <strong>{report.wpm} WPM</strong> (Words per minute)
                </span>
              </div>
            )}
            {report.words_used_status && (
              <div style={{ marginTop: '8px' }}>
                <span className="badge" style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.85rem', padding: '6px 12px', borderRadius: '12px' }}>
                  📌 Words Checklist: {report.words_used_status}
                </span>
              </div>
            )}
            {report.strongest_point && (
              <div style={{ marginTop: '8px', padding: '8px 12px', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '0 8px 8px 0', fontSize: '0.9rem', color: '#1e40af' }}>
                💪 <strong>Strongest Point:</strong> {report.strongest_point}
              </div>
            )}
          </div>
        </div>

        {/* Category progress bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {categories.map((cat, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '600' }}>
                <span style={{ color: '#475569' }}>{cat.label}</span>
                <span style={{ color: '#1e1b4b' }}>{cat.score}/100</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${cat.score}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                  borderRadius: '4px',
                  transition: 'width 1s ease-out'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Strengths & Improvements */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {report.strengths && report.strengths.length > 0 && (
            <div style={{ flex: 1, minWidth: '240px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '12px', padding: '16px' }}>
              <h5 style={{ margin: '0 0 12px 0', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🟢 Key Strengths
              </h5>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#14532d', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                {report.strengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>
          )}

          {report.improvements && report.improvements.length > 0 && (
            <div style={{ flex: 1, minWidth: '240px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px' }}>
              <h5 style={{ margin: '0 0 12px 0', color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🟡 Areas for Improvement
              </h5>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                {report.improvements.map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button
            onClick={() => {
              setChallengeReport(null);
              setIsChallengeTimeUp(false);
              setAccumulatedTranscript('');
              setSpokenText('');
              // Restart challenge depending on selected type
              if (challengeType === 'jam') startJamChallenge(jamTopic || jamCustomTopic);
              else if (challengeType === 'picture') startPictureChallenge();
              else if (challengeType === 'story') startStoryChallenge();
              else if (challengeType === 'debate') startDebateChallenge(debateTopic || debateCustomTopic);
              else if (challengeType === 'roleplay') startRoleplayChallenge(roleplayScenario);
            }}
            className="lux-button"
            style={{ flex: 1, padding: '12px' }}
          >
            🔄 Try Challenge Again
          </button>
          <button onClick={handleLeaveChallenge} className="lux-button lux-button-secondary" style={{ flex: 1, padding: '12px' }}>
            📁 Exit to Challenges
          </button>
        </div>
      </div>
    );
  };

  // Universal challenge reset and cleanup
  const handleLeaveChallenge = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (isListeningRef.current) {
      stopListening();
    }
    
    // Reset all sub-challenge states
    setSelectedChallengeType(null);
    setChallengeReport(null);
    setIsChallengeLoading(false);
    setChallengeTimeLeft(null);
    setIsChallengeTimeUp(false);
    setChallengeValidationError('');
    setAccumulatedTranscript('');
    
    setJamTopic('');
    setJamCustomTopic('');
    setIsJamActive(false);
    
    setPictureUrl('');
    setIsPictureActive(false);
    
    setStoryWords([]);
    setIsStoryActive(false);
    
    setRoleplayScenario(null);
    setRoleplayHistory([]);
    setRoleplayInputText('');
    
    setDebateTopic('');
    setDebateCustomTopic('');
    setIsDebateActive(false);
  };

  // Unified evaluation submit call
  const submitChallengeEvaluation = async (type, extraData = {}) => {
    if (isListeningRef.current) {
      stopListening();
    }
    setIsChallengeLoading(true);
    
    const textToSubmit = accumulatedTranscript.trim() || spokenText.trim() || "No response recorded.";
    
    try {
      const payload = {
        user_id: userId,
        challenge_type: type,
        spoken_text: textToSubmit,
        ...extraData
      };
      
      const response = await fetch(`${API_URL}/api/challenges/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setChallengeReport(data);
      loadProgressData();
    } catch (error) {
      console.error('Error evaluating challenge:', error);
      setChallengeValidationError('Failed to get evaluation from AI coach.');
    } finally {
      setIsChallengeLoading(false);
    }
  };

  // JAM Challenge helpers
  const startJamChallenge = (topicName) => {
    setChallengeValidationError('');
    setChallengeReport(null);
    setAccumulatedTranscript('');
    setIsChallengeTimeUp(false);
    setSpokenText('');
    setIsJamActive(true);
    isChallengeActiveRef.current = true; // stream continuously for the timed challenge

    const durationSeconds = 60;
    setChallengeTimeLeft(durationSeconds);

    startListening();
    
    let secondsLeft = durationSeconds;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      setChallengeTimeLeft(secondsLeft);
      
      if (secondsLeft <= 0) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setIsChallengeTimeUp(true);
        setIsJamActive(false);
        
        submitChallengeEvaluation('jam', { topic: topicName });
      }
    }, 1000);
  };

  // Picture Description helpers
  const loadRandomPicture = async () => {
    try {
      const response = await fetch(`${API_URL}/api/challenges/picture/random`);
      const data = await response.json();
      setPictureUrl(data.image_url);
    } catch (error) {
      console.error('Error fetching random picture:', error);
    }
  };

  const startPictureChallenge = () => {
    setChallengeValidationError('');
    setChallengeReport(null);
    setAccumulatedTranscript('');
    setIsChallengeTimeUp(false);
    setSpokenText('');
    setIsPictureActive(true);
    isChallengeActiveRef.current = true; // stream continuously for the timed challenge

    const durationSeconds = 60;
    setChallengeTimeLeft(durationSeconds);

    startListening();
    
    let secondsLeft = durationSeconds;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      setChallengeTimeLeft(secondsLeft);
      
      if (secondsLeft <= 0) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setIsChallengeTimeUp(true);
        setIsPictureActive(false);
        
        submitChallengeEvaluation('picture', { image_url: pictureUrl });
      }
    }, 1000);
  };

  // Story Building helpers
  const loadStoryWords = async () => {
    try {
      const response = await fetch(`${API_URL}/api/challenges/story/words`);
      const data = await response.json();
      setStoryWords(data.words);
    } catch (error) {
      console.error('Error fetching story words:', error);
    }
  };

  const startStoryChallenge = () => {
    setChallengeValidationError('');
    setChallengeReport(null);
    setAccumulatedTranscript('');
    setIsChallengeTimeUp(false);
    setSpokenText('');
    setIsStoryActive(true);
    isChallengeActiveRef.current = true; // stream continuously for the timed challenge

    const durationSeconds = 120; // 2 minutes
    setChallengeTimeLeft(durationSeconds);

    startListening();
    
    let secondsLeft = durationSeconds;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      setChallengeTimeLeft(secondsLeft);
      
      if (secondsLeft <= 0) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setIsChallengeTimeUp(true);
        setIsStoryActive(false);
        
        submitChallengeEvaluation('story', { words: storyWords });
      }
    }, 1000);
  };

  // Debate Challenge helpers
  const startDebateChallenge = (topicName) => {
    setChallengeValidationError('');
    setChallengeReport(null);
    setAccumulatedTranscript('');
    setIsChallengeTimeUp(false);
    setSpokenText('');
    setIsDebateActive(true);
    isChallengeActiveRef.current = true; // stream continuously for the timed challenge

    const durationSeconds = debateDuration * 60;
    setChallengeTimeLeft(durationSeconds);

    startListening();
    
    let secondsLeft = durationSeconds;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      setChallengeTimeLeft(secondsLeft);
      
      if (secondsLeft <= 0) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setIsChallengeTimeUp(true);
        setIsDebateActive(false);
        
        submitChallengeEvaluation('debate', { topic: topicName, stance: debateStance });
      }
    }, 1000);
  };

  // Roleplay Challenge helpers
  const submitRoleplayChallengeEvaluation = async (historyState = null) => {
    const activeHistory = historyState || roleplayHistory;
    const userMessages = activeHistory
      .filter(msg => msg.type === 'user')
      .map(msg => msg.message);
      
    const combinedSpokenText = userMessages.join(" ") || "No response recorded.";
    setIsChallengeLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/challenges/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          challenge_type: 'roleplay',
          spoken_text: combinedSpokenText,
          topic: roleplayScenario.title
        })
      });
      const data = await response.json();
      setChallengeReport(data);
      loadProgressData();
    } catch (error) {
      console.error('Error submitting roleplay challenge evaluation:', error);
      setChallengeValidationError('Failed to get evaluation from AI coach.');
    } finally {
      setIsChallengeLoading(false);
    }
  };

  const startRoleplayChallenge = async (scenario) => {
    setChallengeValidationError('');
    setChallengeReport(null);
    setIsChallengeTimeUp(false);
    setRoleplayHistory([]);
    setRoleplayInputText('');
    setRoleplayScenario(scenario);
    
    if (isListeningRef.current) {
      stopListening();
    }
    
    try {
      const response = await fetch(`${API_URL}/api/conversation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_topic: scenario.title,
          duration: roleplayDuration
        })
      });
      const data = await response.json();
      
      const initialHistory = [{
        type: 'ai',
        message: data.first_message,
        timestamp: new Date()
      }];
      setRoleplayHistory(initialHistory);
      
      const durationSeconds = roleplayDuration * 60;
      setChallengeTimeLeft(durationSeconds);
      
      let secondsLeft = durationSeconds;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        secondsLeft -= 1;
        setChallengeTimeLeft(secondsLeft);
        
        if (secondsLeft <= 0) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          setIsChallengeTimeUp(true);
          
          // Need to grab current history state dynamically on end
          setRoleplayHistory(currentHist => {
            submitRoleplayChallengeEvaluation(currentHist);
            return currentHist;
          });
        }
      }, 1000);
      
    } catch (err) {
      console.error('Error starting roleplay challenge:', err);
      setChallengeValidationError('Failed to connect to AI roleplay partner.');
    }
  };

  const sendRoleplayChallengeMessage = async (message) => {
    if (!roleplayScenario || !message.trim() || isChallengeTimeUp) return;
    
    const updatedHistory = [...roleplayHistory, { type: 'user', message, timestamp: new Date() }];
    setRoleplayHistory(updatedHistory);
    setRoleplayInputText('');
    
    try {
      const response = await fetch(`${API_URL}/api/conversation/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: 'challenge_roleplay',
          user_message: message,
          scenario: roleplayScenario.title,
          history: updatedHistory,
          duration: roleplayDuration,
          time_left: challengeTimeLeft,
          skip_tts: !isRoleplayVoiceEnabled
        })
      });
      const data = await response.json();
      
      setRoleplayHistory(prev => [
        ...prev,
        {
          type: 'ai',
          message: data.ai_response,
          grammar_check: data.grammar_check,
          timestamp: new Date()
        }
      ]);
      
      if (data.audio_url && isRoleplayVoiceEnabled) {
        playAudio(data.audio_url);
      }
    } catch (err) {
      console.error('Error in challenge roleplay chat:', err);
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

  // --- Pronunciation Coach Similarity Helper ---
  const calculateSimilarity = (s1, s2) => {
    const clean = (s) => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").replace(/\s+/g," ").trim();
    const w1 = clean(s1).split(" ");
    const w2 = clean(s2).split(" ");
    if (w1.length === 0 || w2.length === 0) return 0;
    let matches = 0;
    w1.forEach(word => {
      if (w2.includes(word)) {
        matches++;
      }
    });
    return Math.round((matches / Math.max(w1.length, w2.length)) * 100);
  };

  // --- Vocabulary Builder Helpers ---
  const vocabLibrary = [
    { word: "Eloquent", phonetic: "/ˈel.ə.kwənt/", definition: "Fluent or persuasive in speaking or writing.", example: "She gave an eloquent speech that moved the entire audience.", synonyms: "persuasive, articulate, expressive", antonyms: "inarticulate, hesitant, tongue-tied" },
    { word: "Resilient", phonetic: "/rɪˈzɪl.i.ənt/", definition: "Able to withstand or recover quickly from difficult conditions.", example: "The local businesses proved resilient despite the economic downturn.", synonyms: "tough, hardy, strong", antonyms: "vulnerable, fragile, weak" },
    { word: "Pragmatic", phonetic: "/præɡˈmæt.ɪk/", definition: "Dealing with things sensibly and realistically in a practical way.", example: "We need a pragmatic approach to solve this budget issue.", synonyms: "practical, sensible, down-to-earth", antonyms: "idealistic, impractical, visionary" },
    { word: "Ubiquitous", phonetic: "/juːˈbɪk.wɪ.təs/", definition: "Present, appearing, or found everywhere.", example: "Smartphones have become ubiquitous in modern society.", synonyms: "omnipresent, universal, widespread", antonyms: "rare, scarce, unique" },
    { word: "Meticulous", phonetic: "/məˈtɪk.jə.ləs/", definition: "Showing great attention to detail; very careful and precise.", example: "He was meticulous about keeping his desk clean and organized.", synonyms: "precise, careful, diligent", antonyms: "careless, sloppy, negligent" },
    { word: "Cognizant", phonetic: "/ˈkɒɡ.nɪ.zənt/", definition: "Having knowledge or being aware of something.", example: "We must be cognizant of the potential risks before investing.", synonyms: "aware, conscious, mindful", antonyms: "unaware, ignorant, oblivious" },
    { word: "Superfluous", phonetic: "/suːˈpɜː.flu.əs/", definition: "Unnecessary, especially through being more than enough.", example: "Avoid adding superfluous details to your business report.", synonyms: "redundant, excess, extra", antonyms: "necessary, essential, vital" },
    { word: "Exacerbate", phonetic: "/ɪɡˈzæs.ə.beɪt/", definition: "Make a problem, bad situation, or negative feeling worse.", example: "Running on a sprained ankle will only exacerbate the injury.", synonyms: "aggravate, worsen, inflame", antonyms: "alleviate, improve, soothe" }
  ];

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVocabPractice = async () => {
    setVocabLoading(true);
    setVocabSession('practice');
    setCurrentVocabIndex(0);
    
    try {
      // Shuffle library and take 5 words
      const shuffled = [...vocabLibrary].sort(() => 0.5 - Math.random()).slice(0, 5);
      setVocabWords(shuffled);
    } catch (err) {
      console.error(err);
    } finally {
      setVocabLoading(false);
    }
  };

  const toggleFavorite = (word) => {
    if (favoriteWords.includes(word)) {
      setFavoriteWords(prev => prev.filter(w => w !== word));
    } else {
      setFavoriteWords(prev => [...prev, word]);
    }
  };

  const startVocabQuiz = () => {
    // Generate questions
    const quizData = vocabWords.map((item, index) => {
      // Correct definition
      const correctDef = item.definition;
      // Gather incorrect definitions from the other words
      const incorrectDefs = vocabLibrary
        .filter(w => w.word !== item.word)
        .map(w => w.definition);
      // Take 3 random incorrect definitions
      const randomIncorrect = incorrectDefs.sort(() => 0.5 - Math.random()).slice(0, 3);
      // Mix and shuffle options
      const options = [correctDef, ...randomIncorrect].sort(() => 0.5 - Math.random());
      
      return {
        word: item.word,
        correctOption: correctDef,
        options: options
      };
    });
    
    setVocabQuizAnswers(new Array(5).fill(null));
    setVocabQuizScore(0);
    setVocabWords(vocabWords.map((w, idx) => ({ ...w, quiz: quizData[idx] })));
    setVocabSession('quiz');
    setCurrentVocabIndex(0);
  };

  const handleSelectVocabAnswer = (option) => {
    const updatedAnswers = [...vocabQuizAnswers];
    updatedAnswers[currentVocabIndex] = option;
    setVocabQuizAnswers(updatedAnswers);
  };

  const submitVocabQuiz = () => {
    let finalScore = 0;
    vocabWords.forEach((wordObj, idx) => {
      if (vocabQuizAnswers[idx] === wordObj.definition) {
        finalScore += 20; // 20 points per correct answer (total 100)
      }
    });
    setVocabQuizScore(finalScore);
    setVocabSession('result');
    recordSession('Vocabulary Practice', finalScore);
  };

  // --- Grammar Practice Helpers ---
  const grammarQuestionBank = [
    { type: "blank", sentence: "She ___ to school every day by bus.", options: ["goes", "go", "going", "gone"], correctAnswer: "goes", explanation: "For third-person singular (She), the present simple verb takes '-es' (goes)." },
    { type: "blank", sentence: "We look forward to ___ you at the conference next week.", options: ["seeing", "see", "seen", "to see"], correctAnswer: "seeing", explanation: "'Look forward to' is followed by a gerund (verb + -ing)." },
    { type: "blank", sentence: "If it ___ tomorrow, we will cancel our picnic.", options: ["rains", "rain", "will rain", "rained"], correctAnswer: "rains", explanation: "In the first conditional, the 'if' clause uses present simple (rains)." },
    { type: "correction", prompt: "Fix the grammatical errors in this sentence:", sentence: "He don't has no money for buying food.", correctAnswer: "He doesn't have any money to buy food.", explanation: "'He' takes 'doesn't', double negatives ('don't has no') should be replaced with 'doesn't have any', and 'for buying' becomes 'to buy'." },
    { type: "correction", prompt: "Correct the sentence punctuation and tense:", sentence: "She is living here since five years.", correctAnswer: "She has been living here for five years.", explanation: "Use present perfect continuous ('has been living') for action starting in the past continuing now, and 'for' to denote a duration of time ('five years')." },
    { type: "blank", sentence: "He is interested ___ learning new foreign languages.", options: ["in", "on", "at", "about"], correctAnswer: "in", explanation: "The adjective 'interested' is paired with the preposition 'in'." },
    { type: "blank", sentence: "They have been married ___ twenty years.", options: ["for", "since", "during", "ago"], correctAnswer: "for", explanation: "Use 'for' to show a duration of time (20 years) and 'since' for a specific point in time." },
    { type: "correction", prompt: "Fix the subject-verb agreement:", sentence: "Every one of the students are ready for the test.", correctAnswer: "Every one of the students is ready for the test.", explanation: "'Every one' is a singular subject, so it requires a singular verb ('is')." }
  ];

  const startGrammarPractice = () => {
    setGrammarLoading(true);
    setGrammarSession('practice');
    setCurrentGrammarIndex(0);
    setGrammarScore(0);
    setGrammarAnswers(new Array(5).fill(''));
    
    // Select 5 random exercises
    const shuffled = [...grammarQuestionBank].sort(() => 0.5 - Math.random()).slice(0, 5);
    setGrammarExercises(shuffled);
    setGrammarLoading(false);
  };

  const handleGrammarSubmitAnswer = (val) => {
    const updatedAnswers = [...grammarAnswers];
    updatedAnswers[currentGrammarIndex] = val;
    setGrammarAnswers(updatedAnswers);
    
    // Auto-advance or wait
    if (currentGrammarIndex < 4) {
      setCurrentGrammarIndex(prev => prev + 1);
    } else {
      // Evaluate and calculate results
      let finalScore = 0;
      const feedbackArray = [];
      
      grammarExercises.forEach((ex, idx) => {
        const userAns = updatedAnswers[idx].trim().toLowerCase();
        const correctAns = ex.correctAnswer.trim().toLowerCase();
        let isCorrect = false;
        
        if (ex.type === 'blank') {
          isCorrect = userAns === correctAns;
        } else {
          // Fuzzy comparison for user typing correction
          const score = calculateSimilarity(userAns, correctAns);
          isCorrect = score >= 75;
        }
        
        if (isCorrect) finalScore += 20;
        feedbackArray.push({
          exercise: ex,
          userAnswer: updatedAnswers[idx],
          isCorrect,
          scoreValue: isCorrect ? 20 : 0
        });
      });
      
      setGrammarScore(finalScore);
      setGrammarFeedback(feedbackArray);
      setGrammarSession('result');
      recordSession('Grammar Practice', finalScore);
    }
  };

  // --- Pronunciation Coach Helpers ---
  const pronWordsLibrary = [
    { word: "Entrepreneurship", phonetic: "/ˌɒn.trə.prəˈnɜː.ʃɪp/", tip: "Focus on the first sound: 'ON-truh-pruh-NUR-ship'. Keep the 'r' sounds smooth." },
    { word: "Phenomenon", phonetic: "/fəˈnɒm.ɪ.nən/", tip: "Pronounce as 'fuh-NOM-uh-non'. Make sure the 'm' and 'n' are distinct." },
    { word: "Mischievous", phonetic: "/ˈmɪs.tʃɪ.vəs/", tip: "Say 'MIS-chih-vuhs'. Do not add an extra syllable (it's not mis-chee-vee-uhs)." },
    { word: "Specific", phonetic: "/spəˈsɪf.ɪk/", tip: "Start with a soft 'spuh' sound: 'spuh-SIF-ik'. Avoid saying 'pacific'." },
    { word: "Anemone", phonetic: "/əˈnem.ə.ni/", tip: "Pronounce as 'uh-NEM-uh-nee'. Keep the syllables light and flowing." },
    { word: "Asterisk", phonetic: "/ˈæs.tə.rɪsk/", tip: "End clearly with the 'sk' sound: 'AS-tuh-risk'. Avoid saying 'asterix'." }
  ];

  const startPronPractice = () => {
    setPronLoading(true);
    setPronSession('practice');
    setCurrentPronIndex(0);
    setPronWordScores([]);
    setPronAttempt('');
    setPronScore(0);
    setPronFeedback('');
    
    const shuffled = [...pronWordsLibrary].sort(() => 0.5 - Math.random()).slice(0, 4);
    setPronWords(shuffled);
    setPronLoading(false);
  };

  const evaluatePronunciation = (userSpokenText) => {
    if (!userSpokenText || !pronWords || pronWords.length === 0) return;
    const currentWordObj = pronWords[currentPronIndex];
    if (!currentWordObj) return;
    const targetWord = currentWordObj.word;
    const matchScore = calculateSimilarity(userSpokenText, targetWord);
    
    // Force a minimal logical accuracy score: if exact word matched in transcript, give high score
    const finalScore = matchScore > 0 ? Math.max(matchScore, 70) : 10;
    
    setPronScore(finalScore);
    
    let feedback = "";
    if (finalScore >= 85) {
      feedback = "Excellent! Perfect clear accent and pacing.";
    } else if (finalScore >= 60) {
      feedback = `Good try! ${currentWordObj.tip}`;
    } else {
      feedback = `Let's try again. ${currentWordObj.tip}`;
    }
    setPronFeedback(feedback);

    // Automatically transition to next word after 2.5 seconds
    setTimeout(() => {
      handleNextPronWord(finalScore);
    }, 2500);
  };

  const handleNextPronWord = (scoreToRecord) => {
    const scoreVal = scoreToRecord !== undefined ? scoreToRecord : pronScore;
    setPronWordScores(prev => {
      const updatedScores = [...prev, scoreVal];
      
      setPronAttempt('');
      setPronScore(0);
      setPronFeedback('');
      
      if (currentPronIndex < 3) {
        setCurrentPronIndex(prevIdx => prevIdx + 1);
      } else {
        // Calculate final average score
        const totalScore = updatedScores.reduce((acc, s) => acc + s, 0);
        const averageScore = Math.round(totalScore / 4);
        setPronScore(averageScore);
        setPronSession('result');
        recordSession('Pronunciation Practice', averageScore);
      }
      return updatedScores;
    });
  };

  // Main UI Render Method
  return (
    <div className="advanced-features">
      <style>{`
        @keyframes pulse-fire {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.2)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.55)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.2)); }
        }
        .pulsing-fire {
          animation: pulse-fire 2s infinite ease-in-out;
        }
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      {/* Decorative background blobs for the ultra-premium mesh background effect */}
      <div className="bg-blob-1"></div>
      <div className="bg-blob-2"></div>

          {/* Back to Features Menu button - Rendered inline when a specific practice screen is open */}
      {activeTab && activeTab !== 'progress' && (
        <div className="features-nav-header" style={{ marginBottom: '24px' }}>
          <div className="top-nav-buttons" style={{ justifyContent: 'flex-start' }}>
            <button className="menu-back-btn" onClick={() => setActiveTab(null)} title="Back to Features Menu" style={{ width: 'auto', flex: 'none' }}>
              <span className="icon">🔙</span> Back to Features Menu
            </button>
          </div>
        </div>
      )}

      <div className="feature-content">
        {/* Main Dashboard Menu Overlay */}
        {!activeTab && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            <h2 className="section-title" style={{ margin: '0 0 20px 0', fontSize: '2rem', color: '#f1f5f9', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ✨ Advanced Features
            </h2>
            
            <div className="features-menu-grid">
              {/* 2. Reading Practice */}
              <div className="menu-card" onClick={() => setActiveTab('reading')}>
                <div className="menu-card-icon">📖</div>
                <h4>Reading Practice</h4>
                <p>Improve pronunciation and reading skills.</p>
                <button className="start-btn">Start →</button>
              </div>

              {/* 3. Shadowing Practice */}
              <div className="menu-card" onClick={() => setActiveTab('shadowing')}>
                <div className="menu-card-icon">🎧</div>
                <h4>Shadowing Practice</h4>
                <p>Speak along with native speakers.</p>
                <button className="start-btn">Start →</button>
              </div>

              {/* 4. Scenario Simulator */}
              <div className="menu-card" onClick={() => setActiveTab('conversation')}>
                <div className="menu-card-icon">💬</div>
                <h4>Scenario Simulator</h4>
                <p>Practice real-life conversations.</p>
                <button className="start-btn">Start →</button>
              </div>

              {/* 5. Daily Speaking Challenge */}
              <div className="menu-card" onClick={() => setActiveTab('challenge')}>
                <div className="menu-card-icon">🏆</div>
                <h4>Daily Speaking Challenge</h4>
                <p>Complete daily speaking challenges.</p>
                <button className="start-btn">Start →</button>
              </div>

              {/* 6. Vocabulary Builder */}
              <div className="menu-card" onClick={() => setActiveTab('vocabulary')}>
                <div className="menu-card-icon">📚</div>
                <h4>Vocabulary Builder</h4>
                <p>Learn new words every day.</p>
                <button className="start-btn">Start →</button>
              </div>

              {/* 7. Grammar Practice */}
              <div className="menu-card" onClick={() => setActiveTab('grammar')}>
                <div className="menu-card-icon">✍️</div>
                <h4>Grammar Practice</h4>
                <p>Improve grammar with AI feedback.</p>
                <button className="start-btn">Start →</button>
              </div>

              {/* 8. Pronunciation Coach */}
              <div className="menu-card" onClick={() => setActiveTab('pronunciation')}>
                <div className="menu-card-icon">🎯</div>
                <h4>Pronunciation Coach</h4>
                <p>Practice difficult words and sounds.</p>
                <button className="start-btn">Start →</button>
              </div>
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

        {/* Progress Tracker (Analytics) Module */}
        {(activeTab === 'progress' || !activeTab) && (
          <div className="feature-container progress-dashboard" style={{ animation: 'fadeIn 0.3s ease', marginTop: !activeTab ? '60px' : '0', borderTop: !activeTab ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingTop: !activeTab ? '40px' : '0' }}>
            
            {/* Confetti Celebration Element */}
            {showConfetti && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
                {Array.from({ length: 80 }).map((_, i) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                  const randomColor = colors[Math.floor(Math.random() * colors.length)];
                  const randomLeft = Math.random() * 100;
                  const randomDelay = Math.random() * 3;
                  const randomSize = Math.floor(Math.random() * 6) + 8;
                  const randomRot = Math.random() * 360;
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${randomLeft}%`,
                        backgroundColor: randomColor,
                        width: `${randomSize}px`,
                        height: `${randomSize}px`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        top: '-20px',
                        transform: `rotate(${randomRot}deg)`,
                        animation: `fall 3.5s linear ${randomDelay}s forwards`,
                        opacity: 0.9
                      }}
                    />
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 id="dashboard-analytics-heading" className="section-title" style={{ margin: 0, fontSize: '2rem', color: '#f1f5f9', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📊 Analytics
              </h2>
              <button onClick={loadProgressData} className="lux-button lux-button-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🔄 Refresh Stats
              </button>
            </div>

            {loading ? (
              <div className="lux-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ color: '#64748b' }}>Analyzing practice logs and compiling scores...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. Overall Progress Grid Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                  
                  {/* Circular Score Gauge Card */}
                  <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '12px' }}>
                    <div style={{
                      width: '130px',
                      height: '130px',
                      borderRadius: '50%',
                      background: `conic-gradient(#6366f1 ${(progressData?.overall_score || 0)}%, #e2e8f0 ${(progressData?.overall_score || 0)}% 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                    }}>
                      <div style={{
                        width: '110px',
                        height: '110px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '2.1rem', fontWeight: '800', color: '#1e1b4b' }}>
                          {progressData?.overall_score || 0}%
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                          English Score
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Level & XP Card */}
                  <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Current Rank</span>
                    <h4 style={{ margin: 0, fontSize: '1.8rem', color: '#4f46e5' }}>
                      {progressData?.english_level || 'Beginner'}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>
                      <span>Level {progressData?.user_progress?.level || 1}</span>
                      <span>{progressData?.user_progress?.experience || 0} / {((progressData?.user_progress?.level || 1) * 1000)} XP</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${((progressData?.user_progress?.experience || 0) % 1000) / 10}%`,
                        height: '100%',
                        backgroundColor: '#4f46e5',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>

                  {/* Completed Activities Card */}
                  <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', gap: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>🎯</span>
                    <h3 style={{ margin: 0, fontSize: '2rem', color: '#1e1b4b', fontWeight: '800' }}>
                      {progressData?.total_activities || 0}
                    </h3>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Activities Completed</span>
                  </div>

                  {/* Total Speaking Time Card */}
                  <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', gap: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>🗣️</span>
                    <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#1e1b4b', fontWeight: '800' }}>
                      {formatSpeakingTime(progressData?.total_speaking_time)}
                    </h3>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Total Practice Time</span>
                  </div>

                </div>

                {/* 2. Skill Analytics Overview */}
                <div className="lux-card" style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 20px 0', color: '#1e1b4b', fontSize: '1.1rem' }}>📈 Subject Skill breakdown</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {Object.entries(progressData?.skills || {}).map(([skillName, score]) => (
                      <div key={skillName} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '600', color: '#475569' }}>
                          <span>{skillName}</span>
                          <span style={{ color: '#1e1b4b' }}>{score}%</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${score}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                            borderRadius: '4px',
                            transition: 'width 1s ease-out'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Streak and AI Insights Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  
                  {/* Streak Card */}
                  <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center', gap: '12px' }}>
                    <div className="pulsing-fire" style={{ fontSize: '4rem', filter: 'drop-shadow(0 4px 6px rgba(239,68,68,0.15))' }}>🔥</div>
                    <h3 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: '#1e1b4b' }}>
                      {progressData?.streak?.current || 0} Days
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569', fontStyle: 'italic', fontWeight: '600' }}>
                      "{progressData?.streak?.message || 'Keep practicing!'}"
                    </p>
                    
                    <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>Record Streak: <strong>{progressData?.streak?.longest || 0}d</strong></span>
                      <span>Milestone Target: <strong>{progressData?.streak?.next_milestone}d</strong></span>
                    </div>
                  </div>

                  {/* AI Coach Insights Card */}
                  <div className="lux-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ margin: 0, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🤖 AI Insights Review
                    </h4>
                    
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase' }}>Key Strengths</span>
                      <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '0.88rem', color: '#14532d', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {(progressData?.ai_insights?.strengths || []).map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#d97706', textTransform: 'uppercase' }}>Focus Areas</span>
                      <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '0.88rem', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {(progressData?.ai_insights?.improvements || []).map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ background: '#f5f3ff', borderLeft: '4px solid #8b5cf6', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: '0.88rem', color: '#5b21b6', marginTop: '4px' }}>
                      🎯 <strong>Practice Suggestion:</strong> {progressData?.ai_insights?.suggestion}
                    </div>
                  </div>

                </div>

                {/* 4. Recent Activities */}
                <div className="lux-card" style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#1e1b4b', fontSize: '1.1rem' }}>📋 Recent Practice Activity</h4>
                  {(!progressData?.recent_activities || progressData.recent_activities.length === 0) ? (
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                      No practice records found. Start an exercise above to populate this feed!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {progressData.recent_activities.map((act, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: '700', color: '#1e1b4b', fontSize: '0.92rem' }}>{act.name}</span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              Date: {new Date(act.date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="badge" style={{
                              background: act.category.includes('Challenge') || act.category.includes('JAM') ? '#eff6ff' : act.category.includes('Reading') ? '#ecfdf5' : '#f5f3ff',
                              color: act.category.includes('Challenge') || act.category.includes('JAM') ? '#1e40af' : act.category.includes('Reading') ? '#065f46' : '#5b21b6',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              padding: '4px 10px'
                            }}>
                              {act.category}
                            </span>
                            <span style={{ fontWeight: '800', color: act.score >= 80 ? '#10b981' : act.score >= 60 ? '#f59e0b' : '#ef4444', fontSize: '1rem' }}>
                              {act.score.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Milestone achievements grid list */}
                <div className="badges-section" style={{ marginTop: '10px' }}>
                  <h4 style={{ color: '#1e1b4b', margin: '0 0 12px 0' }}>🏆 Milestones Reached</h4>
                  <div className="badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(progressData?.user_progress?.badges || []).map((badge, index) => (
                      <span key={index} className="badge" style={{ background: '#faf5ff', border: '1px solid #e9d5ff', color: '#6b21a8', padding: '6px 12px', fontSize: '0.85rem' }}>
                        ⭐ {badge}
                      </span>
                    ))}
                    {(!progressData?.user_progress?.badges || progressData?.user_progress?.badges.length === 0) && (
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No milestones reached yet. Achieve score milestones or streaks to unlock rewards!</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Shadowing Practice Module */}
        {activeTab === 'shadowing' && (
          <div className="feature-container shadowing-mode">
            <h3>Shadowing Exercise</h3>
            <div className="lux-card shadowing-content">
              <div className="shadowing-topic-selector" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', width: '100%', maxWidth: '500px', gap: '10px' }}>
                  <input
                    type="text"
                    value={shadowingTopic}
                    onChange={(e) => setShadowingTopic(e.target.value)}
                    placeholder="Type any topic (e.g. Cooking, Space, Soccer)..."
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      fontWeight: '500',
                      fontSize: '1rem',
                      color: '#1e1b4b',
                      outline: 'none',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  />
                </div>
                <div className="suggested-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '5px' }}>
                  {['Daily Life', 'Travel', 'Business', 'Job Interview', 'Technology', 'Socializing'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setShadowingTopic(t)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: shadowingTopic === t ? '1px solid #6366f1' : '1px solid #e2e8f0',
                        background: shadowingTopic === t ? '#eef2ff' : 'white',
                        color: shadowingTopic === t ? '#4f46e5' : '#475569',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={getShadowingSentence} className="lux-button">
                🔄 Load New Sentence
              </button>

              {shadowingSentence && (
                <div className="sentence-display">
                  <h4>Listen & Repeat</h4>
                  <p className="sentence">"{shadowingSentence}"</p>
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
                    <button onClick={() => evaluateShadowing(spokenText)} className="lux-button">
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
              <div className="lux-card scenario-selection" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Method selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontWeight: '600', color: '#1e1b4b', fontSize: '1.05rem' }}>Choose Topic Method:</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setSimulationMethod('select');
                        setSimulationValidationError('');
                      }}
                      className={`lux-button ${simulationMethod === 'select' ? '' : 'lux-button-secondary'}`}
                      style={{ flex: 1, padding: '12px' }}
                    >
                      📁 Select Predefined Topic
                    </button>
                    <button
                      onClick={() => {
                        setSimulationMethod('custom');
                        setSimulationValidationError('');
                      }}
                      className={`lux-button ${simulationMethod === 'custom' ? '' : 'lux-button-secondary'}`}
                      style={{ flex: 1, padding: '12px' }}
                    >
                      ✏️ My Own Topic
                    </button>
                  </div>
                </div>

                {/* Conditional topic section */}
                {simulationMethod === 'select' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontWeight: '600', color: '#1e1b4b', fontSize: '1.05rem' }}>Select Topic Setting:</label>
                    <div className="scenario-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      {conversationScenarios.map((scenario, index) => {
                        const isSelected = selectedPredefinedScenario === scenario;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedPredefinedScenario(scenario);
                              setSimulationValidationError('');
                            }}
                            className={`lux-button ${isSelected ? '' : 'lux-button-secondary'}`}
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {typeof scenario === 'string' ? scenario.replace('_', ' ').toUpperCase() : 'SCENARIO'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontWeight: '600', color: '#1e1b4b', fontSize: '1.05rem' }}>Enter Custom Topic:</label>
                    <input
                      type="text"
                      value={customSimulationTopic}
                      onChange={(e) => {
                        setCustomSimulationTopic(e.target.value);
                        setSimulationValidationError('');
                      }}
                      placeholder="e.g. Buying a coffee, talking to a doctor, checking in for a flight..."
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        fontWeight: '500',
                        fontSize: '1rem',
                        color: '#1e1b4b',
                        outline: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    />
                  </div>
                )}

                {/* Duration selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontWeight: '600', color: '#1e1b4b', fontSize: '1.05rem' }}>Choose Conversation Duration:</label>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {[5, 10, 15].map((mins) => {
                      const isSelected = simulationDuration === mins;
                      return (
                        <button
                          key={mins}
                          onClick={() => setSimulationDuration(mins)}
                          className={`lux-button ${isSelected ? '' : 'lux-button-secondary'}`}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '20px',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                          }}
                        >
                          {mins} Minutes
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Voice responses toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
                  <label style={{ fontWeight: '600', color: '#1e1b4b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={isSimulatorVoiceEnabled}
                      onChange={(e) => setIsSimulatorVoiceEnabled(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4f46e5' }}
                    />
                    🔊 Voice Mode Responses (Uncheck for instant text replies)
                  </label>
                </div>

                {/* Validation Error display */}
                {simulationValidationError && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#991b1b',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}>
                    ⚠️ {simulationValidationError}
                  </div>
                )}

                {/* Start Button */}
                <button
                  onClick={() => {
                    if (simulationMethod === 'select') {
                      if (!selectedPredefinedScenario) {
                        setSimulationValidationError('Please select a predefined scenario setting first.');
                        return;
                      }
                      startConversation(selectedPredefinedScenario, null);
                    } else {
                      if (!customSimulationTopic.trim()) {
                        setSimulationValidationError('Please enter a custom topic to start simulation.');
                        return;
                      }
                      startConversation(null, customSimulationTopic.trim());
                    }
                  }}
                  className="lux-button"
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    background: '#4f46e5',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                    marginTop: '10px'
                  }}
                >
                  🚀 Start Simulation
                </button>

              </div>
            ) : (
              <div className="lux-card conversation-interface">
                <div className="conversation-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ margin: 0 }}><strong>Role:</strong> {selectedScenario.scenario?.role || 'Dialogue'}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{selectedScenario.scenario?.context}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                      onClick={() => setIsSimulatorVoiceEnabled(!isSimulatorVoiceEnabled)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.35rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isSimulatorVoiceEnabled ? 1 : 0.4,
                        transition: 'opacity 0.2s ease',
                        padding: '4px'
                      }}
                      title={isSimulatorVoiceEnabled ? "Mute AI Voice Responses" : "Unmute AI Voice Responses"}
                    >
                      {isSimulatorVoiceEnabled ? '🔊' : '🔇'}
                    </button>
                    {simulationTimeLeft !== null && (
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: simulationTimeLeft < 60 ? '#fef2f2' : '#f0fdf4',
                        color: simulationTimeLeft < 60 ? '#ef4444' : '#16a34a',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        border: simulationTimeLeft < 60 ? '1px solid #fee2e2' : '1px solid #dcfce7'
                      }}>
                        ⏱️ {formatTime(simulationTimeLeft)}
                      </span>
                    )}
                    <button className="lux-button lux-button-secondary" onClick={handleLeaveSimulation}>Leave</button>
                  </div>
                </div>

                <div className="conversation-messages" style={{ height: '300px', overflowY: 'auto', padding: '10px', background: '#f8fafc', borderRadius: '16px', marginBottom: '20px' }}>
                  {conversationHistory.map((msg, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start', margin: '10px 0' }}>
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
                      {msg.type === 'ai' && msg.grammar_check && (
                        <div className="grammar-tip" style={{
                          marginTop: '6px',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: '#fef3c7',
                          borderLeft: '4px solid #d97706',
                          fontSize: '0.82rem',
                          color: '#92400e',
                          lineHeight: '1.4',
                          maxWidth: '75%',
                          textAlign: 'left',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}>
                          💡 <strong>AI English Coach:</strong> {msg.grammar_check}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="message-input" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={startListening}
                    disabled={isListening || isSimulationTimeUp}
                    className={`lux-button ${isListening ? 'listening' : ''}`}
                    style={{
                      background: isListening ? '#ef4444' : '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: isListening ? 'white' : '#4f46e5',
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: isSimulationTimeUp ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      width: '46px',
                      height: '46px',
                      boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
                      flexShrink: 0
                    }}
                    title="Record voice to text box"
                  >
                    🎙️
                  </button>
                  <input
                    type="text"
                    disabled={isSimulationTimeUp}
                    value={simulatorInputText}
                    onChange={(e) => setSimulatorInputText(e.target.value)}
                    placeholder={isSimulationTimeUp ? "Time's up! Simulation completed." : isListening ? "Listening..." : "Say something to the AI..."}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: isSimulationTimeUp ? '#f1f5f9' : 'white',
                      cursor: isSimulationTimeUp ? 'not-allowed' : 'text'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isSimulationTimeUp) {
                        sendConversationMessage(simulatorInputText);
                      }
                    }}
                  />
                  <button
                    className="lux-button"
                    disabled={isSimulationTimeUp}
                    style={{
                      background: isSimulationTimeUp ? '#cbd5e1' : '#4f46e5',
                      cursor: isSimulationTimeUp ? 'not-allowed' : 'pointer',
                      flexShrink: 0
                    }}
                    onClick={() => {
                      if (isSimulationTimeUp) return;
                      sendConversationMessage(simulatorInputText);
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daily Speaking Challenge Module */}
        {activeTab === 'challenge' && (
          <div className="feature-container daily-challenge">
            <h3>Speaking Challenges</h3>

            {/* If a report exists, show it */}
            {challengeReport ? (
              renderChallengeReport(challengeReport, selectedChallengeType)
            ) : isChallengeLoading ? (
              <div className="lux-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div className="thinking-spinner" style={{ fontSize: '3rem', animation: 'spin 2s linear infinite' }}>⏳</div>
                <h4 style={{ marginTop: '20px', color: '#1e1b4b' }}>Analyzing Your Speech...</h4>
                <p style={{ color: '#64748b' }}>Our AI Coach is checking grammar, fluency, vocabulary, and pronunciation. Just a moment!</p>
              </div>
            ) : !selectedChallengeType ? (
              /* Challenge grid selection dashboard */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '10px' }}>
                
                {/* 1. Daily Challenge Card */}
                <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'all 0.2s ease' }}>
                  <div style={{ fontSize: '2.5rem' }}>📅</div>
                  <h4 style={{ margin: 0, color: '#1e1b4b' }}>Daily Challenge</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', flex: 1 }}>Practice today's unique daily speaking prompt. Great for daily consistency.</p>
                  <button onClick={() => setSelectedChallengeType('daily')} className="lux-button" style={{ marginTop: '12px' }}>Start Daily Challenge</button>
                </div>

                {/* 2. JAM Card */}
                <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'all 0.2s ease' }}>
                  <div style={{ fontSize: '2.5rem' }}>⏱️</div>
                  <h4 style={{ margin: 0, color: '#1e1b4b' }}>Just A Minute (JAM)</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', flex: 1 }}>Speak continuously on a selected topic for exactly one minute. Focus on fluency.</p>
                  <button onClick={() => setSelectedChallengeType('jam')} className="lux-button" style={{ marginTop: '12px' }}>Start JAM</button>
                </div>

                {/* 3. Picture Description Card */}
                <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'all 0.2s ease' }}>
                  <div style={{ fontSize: '2.5rem' }}>🖼️</div>
                  <h4 style={{ margin: 0, color: '#1e1b4b' }}>Picture Description</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', flex: 1 }}>Observe a random image and describe it for one minute. Focus on detail and creativity.</p>
                  <button onClick={() => { setSelectedChallengeType('picture'); loadRandomPicture(); }} className="lux-button" style={{ marginTop: '12px' }}>Start Picture Challenge</button>
                </div>

                {/* 4. Story Building Card */}
                <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'all 0.2s ease' }}>
                  <div style={{ fontSize: '2.5rem' }}>📚</div>
                  <h4 style={{ margin: 0, color: '#1e1b4b' }}>Story Building</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', flex: 1 }}>Build a creative story that connects 4-6 randomly generated words in two minutes.</p>
                  <button onClick={() => { setSelectedChallengeType('story'); loadStoryWords(); }} className="lux-button" style={{ marginTop: '12px' }}>Start Story Builder</button>
                </div>

                {/* 5. Role Play Card */}
                <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'all 0.2s ease' }}>
                  <div style={{ fontSize: '2.5rem' }}>👥</div>
                  <h4 style={{ margin: 0, color: '#1e1b4b' }}>Role Play Challenge</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', flex: 1 }}>Practice real-world conversations with the AI playing the opposite role for 3 or 5 minutes.</p>
                  <button onClick={() => setSelectedChallengeType('roleplay')} className="lux-button" style={{ marginTop: '12px' }}>Start Role Play</button>
                </div>

                {/* 6. Debate Card */}
                <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'all 0.2s ease' }}>
                  <div style={{ fontSize: '2.5rem' }}>⚖️</div>
                  <h4 style={{ margin: 0, color: '#1e1b4b' }}>Debate Challenge</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', flex: 1 }}>Defend or oppose a hot topic continuously. Build persuasive logical arguments.</p>
                  <button onClick={() => setSelectedChallengeType('debate')} className="lux-button" style={{ marginTop: '12px' }}>Start Debate</button>
                </div>

              </div>
            ) : (
              /* Specific Challenge Details Screens */
              <div>
                
                {/* 1. Daily Challenge Sub-screen */}
                {selectedChallengeType === 'daily' && (
                  <div className="lux-card challenge-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Daily Speaking Prompt</h4>
                      <button className="lux-button lux-button-secondary" onClick={handleLeaveChallenge} style={{ padding: '6px 12px' }}>Leave</button>
                    </div>
                    {dailyChallenge ? (
                      <>
                        <p className="challenge-text" style={{ fontSize: '1.15rem', fontStyle: 'italic', color: '#1e1b4b', fontWeight: '500' }}>
                          "{dailyChallenge.challenge}"
                        </p>
                        <div className="recording-controls" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                          <button
                            onClick={startListening}
                            disabled={isListening}
                            className={`lux-button ${isListening ? 'listening' : ''}`}
                            style={{ padding: '12px 28px', fontSize: '1.05rem' }}
                          >
                            {isListening ? '🎙️ Listening...' : '🎤 Start Recording'}
                          </button>

                          {spokenText && (
                            <div className="spoken-review" style={{ width: '100%', marginTop: '10px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                              <p style={{ margin: '0 0 12px 0' }}><strong>Your Attempt:</strong> "{spokenText}"</p>
                              <button onClick={submitDailyChallenge} className="lux-button" style={{ width: '100%' }}>
                                🚀 Submit for Score
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : <p>Loading today's prompt...</p>}
                  </div>
                )}

                {/* 2. JAM Challenge Sub-screen */}
                {selectedChallengeType === 'jam' && (
                  <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Just A Minute (JAM)</h4>
                      <button className="lux-button lux-button-secondary" onClick={handleLeaveChallenge} style={{ padding: '6px 12px' }}>Leave</button>
                    </div>

                    {!isJamActive ? (
                      /* JAM Setup Screen */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <p style={{ color: '#475569', margin: 0 }}>Speak continuously for exactly <strong>1 minute</strong>. Avoid hesitation, repetition, or stalling!</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontWeight: '600', color: '#1e1b4b' }}>Search or Choose Topic:</label>
                          <input
                            type="text"
                            value={jamSearchQuery}
                            onChange={(e) => setJamSearchQuery(e.target.value)}
                            placeholder="Search topics..."
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        {/* Predefined chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {jamSuggestedTopics
                            .filter(t => t.toLowerCase().includes(jamSearchQuery.toLowerCase()))
                            .map((t, idx) => (
                              <button
                                key={idx}
                                onClick={() => { setJamTopic(t); setJamCustomTopic(''); setChallengeValidationError(''); }}
                                className={`lux-button ${jamTopic === t ? '' : 'lux-button-secondary'}`}
                                style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.88rem' }}
                              >
                                {t}
                              </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontWeight: '600', color: '#1e1b4b' }}>Or Speak About Your Own Topic:</label>
                          <input
                            type="text"
                            value={jamCustomTopic}
                            onChange={(e) => {
                              setJamCustomTopic(e.target.value);
                              setJamTopic('');
                              setChallengeValidationError('');
                            }}
                            placeholder="Enter your own topic description..."
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        {challengeValidationError && (
                          <div style={{ color: '#b91c1c', fontSize: '0.9rem', textAlign: 'center' }}>⚠️ {challengeValidationError}</div>
                        )}

                        <button
                          onClick={() => {
                            const finalTopic = jamTopic || jamCustomTopic.trim();
                            if (!finalTopic) {
                              setChallengeValidationError('Please select or write a speaking topic.');
                              return;
                            }
                            startJamChallenge(finalTopic);
                          }}
                          className="lux-button"
                          style={{ padding: '14px', fontSize: '1.1rem', fontWeight: '700' }}
                        >
                          🚀 Start Challenge
                        </button>
                      </div>
                    ) : (
                      /* JAM Running Screen */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.9rem', padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontWeight: '700' }}>
                          ACTIVE TOPIC: {jamTopic || jamCustomTopic}
                        </span>
                        
                        <div style={{
                          fontSize: '3.5rem',
                          fontWeight: '800',
                          color: challengeTimeLeft < 10 ? '#ef4444' : '#1e1b4b',
                          margin: '10px 0',
                          fontVariantNumeric: 'tabular-nums'
                        }}>
                          ⏱️ {formatTime(challengeTimeLeft)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fee2e2', color: '#991b1b', padding: '10px 20px', borderRadius: '20px', fontWeight: '600', animation: 'pulse 1.5s infinite' }}>
                          <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></span>
                          Recording Live... Keep Speaking!
                        </div>

                        {/* Real-time speech transcript preview */}
                        <div style={{
                          width: '100%',
                          minHeight: '80px',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          background: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '12px',
                          padding: '12px',
                          fontSize: '0.95rem',
                          color: '#475569',
                          textAlign: 'left'
                        }}>
                          <strong>Speech Transcript Preview:</strong>
                          <p style={{ margin: '6px 0 0 0', fontStyle: 'italic' }}>
                            {accumulatedTranscript || "Start speaking to see transcription here..."}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 3. Picture Description Challenge Sub-screen */}
                {selectedChallengeType === 'picture' && (
                  <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Picture Description Challenge</h4>
                      <button className="lux-button lux-button-secondary" onClick={handleLeaveChallenge} style={{ padding: '6px 12px' }}>Leave</button>
                    </div>

                    {!isPictureActive ? (
                      /* Picture Setup Screen */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                        <p style={{ color: '#475569', margin: 0, textAlign: 'center' }}>
                          Observe the image below, plan your vocabulary, and then describe it continuously for <strong>1 minute</strong>.
                        </p>

                        {pictureUrl ? (
                          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '250px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <img src={pictureUrl} alt="Describe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : <p>Generating high-quality image...</p>}

                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                          <button onClick={loadRandomPicture} className="lux-button lux-button-secondary" style={{ flex: 1 }}>
                            🖼️ Generate New Image
                          </button>
                          <button onClick={startPictureChallenge} className="lux-button" style={{ flex: 1, fontWeight: '700' }} disabled={!pictureUrl}>
                            🚀 Start Description
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Picture Active Description Screen */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '300px', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                          <img src={pictureUrl} alt="Active Describe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ fontSize: '3rem', fontWeight: '800', color: challengeTimeLeft < 10 ? '#ef4444' : '#1e1b4b', margin: '5px 0' }}>
                          ⏱️ {formatTime(challengeTimeLeft)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fee2e2', color: '#991b1b', padding: '8px 16px', borderRadius: '20px', fontWeight: '600', animation: 'pulse 1.5s infinite' }}>
                          <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></span>
                          Recording Live... Keep Describing!
                        </div>

                        <div style={{ width: '100%', minHeight: '80px', maxHeight: '120px', overflowY: 'auto', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '12px', fontSize: '0.95rem', color: '#475569', textAlign: 'left' }}>
                          <strong>Your transcript:</strong>
                          <p style={{ margin: '6px 0 0 0', fontStyle: 'italic' }}>{accumulatedTranscript || "Speak to start describing the image..."}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Story Building Challenge Sub-screen */}
                {selectedChallengeType === 'story' && (
                  <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Story Building Challenge</h4>
                      <button className="lux-button lux-button-secondary" onClick={handleLeaveChallenge} style={{ padding: '6px 12px' }}>Leave</button>
                    </div>

                    {!isStoryActive ? (
                      /* Story Setup Screen */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                        <p style={{ color: '#475569', margin: 0, textAlign: 'center' }}>
                          Connect <strong>all</strong> of the given words into a single, cohesive story. You have <strong>2 minutes</strong> to speak!
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '10px 0' }}>
                          {storyWords.map((word, idx) => (
                            <span key={idx} className="badge" style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px 16px', borderRadius: '20px', fontSize: '1rem', fontWeight: '700', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                              🏷️ {word}
                            </span>
                          ))}
                          {storyWords.length === 0 && <p>Generating challenge words...</p>}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                          <button onClick={loadStoryWords} className="lux-button lux-button-secondary" style={{ flex: 1 }}>
                            🔄 Generate New Words
                          </button>
                          <button onClick={startStoryChallenge} className="lux-button" style={{ flex: 1, fontWeight: '700' }} disabled={storyWords.length === 0}>
                            🚀 Start Story
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Story Active Screen */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                        {/* Target words display */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                          {storyWords.map((word, idx) => {
                            const used = accumulatedTranscript.toLowerCase().includes(word.toLowerCase());
                            return (
                              <span key={idx} className="badge" style={{
                                background: used ? '#d1fae5' : '#f1f5f9',
                                color: used ? '#065f46' : '#64748b',
                                border: used ? '1px solid #10b981' : '1px solid #cbd5e1',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.88rem',
                                fontWeight: '600'
                              }}>
                                {used ? '✅' : '🔴'} {word}
                              </span>
                            );
                          })}
                        </div>

                        <div style={{ fontSize: '3rem', fontWeight: '800', color: challengeTimeLeft < 10 ? '#ef4444' : '#1e1b4b', margin: '5px 0' }}>
                          ⏱️ {formatTime(challengeTimeLeft)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fee2e2', color: '#991b1b', padding: '8px 16px', borderRadius: '20px', fontWeight: '600', animation: 'pulse 1.5s infinite' }}>
                          <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></span>
                          Recording Story... Keep Speaking!
                        </div>

                        <div style={{ width: '100%', minHeight: '100px', maxHeight: '150px', overflowY: 'auto', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '12px', fontSize: '0.95rem', color: '#475569', textAlign: 'left' }}>
                          <strong>Your Story Transcript:</strong>
                          <p style={{ margin: '6px 0 0 0', fontStyle: 'italic' }}>{accumulatedTranscript || "Speak to start building your story..."}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Role Play Challenge Sub-screen */}
                {selectedChallengeType === 'roleplay' && (
                  <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Role Play Challenge</h4>
                      <button className="lux-button lux-button-secondary" onClick={handleLeaveChallenge} style={{ padding: '6px 12px' }}>Leave</button>
                    </div>

                    {!roleplayScenario ? (
                      /* Roleplay Scenario Selector Screen */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <p style={{ color: '#475569', margin: 0 }}>
                          Roleplay a real-world scenario with the AI. Conduct a natural back-and-forth dialogue!
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontWeight: '600', color: '#1e1b4b' }}>Choose Practice Duration:</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {[3, 5].map(mins => (
                              <button
                                key={mins}
                                onClick={() => setRoleplayDuration(mins)}
                                className={`lux-button ${roleplayDuration === mins ? '' : 'lux-button-secondary'}`}
                                style={{ flex: 1, padding: '10px', borderRadius: '10px' }}
                              >
                                {mins} Minutes
                              </button>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontWeight: '600', color: '#1e1b4b' }}>Search Scenario Setting:</label>
                          <input
                            type="text"
                            value={roleplaySearchQuery}
                            onChange={(e) => setRoleplaySearchQuery(e.target.value)}
                            placeholder="Search interviews, restaurant, customs..."
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        {/* Cards display */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                          {roleplayScenariosList
                            .filter(s => s.title.toLowerCase().includes(roleplaySearchQuery.toLowerCase()))
                            .map((scenario, idx) => (
                              <button
                                key={idx}
                                onClick={() => startRoleplayChallenge(scenario)}
                                className="lux-button lux-button-secondary"
                                style={{ padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                              >
                                🎭 {scenario.title}
                              </button>
                            ))}
                        </div>
                      </div>
                    ) : (
                      /* Roleplay Chat Screen */
                      <div className="conversation-interface" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="conversation-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <p style={{ margin: 0, fontWeight: '700', color: '#1e1b4b' }}>Role: {roleplayScenario.role}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{roleplayScenario.context}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                              onClick={() => setIsRoleplayVoiceEnabled(!isRoleplayVoiceEnabled)}
                              style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', opacity: isRoleplayVoiceEnabled ? 1 : 0.4 }}
                              title="Toggle Audio Feedback"
                            >
                              {isRoleplayVoiceEnabled ? '🔊' : '🔇'}
                            </button>
                            {challengeTimeLeft !== null && (
                              <span style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                background: challengeTimeLeft < 60 ? '#fef2f2' : '#f0fdf4',
                                color: challengeTimeLeft < 60 ? '#ef4444' : '#16a34a',
                                fontWeight: '700',
                                fontSize: '0.85rem'
                              }}>
                                ⏱️ {formatTime(challengeTimeLeft)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="conversation-messages" style={{ height: '240px', overflowY: 'auto', padding: '10px', background: '#f8fafc', borderRadius: '16px' }}>
                          {roleplayHistory.map((msg, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start', margin: '8px 0' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '10px 14px',
                                borderRadius: '14px',
                                background: msg.type === 'user' ? '#4f46e5' : '#ffffff',
                                color: msg.type === 'user' ? 'white' : '#1e1b4b',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                maxWidth: '80%',
                                fontSize: '0.92rem'
                              }}>
                                {msg.message}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Input controls */}
                        <div className="message-input" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={startListening}
                            disabled={isListening || isChallengeTimeUp}
                            className={`lux-button ${isListening ? 'listening' : ''}`}
                            style={{
                              background: isListening ? '#ef4444' : '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: isListening ? 'white' : '#4f46e5',
                              padding: '10px',
                              borderRadius: '10px',
                              cursor: isChallengeTimeUp ? 'not-allowed' : 'pointer',
                              fontSize: '1.1rem',
                              width: '42px',
                              height: '42px',
                              flexShrink: 0
                            }}
                          >
                            🎙️
                          </button>
                          <input
                            type="text"
                            disabled={isChallengeTimeUp}
                            value={roleplayInputText}
                            onChange={(e) => setRoleplayInputText(e.target.value)}
                            placeholder={isChallengeTimeUp ? "Time expired. Generating report card..." : isListening ? "Listening..." : "Reply to AI partner..."}
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: '1px solid #cbd5e1',
                              background: isChallengeTimeUp ? '#f1f5f9' : 'white',
                              fontSize: '0.9rem'
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !isChallengeTimeUp) {
                                sendRoleplayChallengeMessage(roleplayInputText);
                              }
                            }}
                          />
                          <button
                            className="lux-button"
                            disabled={isChallengeTimeUp}
                            style={{ background: isChallengeTimeUp ? '#cbd5e1' : '#4f46e5', padding: '10px 16px', borderRadius: '10px', fontSize: '0.9rem', flexShrink: 0 }}
                            onClick={() => sendRoleplayChallengeMessage(roleplayInputText)}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Debate Challenge Sub-screen */}
                {selectedChallengeType === 'debate' && (
                  <div className="lux-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Debate Challenge</h4>
                      <button className="lux-button lux-button-secondary" onClick={handleLeaveChallenge} style={{ padding: '6px 12px' }}>Leave</button>
                    </div>

                    {!isDebateActive ? (
                      /* Debate Setup Screen */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <p style={{ color: '#475569', margin: 0 }}>
                          Defend (For) or Oppose (Against) a hot topic continuously. Formulate strong logical points!
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontWeight: '600', color: '#1e1b4b' }}>Choose Stance:</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {['For', 'Against'].map(s => (
                              <button
                                key={s}
                                onClick={() => setDebateStance(s)}
                                className={`lux-button ${debateStance === s ? '' : 'lux-button-secondary'}`}
                                style={{ flex: 1, padding: '10px', borderRadius: '10px' }}
                              >
                                {s === 'For' ? '👍 For (Affirmative)' : '👎 Against (Negative)'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontWeight: '600', color: '#1e1b4b' }}>Choose Speaking Duration:</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {[2, 5].map(mins => (
                              <button
                                key={mins}
                                onClick={() => setDebateDuration(mins)}
                                className={`lux-button ${debateDuration === mins ? '' : 'lux-button-secondary'}`}
                                style={{ flex: 1, padding: '10px', borderRadius: '10px' }}
                              >
                                {mins} Minutes
                              </button>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontWeight: '600', color: '#1e1b4b' }}>Search Debate Topic:</label>
                          <input
                            type="text"
                            value={debateSearchQuery}
                            onChange={(e) => setDebateSearchQuery(e.target.value)}
                            placeholder="Search technology, free education..."
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        {/* List display */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                          {debateTopicsList
                            .filter(t => t.toLowerCase().includes(debateSearchQuery.toLowerCase()))
                            .map((t, idx) => (
                              <button
                                key={idx}
                                onClick={() => { setDebateTopic(t); setDebateCustomTopic(''); setChallengeValidationError(''); }}
                                className={`lux-button ${debateTopic === t ? '' : 'lux-button-secondary'}`}
                                style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem' }}
                              >
                                {t}
                              </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontWeight: '600', color: '#1e1b4b' }}>Or Enter Your Own Custom Debate Topic:</label>
                          <input
                            type="text"
                            value={debateCustomTopic}
                            onChange={(e) => {
                              setDebateCustomTopic(e.target.value);
                              setDebateTopic('');
                              setChallengeValidationError('');
                            }}
                            placeholder="Enter customized debate prompt..."
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        {challengeValidationError && (
                          <div style={{ color: '#b91c1c', fontSize: '0.9rem', textAlign: 'center' }}>⚠️ {challengeValidationError}</div>
                        )}

                        <button
                          onClick={() => {
                            const finalTopic = debateTopic || debateCustomTopic.trim();
                            if (!finalTopic) {
                              setChallengeValidationError('Please select or write a debate topic.');
                              return;
                            }
                            startDebateChallenge(finalTopic);
                          }}
                          className="lux-button"
                          style={{ padding: '14px', fontSize: '1.1rem', fontWeight: '700' }}
                        >
                          🚀 Start Debate
                        </button>
                      </div>
                    ) : (
                      /* Debate Active Screen */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.85rem', padding: '4px 10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontWeight: '700' }}>
                            TOPIC: {debateTopic || debateCustomTopic}
                          </span>
                          <span style={{ fontSize: '0.85rem', padding: '4px 10px', background: debateStance === 'For' ? '#d1fae5' : '#fee2e2', color: debateStance === 'For' ? '#065f46' : '#991b1b', borderRadius: '20px', fontWeight: '700', marginTop: '6px', display: 'inline-block', alignSelf: 'center' }}>
                            STANCE: {debateStance === 'For' ? '👍 FOR (Affirmative)' : '👎 AGAINST (Negative)'}
                          </span>
                        </div>

                        <div style={{ fontSize: '3rem', fontWeight: '800', color: challengeTimeLeft < 10 ? '#ef4444' : '#1e1b4b', margin: '5px 0' }}>
                          ⏱️ {formatTime(challengeTimeLeft)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fee2e2', color: '#991b1b', padding: '8px 16px', borderRadius: '20px', fontWeight: '600', animation: 'pulse 1.5s infinite' }}>
                          <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></span>
                          Recording Debate... Speak Continuously!
                        </div>

                        <div style={{ width: '100%', minHeight: '100px', maxHeight: '150px', overflowY: 'auto', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '12px', fontSize: '0.95rem', color: '#475569', textAlign: 'left' }}>
                          <strong>Your Argument Transcript:</strong>
                          <p style={{ margin: '6px 0 0 0', fontStyle: 'italic' }}>{accumulatedTranscript || "Speak to start presenting your arguments..."}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ========== Vocabulary Builder Module ========== */}
        {activeTab === 'vocabulary' && (
          <div className="feature-container" style={{ animation: 'fadeIn 0.4s ease' }}>
            {vocabSession === 'setup' && (
              <div className="lux-card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <span style={{ fontSize: '3rem' }}>📚</span>
                  <h3 style={{ margin: '10px 0 6px', fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>Vocabulary Builder</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Learn new words every day with AI-powered lessons</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                  {[
                    { icon: '📖', title: 'Word of the Day', desc: 'New word with meaning & examples' },
                    { icon: '🔤', title: 'Synonyms & Antonyms', desc: 'Expand your word network' },
                    { icon: '🎤', title: 'Pronunciation', desc: 'Hear and practice word sounds' },
                    { icon: '📝', title: 'Example Sentences', desc: 'See words used in context' },
                    { icon: '⭐', title: 'Favourite Words', desc: 'Save and review later' },
                    { icon: '🧠', title: 'AI Vocabulary Quiz', desc: 'Test your word knowledge' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.92rem' }}>{item.title}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '3px' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#a5b4fc', fontWeight: '700' }}>🌟 Today's Focus Word: "Eloquent"</h4>
                  <p style={{ color: '#ffffff', fontSize: '0.9rem', margin: '0 0 4px' }}><strong>Meaning:</strong> Fluent or persuasive in speaking or writing</p>
                  <p style={{ color: '#a5b4fc', fontSize: '0.9rem', margin: '0 0 12px', fontStyle: 'italic' }}>"She gave an eloquent speech about climate change."</p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <button onClick={startVocabPractice} className="lux-button" style={{ padding: '12px 36px', fontSize: '1rem', width: '100%', maxWidth: '280px' }}>
                    Start Practice →
                  </button>
                </div>
              </div>
            )}

            {vocabSession === 'practice' && (
              <div className="lux-card" style={{ padding: '32px', maxWidth: '700px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
                {vocabLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>Loading word list...</div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ fontSize: '0.88rem', background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '12px' }}>
                        Word {currentVocabIndex + 1} of {vocabWords.length}
                      </span>
                      <button 
                        onClick={() => toggleFavorite(vocabWords[currentVocabIndex]?.word)}
                        style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', outline: 'none' }}
                      >
                        {favoriteWords.includes(vocabWords[currentVocabIndex]?.word) ? '⭐' : '☆'}
                      </button>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 4px', color: '#ffffff' }}>
                        {vocabWords[currentVocabIndex]?.word}
                      </h2>
                      <p style={{ fontSize: '1.1rem', color: '#a5b4fc', margin: '0 0 12px' }}>
                        {vocabWords[currentVocabIndex]?.phonetic}
                      </p>
                      <button 
                        onClick={() => speakText(vocabWords[currentVocabIndex]?.word)}
                        className="lux-button lux-button-secondary"
                        style={{ padding: '6px 16px', fontSize: '0.85rem', height: '32px', background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
                      >
                        🔊 Listen
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '32px' }}>
                      <div>
                        <strong style={{ color: '#a5b4fc', fontSize: '0.9rem', textTransform: 'uppercase' }}>Definition</strong>
                        <p style={{ margin: '4px 0 0', color: '#ffffff', fontSize: '1rem' }}>{vocabWords[currentVocabIndex]?.definition}</p>
                      </div>
                      <div>
                        <strong style={{ color: '#a5b4fc', fontSize: '0.9rem', textTransform: 'uppercase' }}>Example Sentence</strong>
                        <p style={{ margin: '4px 0 0', color: '#ffffff', fontSize: '1rem', fontStyle: 'italic' }}>"{vocabWords[currentVocabIndex]?.example}"</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <strong style={{ color: '#a5b4fc', fontSize: '0.9rem', textTransform: 'uppercase' }}>Synonyms</strong>
                          <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>{vocabWords[currentVocabIndex]?.synonyms}</p>
                        </div>
                        <div>
                          <strong style={{ color: '#a5b4fc', fontSize: '0.9rem', textTransform: 'uppercase' }}>Antonyms</strong>
                          <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>{vocabWords[currentVocabIndex]?.antonyms}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {currentVocabIndex < vocabWords.length - 1 ? (
                        <button 
                          onClick={() => setCurrentVocabIndex(prev => prev + 1)}
                          className="lux-button"
                          style={{ flex: 1 }}
                        >
                          Next Word →
                        </button>
                      ) : (
                        <button 
                          onClick={startVocabQuiz}
                          className="lux-button"
                          style={{ flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        >
                          Start Vocabulary Quiz 🧠
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {vocabSession === 'quiz' && (
              <div className="lux-card" style={{ padding: '32px', maxWidth: '650px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '12px' }}>
                    Question {currentVocabIndex + 1} of 5
                  </span>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <p style={{ margin: '0 0 8px', color: '#cbd5e1', fontSize: '0.95rem' }}>Select the correct definition for the word:</p>
                  <h3 style={{ fontSize: '2rem', color: '#ffffff', margin: 0, fontWeight: '800' }}>
                    "{vocabWords[currentVocabIndex]?.word}"
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {vocabWords[currentVocabIndex]?.quiz?.options.map((option, i) => {
                    const isSelected = vocabQuizAnswers[currentVocabIndex] === option;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectVocabAnswer(option)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                          background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                          color: '#ffffff',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {currentVocabIndex < 4 ? (
                    <button
                      onClick={() => {
                        if (!vocabQuizAnswers[currentVocabIndex]) {
                          alert("Please select an answer first.");
                          return;
                        }
                        setCurrentVocabIndex(prev => prev + 1);
                      }}
                      className="lux-button"
                      style={{ flex: 1 }}
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (!vocabQuizAnswers[currentVocabIndex]) {
                          alert("Please select an answer first.");
                          return;
                        }
                        submitVocabQuiz();
                      }}
                      className="lux-button"
                      style={{ flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                    >
                      Finish and Get Score 🏆
                    </button>
                  )}
                </div>
              </div>
            )}

            {vocabSession === 'result' && (
              <div className="lux-card" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff', textAlign: 'center' }}>
                <span style={{ fontSize: '4rem' }}>🏆</span>
                <h3 style={{ margin: '12px 0 6px', fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>Practice Completed!</h3>
                <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: '0 0 24px' }}>Here is your Vocabulary builder score:</p>

                <div style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  background: `conic-gradient(#10b981 ${vocabQuizScore}%, rgba(255,255,255,0.08) ${vocabQuizScore}% 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 28px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)'
                }}>
                  <div style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    backgroundColor: '#110d29',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff' }}>
                      {vocabQuizScore}%
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
                      Quiz Score
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={startVocabPractice} className="lux-button" style={{ flex: 1 }}>
                    🔄 Practice Again
                  </button>
                  <button onClick={() => setVocabSession('setup')} className="lux-button lux-button-secondary" style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.1)' }}>
                    📁 Menu View
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== Grammar Practice Module ========== */}
        {activeTab === 'grammar' && (
          <div className="feature-container" style={{ animation: 'fadeIn 0.4s ease' }}>
            {grammarSession === 'setup' && (
              <div className="lux-card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <span style={{ fontSize: '3rem' }}>✍️</span>
                  <h3 style={{ margin: '10px 0 6px', fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>Grammar Practice</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Master English grammar with AI-powered corrections</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                  {[
                    { icon: '✏️', title: 'Sentence Correction', desc: 'Fix grammar errors in sentences' },
                    { icon: '⏰', title: 'Tenses Practice', desc: 'Master all 12 English tenses' },
                    { icon: '📌', title: 'Articles & Prepositions', desc: 'A, an, the, in, on, at...' },
                    { icon: '🔄', title: 'Voice Correction', desc: 'Active & passive voice' },
                    { icon: '🤖', title: 'AI Explanations', desc: 'Understand why it\'s wrong' },
                    { icon: '📝', title: 'Writing Practice', desc: 'Write and get AI feedback' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.92rem' }}>{item.title}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '3px' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 10px', color: '#a7f3d0', fontWeight: '700' }}>🧪 Quick Grammar Challenge</h4>
                  <p style={{ color: '#ffffff', fontSize: '0.9rem', margin: '0 0 6px' }}>Correct this sentence:</p>
                  <p style={{ color: '#a7f3d0', fontSize: '1rem', fontWeight: '600', fontStyle: 'italic', margin: '0 0 14px' }}>"She don't likes to swimming."</p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <button onClick={startGrammarPractice} className="lux-button" style={{ padding: '12px 36px', fontSize: '1rem', width: '100%', maxWidth: '280px' }}>
                    Start Practice →
                  </button>
                </div>
              </div>
            )}

            {grammarSession === 'practice' && (
              <div className="lux-card" style={{ padding: '32px', maxWidth: '650px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '12px' }}>
                    Exercise {currentGrammarIndex + 1} of 5
                  </span>
                </div>

                {grammarExercises[currentGrammarIndex]?.type === 'blank' ? (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <p style={{ margin: '0 0 12px', color: '#cbd5e1', fontSize: '0.95rem' }}>Select the correct option to fill in the blank:</p>
                      <h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: '700', lineHeight: '1.5' }}>
                        {grammarExercises[currentGrammarIndex]?.sentence}
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                      {grammarExercises[currentGrammarIndex]?.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleGrammarSubmitAnswer(option)}
                          className="lux-button lux-button-secondary"
                          style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#ffffff',
                            borderRadius: '12px'
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <p style={{ margin: '0 0 12px', color: '#cbd5e1', fontSize: '0.95rem' }}>
                        {grammarExercises[currentGrammarIndex]?.prompt}
                      </p>
                      <h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: '700', fontStyle: 'italic', lineHeight: '1.5' }}>
                        "{grammarExercises[currentGrammarIndex]?.sentence}"
                      </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      <input
                        type="text"
                        placeholder="Type the corrected sentence here..."
                        id="grammar-input-field"
                        style={{
                          padding: '14px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(0,0,0,0.2)',
                          color: '#ffffff',
                          fontSize: '0.95rem',
                          outline: 'none'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleGrammarSubmitAnswer(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const inputEl = document.getElementById('grammar-input-field');
                          if (inputEl) {
                            handleGrammarSubmitAnswer(inputEl.value);
                            inputEl.value = '';
                          }
                        }}
                        className="lux-button"
                      >
                        Submit Corrected Sentence
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {grammarSession === 'result' && (
              <div className="lux-card" style={{ padding: '32px', maxWidth: '700px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '3rem' }}>📝</span>
                  <h3 style={{ margin: '10px 0 4px', fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>Grammar Score</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Your performance breakdown</p>
                </div>

                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  background: `conic-gradient(#10b981 ${grammarScore}%, rgba(255,255,255,0.08) ${grammarScore}% 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 28px',
                }}>
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    backgroundColor: '#110d29',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>
                      {grammarScore}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px', maxHeight: '300px', overflowY: 'auto', paddingRight: '6px' }}>
                  {grammarFeedback.map((fb, idx) => (
                    <div key={idx} style={{
                      padding: '14px',
                      background: fb.isCorrect ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                      border: fb.isCorrect ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '700', color: fb.isCorrect ? '#34d399' : '#f87171', fontSize: '0.85rem' }}>
                          {fb.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Score: {fb.scoreValue}/20
                        </span>
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: '0.92rem', color: '#ffffff' }}>
                        <strong>Question:</strong> {fb.exercise.sentence}
                      </p>
                      <p style={{ margin: '0 0 6px', fontSize: '0.92rem', color: '#cbd5e1' }}>
                        <strong>Your answer:</strong> {fb.userAnswer || '[No response]'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#a5b4fc', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                        💡 <strong>Explanation:</strong> {fb.exercise.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={startGrammarPractice} className="lux-button" style={{ flex: 1 }}>
                    🔄 Try Again
                  </button>
                  <button onClick={() => setGrammarSession('setup')} className="lux-button lux-button-secondary" style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.1)' }}>
                    📁 Menu View
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== Pronunciation Coach Module ========== */}
        {activeTab === 'pronunciation' && (
          <div className="feature-container" style={{ animation: 'fadeIn 0.4s ease' }}>
            {pronSession === 'setup' && (
              <div className="lux-card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <span style={{ fontSize: '3rem' }}>🎯</span>
                  <h3 style={{ margin: '10px 0 6px', fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>Pronunciation Coach</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>Perfect your pronunciation with real-time AI analysis</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                  {[
                    { icon: '🎙️', title: 'Record Voice', desc: 'Record and analyze your speech' },
                    { icon: '📊', title: 'Pronunciation Score', desc: 'Get accuracy percentage' },
                    { icon: '🌍', title: 'Accent Feedback', desc: 'Improve your accent clarity' },
                    { icon: '💪', title: 'Difficult Words', desc: 'Practice challenging words' },
                    { icon: '🏆', title: 'Fluency Score', desc: 'Track your speaking flow' },
                    { icon: '💡', title: 'AI Tips & Corrections', desc: 'Personalized speaking tips' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.92rem' }}>{item.title}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '3px' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 10px', color: '#fde68a', fontWeight: '700' }}>🎤 Hard Pronunciation Word</h4>
                  <p style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px', letterSpacing: '2px' }}>Entrepreneurship</p>
                  <p style={{ color: '#fde68a', fontSize: '0.85rem', margin: '0 0 14px' }}>/ˌɒn.trə.prəˈnɜː.ʃɪp/</p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <button onClick={startPronPractice} className="lux-button" style={{ padding: '12px 36px', fontSize: '1rem', width: '100%', maxWidth: '280px' }}>
                    Start Practice →
                  </button>
                </div>
              </div>
            )}

            {pronSession === 'practice' && (
              <div className="lux-card" style={{ padding: '32px', maxWidth: '650px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '12px' }}>
                    Word {currentPronIndex + 1} of 4
                  </span>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <p style={{ margin: '0 0 8px', color: '#cbd5e1', fontSize: '0.95rem' }}>Listen carefully and repeat the word:</p>
                  <h3 style={{ fontSize: '2.2rem', color: '#ffffff', margin: '0 0 4px', fontWeight: '800' }}>
                    {pronWords[currentPronIndex]?.word}
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#a5b4fc', margin: '0 0 12px' }}>
                    {pronWords[currentPronIndex]?.phonetic}
                  </p>
                  <button 
                    onClick={() => speakText(pronWords[currentPronIndex]?.word)}
                    className="lux-button lux-button-secondary"
                    style={{ padding: '6px 16px', fontSize: '0.85rem', height: '32px', background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    🔊 Listen Audio
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '32px' }}>
                  <button
                    onClick={startListening}
                    disabled={isListening}
                    className={`lux-button ${isListening ? 'listening' : ''}`}
                    style={{
                      background: isListening ? '#ef4444' : '#6366f1',
                      padding: '14px 28px',
                      fontSize: '1rem',
                      fontWeight: '700',
                      boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.4)' : 'none'
                    }}
                  >
                    {isListening ? '🎙️ Listening... Speak Now' : '🎤 Click & Say Word'}
                  </button>

                  {pronAttempt && (
                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>
                        <strong>Your pronunciation attempt:</strong> <span style={{ color: '#a5b4fc' }}>"{pronAttempt}"</span>
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.9rem' }}>Accuracy Score:</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: pronScore >= 80 ? '#34d399' : pronScore >= 60 ? '#fbbf24' : '#f87171' }}>
                          {pronScore}%
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                        💡 <strong>Coach Tip:</strong> {pronFeedback}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex' }}>
                  <button
                    onClick={handleNextPronWord}
                    disabled={!pronAttempt}
                    className="lux-button"
                    style={{ flex: 1 }}
                  >
                    {currentPronIndex < 3 ? 'Next Word →' : 'View Summary Results 🏆'}
                  </button>
                </div>
              </div>
            )}

            {pronSession === 'result' && (
              <div className="lux-card" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#ffffff', textAlign: 'center' }}>
                <span style={{ fontSize: '4rem' }}>🏆</span>
                <h3 style={{ margin: '12px 0 6px', fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>Practice Completed!</h3>
                <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: '0 0 24px' }}>Here is your Pronunciation score:</p>

                <div style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  background: `conic-gradient(#f59e0b ${pronScore}%, rgba(255,255,255,0.08) ${pronScore}% 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 28px',
                }}>
                  <div style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    backgroundColor: '#110d29',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff' }}>
                      {pronScore}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={startPronPractice} className="lux-button" style={{ flex: 1 }}>
                    🔄 Practice Again
                  </button>
                  <button onClick={() => setPronSession('setup')} className="lux-button lux-button-secondary" style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.1)' }}>
                    📁 Menu View
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdvancedFeatures;