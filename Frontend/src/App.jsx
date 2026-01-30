import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./Signup";
import Signin from "./Signin";
import Dashboard from "./Dashboard/Dashboard";
import Verified from "./Verified";
import { UserProvider } from './context/UserContext'; // ✅ Import the UserProvider
import PracticeAi from "./Practice Session/PracticeAi";
import Aravind from "./Practice Session/Aravind";
import ChinnuPractice from "./Practice/ChinnuPractice";
import PracticeTopics from "./pages/PracticeTopics";

import { supabase } from "./supabaseClient";

import "./pages/Home.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkSession();

    // Optional: listen to auth changes (e.g., signout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <UserProvider> 

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/verified" element={<Verified />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/practicetutor"
        element={isAuthenticated ? <PracticeAi /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/practice/:topic"
        element={isAuthenticated ? <PracticeAi /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/practice/chinnu"
        element={isAuthenticated ? <ChinnuPractice /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/practice-topics"
        element={isAuthenticated ? <PracticeTopics /> : <Navigate to="/signin" replace />}
      />
    </Routes>
    </UserProvider> 

  );
}

export default App;
