import React, { useState, useEffect } from 'react';

function History() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Retrieve the logged-in user email
  const storedEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetch('http://localhost:5000/api/workouts')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          console.log("Raw history data fetched from server:", data);
          
          // BULLETPROOF FILTER: 
          // 1. Shows workouts matching your email.
          // 2. ALSO shows workouts that have NO email attached yet (so your screen isn't empty from the start!)
          const personalHistory = data.filter((workout) => {
            if (!workout.email) return true; // Fallback: show unassigned workouts so the screen isn't blank
            return workout.email.trim().toLowerCase() === storedEmail?.trim().toLowerCase();
          });
          
          setWorkouts(personalHistory);
        } else {
          setWorkouts([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching history data:", error);
        setLoading(false);
      });
  }, [storedEmail]);

  // Handle deleting a workout with instant screen updates
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workout log entry?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/workouts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted workout from the screen instantly
        setWorkouts(prevWorkouts => prevWorkouts.filter((workout) => workout._id !== id));
      } else {
        console.error("Server rejected deletion request.");
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Workout History Log Book 📜</h2>
      <p style={styles.subtitle}>Review your previously logged activities and progress milestones</p>
      
      {loading ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>🔄 Loading your tracking data...</p>
      ) : workouts.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={{ margin: 0, fontSize: '16px', color: '#7f8c8d' }}>No logged workouts found.</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#bdc3c7' }}>
            Head over to your Home dashboard to log a new activity!
          </p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Activity Type</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Goal Tracked</th>
                <th style={styles.th}>Date</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((workout) => (
                <tr key={workout._id} style={styles.row}>
                  <td style={{ ...styles.td, textTransform: 'capitalize', fontWeight: 'bold', color: '#2c3e50' }}>
                    🏋️ {workout.type}
                  </td>
                  <td style={styles.td}>{workout.duration} mins</td>
                  <td style={styles.td}>
                    <span style={styles.goalTag}>
                      {workout.goal || "General Fitness"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {workout.date ? new Date(workout.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Recent'}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(workout._id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' },
  title: { textAlign: 'center', color: '#2c3e50', marginBottom: '5px', fontSize: '28px' },
  subtitle: { textAlign: 'center', color: '#7f8c8d', margin: '0 0 35px 0', fontSize: '15px' },
  tableContainer: { background: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' },
  headerRow: { background: '#f8f9fa', borderBottom: '2px solid #eee' },
  th: { padding: '15px 20px', fontWeight: 'bold', color: '#34495e', fontSize: '13px', textTransform: 'uppercase' },
  row: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '15px 20px', color: '#555' },
  goalTag: { background: '#e1f5fe', color: '#0288d1', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  deleteButton: { background: 'none', color: '#dc3545', border: '1px solid #dc3545', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' },
  emptyBox: { textAlign: 'center', padding: '50px 20px', background: '#f8f9fa', borderRadius: '15px', border: '1px solid #eee' }
};

export default History;