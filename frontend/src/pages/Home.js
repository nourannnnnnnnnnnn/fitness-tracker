import React, { useState, useEffect } from 'react';

function Home() {
  const [smartData, setSmartData] = useState({ goal: '', meals: [], workouts: [] });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [workouts, setWorkouts] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- NEW WORKOUT INPUT FORM STATES ---
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetchData();
  }, [userEmail]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data for:", userEmail);

      // 1. Fetch Recent Activity Logs
      const histRes = await fetch('http://localhost:5000/api/workouts');
      const histData = await histRes.json();
      setWorkouts(histData);

      // 2. Fetch Synced Smart Data
      if (userEmail) {
        const smartRes = await fetch(`http://localhost:5000/api/smart-plan/${userEmail.trim().toLowerCase()}`);
        
        if (smartRes.ok) {
          const data = await smartRes.json();
          console.log("Smart Plan Data received:", data);
          
          setSmartData({
            goal: data.goal || "Not Set",
            meals: data.meals || [],
            workouts: data.workouts || []
          });
        } else {
          console.log("Failed to fetch smart plan. Status:", smartRes.status);
          setSmartData({ goal: 'Not Set', meals: [], workouts: [] });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Sync error:", error);
      setLoading(false);
    }
  };

  // --- NEW FUNCTION: SUBMIT WORKOUT FROM HUB DIRECTLY TO HISTORY ---
  const handleLogActivity = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      alert("Please sign in to track your exercise activities!");
      return;
    }

    const currentGoal = smartData.goal || "General Fitness";
    const newWorkoutPayload = { 
      type: type, 
      duration: Number(duration), 
      email: userEmail.trim().toLowerCase(), // Normalized email structure for history mapping filter checks
      goal: currentGoal
    };

    console.log("Submitting custom activity metrics payload:", newWorkoutPayload);

    try {
      const response = await fetch('http://localhost:5000/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkoutPayload),
      });

      if (response.ok) {
        const savedWorkout = await response.json();
        
        // Push the new item immediately to the top of the local activity tracking log array
        setWorkouts(prevWorkouts => [savedWorkout, ...prevWorkouts]);
        
        // Clean out form parameters immediately
        setType('');
        setDuration('');
        
        alert("Workout tracked successfully! It is now fully active inside your History Log book.");
      } else {
        alert("Server validation blocked tracking submission.");
      }
    } catch (error) {
      console.error("Failed to commit activity metrics:", error);
      alert("Error reaching the workout server endpoint.");
    }
  };

  const handleGeneratePlan = () => {
    console.log("Current smartData.goal in state:", smartData.goal);

    if (!smartData.goal || smartData.goal === "Not Set" || smartData.goal === "") {
      alert(`Your goal is currently: "${smartData.goal}". Please go to Profile, select a goal, and click "Generate & Sync" first!`);
      return;
    }

    const plan = {
      title: `${smartData.goal} Weekly Routine`,
      schedule: [
        { 
          day: "Monday", 
          workout: smartData.workouts[0]?.type || "Foundational Cardio", 
          meal: smartData.meals[0]?.name || "High Protein Salad" 
        },
        { 
          day: "Wednesday", 
          workout: smartData.workouts[1]?.type || "Core Strength", 
          meal: smartData.meals[1]?.name || "Balanced Grain Bowl" 
        },
        { 
          day: "Friday", 
          workout: smartData.workouts[2]?.type || "Endurance Session", 
          meal: smartData.meals[2]?.name || "Steamed Fish & Veg" 
        }
      ]
    };
    setGeneratedPlan(plan);
  };

  // Filters global database response arrays down to show your personal dashboard records
  const personalRecentLogs = Array.isArray(workouts) ? workouts.filter(
    w => w.email && w.email.trim().toLowerCase() === userEmail?.trim().toLowerCase()
  ) : [];

  if (loading) return <div style={styles.loading}>🔄 Syncing your fitness data...</div>;

  return (
    <div style={styles.page}>
      
      {/* HEADER ROW BAR CONTAINER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome to Your Hub</h1>
          <p style={styles.subtitle}>Track your progress and follow your AI-generated plan.</p>
        </div>
        <div style={{
            ...styles.goalBadge, 
            background: smartData.goal === "Not Set" ? "#e74c3c" : "#27ae60"
        }}>
          🎯 Goal: {smartData.goal}
        </div>
      </div>

      {/* INTELLIGENCE PLANNER PLATFORM CONTAINER */}
      <div style={styles.smartSection}>
        <div style={styles.plannerIntro}>
          <h3>🚀 AI Smart Planner</h3>
          <p>
            For your <strong>{smartData.goal}</strong> goal, 
            we found {smartData.workouts.length} workouts and {smartData.meals.length} meals.
          </p>
          <button onClick={handleGeneratePlan} style={styles.mainBtn}>
            {generatedPlan ? "✨ Refresh Plan" : "✨ Generate My Synced Plan"}
          </button>
        </div>

        {generatedPlan && (
          <div style={styles.planGrid}>
            {generatedPlan.schedule.map((item, index) => (
              <div key={index} style={styles.planCard}>
                <h4 style={styles.dayTitle}>{item.day}</h4>
                <div style={styles.planItem}><strong>🏋️ Workout:</strong> {item.workout}</div>
                <div style={styles.planItem}><strong>🍲 Meal:</strong> {item.meal}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DUAL DISPLAY SPLIT: LEFT SIDE INPUT FORM CONTAINER // RIGHT SIDE LOG SCREEN VIEWPORTS */}
      <div style={styles.columnsContainer}>
        
        {/* INTERACTIVE FORM WORKSPACE */}
        <div style={styles.formCard}>
          <h3 style={styles.sectionTitle}>Log a New Exercise Activity</h3>
          <form onSubmit={handleLogActivity} style={styles.formLayout}>
            <input 
              type="text" 
              placeholder="Exercise name (e.g. Swimming, Weightlifting)..." 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              required 
              style={styles.formInput}
            />
            <input 
              type="number" 
              placeholder="Duration context (in minutes)..." 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              required 
              style={styles.formInput}
            />
            <button type="submit" style={styles.formBtn}>
              Track Workout Session
            </button>
          </form>
        </div>

        {/* RECENT COMPLETED RECORDS VIEWPORT LIST */}
        <div style={{ flex: 1 }}>
          <h3 style={styles.sectionTitle}>Recent Activity</h3>
          <div style={styles.historyList}>
            {personalRecentLogs.length > 0 ? (
              personalRecentLogs.slice(0, 5).map(w => (
                <div key={w._id} style={styles.historyItem}>
                  <span><strong>{w.type}</strong> — {w.duration} mins</span>
                  <span style={styles.dateText}>
                    {w.date ? new Date(w.date).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>No recent workout logs match your personal metrics profile.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '950px', margin: '0 auto', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" },
  loading: { textAlign: 'center', marginTop: '100px', fontSize: '18px', color: '#666' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  title: { margin: 0, fontSize: '28px' },
  subtitle: { margin: '5px 0 0 0', color: '#7f8c8d' },
  goalBadge: { color: 'white', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px' },
  smartSection: { background: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #e1e8ed', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '40px' },
  plannerIntro: { textAlign: 'center' },
  mainBtn: { padding: '14px 28px', background: '#007bff', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' },
  planGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' },
  planCard: { background: '#f8f9fa', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid #eee' },
  dayTitle: { color: '#007bff', margin: '0 0 10px 0' },
  planItem: { fontSize: '13px', margin: '5px 0' },
  sectionTitle: { fontSize: '20px', margin: '0 0 15px 0', color: '#2c3e50' },
  columnsContainer: { display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '20px' },
  formCard: { flex: 1, minWidth: '300px', background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e1e8ed', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', alignSelf: 'flex-start' },
  formLayout: { display: 'flex', flexDirection: 'column', gap: '15px' },
  formInput: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', fontFamily: 'inherit' },
  formBtn: { padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  historyItem: { padding: '15px', border: '1px solid #f0f0f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', background: '#fff' },
  dateText: { fontSize: '12px', color: '#bdc3c7' },
  emptyText: { color: '#95a5a6', fontStyle: 'italic' }
};

export default Home;