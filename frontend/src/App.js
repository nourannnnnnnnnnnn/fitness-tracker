import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import History from './pages/History'; 
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ExploreMeals from './pages/ExploreMeals';
import Favorites from './pages/Favorites'; 
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // 1. AUTHENTICATION & ROLE CHECKS
  // These variables are checked every time the page refreshes
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); 

  // 2. HARD LOGOUT FUNCTION
  // Clears all memory to ensure no "user" role stays stuck when switching accounts
  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = '/login'; 
  };

  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <nav style={{ background: '#333', padding: '15px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Log Workout</Link>
              <Link to="/history" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>History</Link>
              <Link to="/analytics" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Analytics</Link>
              <Link to="/explore" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Explore</Link>
              <Link to="/favorites" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Wishlist</Link>
              <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>My Profile</Link>

              {/* 3. DYNAMIC ADMIN LINK */}
              {/* This only renders if the role saved in localStorage is exactly "admin" */}
              {userRole === 'admin' && (
                <Link to="/admin" style={{ 
                  color: '#ffc107', 
                  textDecoration: 'none', 
                  fontWeight: 'bold', 
                  border: '1px solid #ffc107', 
                  padding: '5px 10px', 
                  borderRadius: '4px' 
                }}>
                  🛡️ Admin Panel
                </Link>
              )}

              <button onClick={handleLogout} style={{ marginLeft: 'auto', background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
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
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected User Routes */}
            <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
            <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/login" />} />
            <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/edit-profile" element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />} />
            <Route path="/explore" element={isAuthenticated ? <ExploreMeals /> : <Navigate to="/login" />} />
            <Route path="/favorites" element={isAuthenticated ? <Favorites /> : <Navigate to="/login" />} />

            {/* 4. PROTECTED ADMIN ROUTE */}
            {/* If a non-admin tries to type /admin in the URL, they are sent back Home */}
            <Route 
              path="/admin" 
              element={isAuthenticated && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;