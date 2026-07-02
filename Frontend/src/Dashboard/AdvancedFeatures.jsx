// Import necessary React hooks and components
import React, { useState, useEffect, useRef } from 'react';
// Import the ReadingPractice component for use within AdvancedFeatures
import ReadingPractice from './ReadingPractice';
// Import the CSS file for styling the AdvancedFeatures component
import './AdvancedFeatures.css';

// Define the AdvancedFeatures component which takes userId and onBack as props
const AdvancedFeatures = (props) => {
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
  
  // Ref to handle SpeechRecognition.onresult callback dynamically and avoid React stale closures
  const onSpeechRecognizedRef = useRef(null);

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
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (err) {}
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
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (err) {}
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
    
    if (recognition && isListening) {
      try { recognition.stop(); } catch (err) {}
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
          <div className="feature-container progress-dashboard" style={{ animation: 'fadeIn 0.3s ease' }}>
            
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📊 Performance Dashboard</h3>
              <button onClick={loadProgressData} className="lux-button lux-button-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
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
      </div>
    </div>
  );
};

export default AdvancedFeatures; 