import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import { Dashboard } from './components/dashboard';
import { HomePage } from './components/home';
import { AuthCallback } from './components/auth';
import TaskCreator from './components/task';
import { ProjectDetails } from './components/projectDetails';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('https://ai-task-manager-2udz.onrender.com/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        console.error('Error fetching user profile:', response.status);
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = 'https://ai-task-manager-2udz.onrender.com/auth/google';
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  if (loading) {
    return <div className="app-container"><h2>Loading...</h2></div>;
  }

  return (
    <Router>
      <div className="app-container">
        <header>
          <h1>AI Task Manager</h1>
          <nav>
            <Link to="/">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <button onClick={handleLogin}>Login with Google</button>
            )}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/task" element={<TaskCreator />} />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/" />} 
          />
          <Route path="/auth-callback" element={<AuthCallback setUser={setUser} />} />
          <Route path="/project" element={<ProjectDetails />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;