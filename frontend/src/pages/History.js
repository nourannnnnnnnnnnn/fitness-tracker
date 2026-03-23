import React, { useState, useEffect } from 'react';

function History() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all workouts
  useEffect(() => {
    fetch('http://localhost:5000/api/workouts')
      .then((response) => response.json())
      .then((data) => {
        setWorkouts(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Handle deleting a workout
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/workouts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted workout from the screen instantly
        setWorkouts(workouts.filter((workout) => workout._id !== id));
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Workout History</h2>
      {loading ? (
        <p>Loading your history...</p>
      ) : workouts.length === 0 ? (
        <p>No workouts found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#333', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Type</th>
              <th style={{ padding: '12px' }}>Duration (mins)</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((workout) => (
              <tr key={workout._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>{workout.type}</td>
                <td style={{ padding: '12px' }}>{workout.duration}</td>
                <td style={{ padding: '12px' }}>{new Date(workout.date).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => handleDelete(workout._id)}
                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default History;