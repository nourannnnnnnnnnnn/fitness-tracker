import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- AUTHENTICATION STORAGE ---
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);
        
        // --- ROLE STORAGE ---
        // This line is crucial for showing/hiding the Admin Panel
        localStorage.setItem('userRole', data.role || 'user'); 

        // Redirect to the dashboard/home
        window.location.href = '/'; 
      } else {
        setError(data.error || "Login failed. Check your credentials.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Server error. Please ensure your backend is running.");
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Log in to access your fitness dashboard.</p>
        
        {error && <div style={styles.errorBox}>{error}</div>}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="e.g., test@student.bue.edu.eg" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={isLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {isLoading ? 'Processing...' : 'Log In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

// Styling (Modern Sleek UI)
const styles = {
  pageContainer: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', Roboto, sans-serif" },
  card: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { margin: '0 0 10px 0', textAlign: 'center', color: '#333', fontSize: '28px' },
  subtitle: { margin: '0 0 30px 0', textAlign: 'center', color: '#666', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#444' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', outline: 'none' },
  button: { padding: '14px', background: '#000', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  buttonDisabled: { background: '#ccc', cursor: 'not-allowed' },
  errorBox: { background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' },
  footerText: { marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#666' },
  link: { color: '#000', fontWeight: 'bold', textDecoration: 'none' }
};

export default Login;