import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  // --- NEW: Added Name and Role states ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); 
  
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // --- NEW: Sending name and role to the backend ---
        body: JSON.stringify({ name, email, password, role }), 
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Registration successful! Please log in.");
        navigate('/login'); // Instantly redirect to login page
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9' }}>
      <h2 style={{ textAlign: 'center' }}>Sign Up</h2>
      {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* --- NEW: Full Name Input --- */}
        <input 
          type="text" 
          placeholder="Full Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <input 
          type="email" 
          placeholder="Email Address" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        {/* --- NEW: Role Selection Dropdown --- */}
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: 'white' }}
        >
          <option value="user">Standard User</option>
          <option value="admin">System Admin</option>
        </select>

        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Create Account
        </button>
      </form>
    </div>
  );
}

export default Register;