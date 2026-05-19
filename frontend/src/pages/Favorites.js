import React, { useState, useEffect } from 'react';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const storedEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!storedEmail) {
        setIsLoading(false);
        return;
      }

      try {
        // Enforce normalization on query string parameters
        const cleanEmail = storedEmail.trim().toLowerCase();
        const response = await fetch(`http://localhost:5000/api/favorites/${cleanEmail}`);
        
        if (response.ok) {
          const data = await response.json();
          setFavorites(Array.isArray(data) ? data : []);
        } else {
          console.error("Server responded with an error code fetching wishlist.");
          setFavorites([]);
        }
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [storedEmail]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '10px', color: '#2c3e50' }}>My Saved Meals ❤️</h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d', margin: '0 0 30px 0' }}>Your hand-picked nutritional choices</p>
      
      {isLoading ? (
        <p style={{ textAlign: 'center', color: '#666' }}>🔄 Loading your favorites...</p>
      ) : favorites.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {favorites.map((meal) => (
            <div key={meal._id} style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'inline-block', background: '#007bff', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
                  {meal.type || "Meal"}
                </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#2c3e50' }}>{meal.name}</h3>
              </div>
              <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '10px', marginTop: '10px' }}>
                <p style={{ margin: '0', fontSize: '13px', color: '#555' }}>🎯 <strong>Goal:</strong> {meal.goal}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '15px', border: '1px solid #eee' }}>
          <p style={{ color: '#7f8c8d', margin: 0, fontSize: '16px' }}>You haven't saved any meals yet.</p>
          <p style={{ color: '#bdc3c7', fontSize: '14px', margin: '5px 0 0 0' }}>Go to the Explore page to bookmark your diet recommendations!</p>
        </div>
      )}
    </div>
  );
}

export default Favorites;