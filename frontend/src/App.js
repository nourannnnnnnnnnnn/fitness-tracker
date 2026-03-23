import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import History from './pages/History'; 
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  // Check if a token exists in the browser
  const isAuthenticated = !!localStorage.getItem('token');

  // Function to wipe the token and kick the user out
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
  };

  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <nav style={{ background: '#333', padding: '15px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          {isAuthenticated ? (
            // User is logged in: Show the full dashboard
            <>
              <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Log Workout</Link>
              <Link to="/history" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>History</Link>
              <Link to="/analytics" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Analytics</Link>
              <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>My Profile</Link>

              <button onClick={handleLogout} style={{ marginLeft: 'auto', background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            // User is NOT logged in: Show only auth links
            <>
              <h3 style={{ color: 'white', margin: 0 }}>Fitness Tracker</h3>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
                <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Log In</Link>
                <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Sign Up</Link>
              </div>
            </>
          )}

        </nav>

        {/* Page Routing */}
        <div style={{ padding: '20px' }}>
          <Routes>
            {/* Public Routes - Anyone can access these */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes - If no token, forcefully redirect to /login */}
            <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
            <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/login" />} />
            <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;