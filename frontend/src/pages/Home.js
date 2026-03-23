import React, { useState, useEffect } from 'react';

function Home() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New state variables for our form inputs
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');

  // Fetch workouts on load
  useEffect(() => {
    fetch('http://localhost:5000/api/workouts')
      .then((response) => response.json())
      .then((data) => {
        setWorkouts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Handle form submission to save a new workout
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing

    const newWorkout = { type, duration: Number(duration) };

    try {
      const response = await fetch('http://localhost:5000/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkout),
      });

      if (response.ok) {
        const savedWorkout = await response.json();
        // Add the new workout to the top of our list instantly
        setWorkouts([savedWorkout, ...workouts]);
        // Clear the form
        setType('');
        setDuration('');
      }
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Fitness Workout Tracker</h1>
      
      {/* Form Section */}
      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Log a New Workout</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Workout Type (e.g., Strength, Running)" 
            value={type} 
            onChange={(e) => setType(e.target.value)} 
            required 
            style={{ padding: '8px' }}
          />
          <input 
            type="number" 
            placeholder="Duration (in minutes)" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
            required 
            style={{ padding: '8px' }}
          />
          <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Workout
          </button>
        </form>
      </div>

      {/* List Section */}
      <h2>Your Recent Workouts</h2>
      {loading ? (
        <p>Loading your data...</p>
      ) : workouts.length === 0 ? (
        <p>No workouts logged yet. Add one above!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {workouts.map((workout) => (
            <div key={workout._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{workout.type}</h3>
              <p style={{ margin: '0' }}><strong>Duration:</strong> {workout.duration} mins</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#555' }}>
                Date: {new Date(workout.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;