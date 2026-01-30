import React, { createContext, useContext, useState} from 'react';

// Create the context for user data
const UserContext = createContext();

// Custom hook to use user context
export const useUser = () => useContext(UserContext);

// Provider component
export function UserProvider({ children }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');

  

  
  const [voiceId, setVoiceId] = useState(() => {
    try {
      const savedVoiceId = localStorage.getItem('voiceId');
      return savedVoiceId || '';
    } catch (error) {
      console.error('Error reading voiceId from localStorage:', error);
      return '';
    }
  });

  

  
  
  const setvoiceId = (value) => {
    try {
      if (value) {
        localStorage.setItem('voiceId', value);
      } else {
        localStorage.removeItem('voiceId');
      }
      setVoiceId(value);
    } catch (error) {
      console.error('Error saving voiceId to localStorage:', error);
      setVoiceId(value);
    }
  };


  const setSegments = (value) => {
    try {
      localStorage.setItem('segments', JSON.stringify(value));
      setSegmentsState(value);
    } catch (error) {
      console.error('Error saving segments to localStorage:', error);
      setSegmentsState(value);
    }
  };

  // Optional: Clear all data (useful for logout or reset)
  const clearUserData = () => {
    setEmail('');
    setName('');
    setProfileImage('');
    setResumeText('');
    setJobDescription('');
    setVoiceId('');

    setSegments([]);
    
    // Clear localStorage
    try {
      
      localStorage.removeItem('voiceId');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };



  const value = {
    
    voiceId,
    setvoiceId,
    
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}