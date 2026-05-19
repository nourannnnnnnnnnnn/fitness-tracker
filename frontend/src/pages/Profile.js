import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Profile() {
  const [formData, setFormData] = useState({ 
    name: '', 
    age: '', 
    weight: '', 
    height: '', 
    goal: 'Maintain Weight' 
  });
  const [results, setResults] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  // Get the logged-in user's email from localStorage
  const userEmail = localStorage.getItem('userEmail');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setSaveStatus('⏳ Syncing with database...');

    // 1. Normalize the email to prevent 404 errors (removes spaces and makes lowercase)
    const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : '';

    try {
      // 2. Save the goal and weight to the database
      const saveResponse = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          currentWeight: formData.weight,
          goal: formData.goal
        }),
      });

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveResult.error || "Failed to sync goal");
      }

      console.log("Sync Successful:", saveResult);

      // 3. Calculate BMI locally for immediate feedback
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      
      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal weight';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';

      // 4. Define local diet plan based on the chosen goal
      const dietPlans = {
        'Lose Weight': { 
            breakfast: 'Oatmeal with berries', 
            lunch: 'Grilled chicken salad', 
            dinner: 'Steamed fish with broccoli', 
            snacks: 'Green apple' 
        },
        'Build Muscle': { 
            breakfast: 'Scrambled eggs with avocado', 
            lunch: 'Steak and sweet potato', 
            dinner: 'Chicken breast with pasta', 
            snacks: 'Protein shake' 
        },
        'Maintain Weight': { 
            breakfast: 'Whole grain toast', 
            lunch: 'Quinoa bowl with chickpeas', 
            dinner: 'Turkey meatballs', 
            snacks: 'Almonds' 
        }
      };

      setResults({
        bmi,
        category,
        plan: dietPlans[formData.goal]
      });
      
      setSaveStatus('✅ Profile Synced! Visit Home to see your plan.');
    } catch (error) {
      console.error("Profile Sync Error:", error);
      setSaveStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Personalized Fitness Profile</h2>

      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <Link to="/edit-profile" style={editButtonStyle}>
            ⚙️ Edit Profile & Upload Picture
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* LEFT: FORM SECTION */}
        <div style={{ flex: '1', minWidth: '300px', background: '#f8f9fa', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0 }}>Enter Your Details</h3>
          <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={inputGroup}>
                <label style={labelStyle}>First Name</label>
                <input type="text" name="name" placeholder="Nour" onChange={handleChange} required style={styles.input}/>
            </div>
            
            <div style={inputGroup}>
                <label style={labelStyle}>Age</label>
                <input type="number" name="age" placeholder="22" onChange={handleChange} required style={styles.input}/>
            </div>

            <div style={inputGroup}>
                <label style={labelStyle}>Weight (kg)</label>
                <input type="number" name="weight" placeholder="70" onChange={handleChange} required style={styles.input}/>
            </div>

            <div style={inputGroup}>
                <label style={labelStyle}>Height (cm)</label>
                <input type="number" name="height" placeholder="175" onChange={handleChange} required style={styles.input}/>
            </div>
            
            <div style={inputGroup}>
                <label style={labelStyle}>Fitness Goal</label>
                <select name="goal" value={formData.goal} onChange={handleChange} style={styles.input}>
                  <option value="Maintain Weight">Maintain Weight</option>
                  <option value="Lose Weight">Lose Weight</option>
                  <option value="Build Muscle">Build Muscle</option>
                </select>
            </div>

            <button type="submit" style={styles.submitBtn}>
              Generate & Sync My Plan
            </button>
            
            {saveStatus && (
                <p style={{ 
                    fontSize: '13px', 
                    textAlign: 'center', 
                    marginTop: '10px', 
                    color: saveStatus.includes('✅') ? '#27ae60' : '#e74c3c',
                    fontWeight: 'bold'
                }}>
                    {saveStatus}
                </p>
            )}
          </form>
        </div>

        {/* RIGHT: RESULTS SECTION */}
        {results && (
          <div style={{ flex: '1', minWidth: '300px', background: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e1e8ed', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Results for {formData.name}</h3>
            <div style={{ background: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '1.1em' }}>
                  BMI: <strong>{results.bmi}</strong> — <span style={{ color: '#28a745', fontWeight: 'bold' }}>{results.category}</span>
                </p>
            </div>
            
            <h4 style={{ color: '#007bff', marginBottom: '10px' }}>🥗 Recommended Diet:</h4>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
              <li><strong>🍳 Breakfast:</strong> {results.plan.breakfast}</li>
              <li><strong>🥗 Lunch:</strong> {results.plan.lunch}</li>
              <li><strong>🥩 Dinner:</strong> {results.plan.dinner}</li>
              <li><strong>🍎 Snacks:</strong> {results.plan.snacks}</li>
            </ul>
            <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '15px', fontStyle: 'italic' }}>
                Your dashboard has been updated with {formData.goal} workouts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
    submitBtn: { padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }
};

const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '13px', fontWeight: 'bold', color: '#555' };

const editButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#2c3e50',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  display: 'inline-block',
  transition: '0.3s'
};

export default Profile;