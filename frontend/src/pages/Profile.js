import React, { useState } from 'react';

function Profile() {
  const [formData, setFormData] = useState({ name: '', age: '', weight: '', height: '', goal: 'Maintain Weight' });
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/profile/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data); // Save the BMI and Diet Plan to display it!
      }
    } catch (error) {
      console.error("Error generating plan:", error);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Personalized Fitness Profile</h2>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Form Section */}
        <div style={{ flex: '1', minWidth: '300px', background: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
          <h3>Enter Your Details</h3>
          <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" name="name" placeholder="First Name" onChange={handleChange} required style={{ padding: '8px' }}/>
            <input type="number" name="age" placeholder="Age" onChange={handleChange} required style={{ padding: '8px' }}/>
            <input type="number" name="weight" placeholder="Weight (in kg)" onChange={handleChange} required style={{ padding: '8px' }}/>
            <input type="number" name="height" placeholder="Height (in cm)" onChange={handleChange} required style={{ padding: '8px' }}/>
            
            <select name="goal" onChange={handleChange} style={{ padding: '8px' }}>
              <option value="Maintain Weight">Maintain Weight</option>
              <option value="Lose Weight">Lose Weight</option>
              <option value="Build Muscle">Build Muscle</option>
            </select>

            <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Generate My Plan
            </button>
          </form>
        </div>

        {/* Results Section */}
        {results && (
          <div style={{ flex: '1', minWidth: '300px', background: '#e9ecef', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #28a745' }}>
            <h3>Hello, {formData.name}!</h3>
            <p style={{ fontSize: '1.2em' }}>
              Your BMI is: <strong>{results.bmi}</strong> <br/>
              Category: <strong>{results.category}</strong>
            </p>
            
            <hr style={{ margin: '20px 0', borderColor: '#ccc' }} />
            
            <h4>Your Daily Diet Plan:</h4>
            <ul style={{ lineHeight: '1.8' }}>
              <li><strong>🍳 Breakfast:</strong> {results.plan.breakfast}</li>
              <li><strong>🥗 Lunch:</strong> {results.plan.lunch}</li>
              <li><strong>🥩 Dinner:</strong> {results.plan.dinner}</li>
              <li><strong>🍎 Snacks:</strong> {results.plan.snacks}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;