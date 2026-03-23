import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

function Analytics() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state to prevent white screens

  useEffect(() => {
    fetch('http://localhost:5000/api/workouts')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data from the server');
        }
        return response.json();
      })
      .then((data) => {
        const groupedData = {};
        
        data.forEach((workout) => {
          // STRICT SAFETY CHECK: Skip if workout is broken or missing a type
          if (!workout || !workout.type) return;

          // Force the type to be a string and trim whitespace
          const safeType = String(workout.type).trim();
          if (safeType === '') return;

          // Capitalize safely
          const formattedType = safeType.charAt(0).toUpperCase() + safeType.slice(1).toLowerCase();
          
          // Force duration to be a number (default to 0 if it's broken)
          const duration = Number(workout.duration) || 0;

          if (groupedData[formattedType]) {
            groupedData[formattedType] += duration;
          } else {
            groupedData[formattedType] = duration;
          }
        });

        // Convert to the array format Recharts needs
        const formattedData = Object.keys(groupedData).map((key) => ({
          name: key,
          totalDuration: groupedData[key],
        }));

        setChartData(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Data processing error:", err);
        setError("Could not load chart data. Make sure your server is running.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Workout Analytics</h2>
      
      {/* 1. Show Error if something broke */}
      {error ? (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '5px', textAlign: 'center' }}>
          {error}
        </div>
      ) 
      
      /* 2. Show Loading state */
      : loading ? (
        <p style={{ textAlign: 'center' }}>Loading your chart...</p>
      ) 
      
      /* 3. Show message if database is empty */
      : chartData.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No data to display. Log some workouts first!</p>
      ) 
      
      /* 4. Render the Chart */
      : (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h4 style={{ textAlign: 'center', color: '#555', marginBottom: '20px' }}>Total Minutes per Workout Type</h4>
          
          {/* Explicit height is REQUIRED here for Recharts to not collapse */}
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft', offset: -5 }} />
                <Tooltip cursor={{ fill: '#eee' }} />
                <Bar dataKey="totalDuration" fill="#8884d8" barSize={50} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  );
}

export default Analytics;