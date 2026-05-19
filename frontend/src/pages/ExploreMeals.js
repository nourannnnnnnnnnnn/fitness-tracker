import React, { useState } from 'react';

function ExploreMeals() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const storedEmail = localStorage.getItem('userEmail');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(`http://localhost:5000/api/meals/search?q=${searchTerm}`);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const rateMeal = async (mealId, score) => {
    if (!storedEmail) {
      alert("Please sign in to rate meals!");
      return;
    }

    console.log(`Casting review from frontend - Meal: ${mealId}, Score: ${score}`);

    try {
      const response = await fetch('http://localhost:5000/api/meals/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: storedEmail.trim().toLowerCase(), 
          mealId: mealId, 
          score: Number(score) 
        })
      });
      
      if (response.ok) {
        const updatedMealData = await response.json();
        console.log("Server returned fresh meal reviews state:", updatedMealData);

        // INSTANT LOCAL UI MUTATION LAYER: Maps directly into results to alter UI without delays
        setResults(prevResults => 
          prevResults.map(meal => 
            meal._id === mealId 
              ? { ...meal, reviewsList: updatedMealData.reviewsList, totalVotes: updatedMealData.totalVotes } 
              : meal
          )
        );

      } else {
        const errorData = await response.json();
        alert(`Server failed to record rating review: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Network connection error:", err);
      alert("Error reaching the rating server endpoint");
    }
  };

  const toggleFavorite = async (mealId) => {
    if (!storedEmail) {
      alert("Please sign in to add items to your wishlist!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: storedEmail.trim().toLowerCase(), 
          mealId 
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message); 
      } else {
        alert("Server failed to update wishlist state.");
      }
    } catch (err) {
      console.error("Wishlist sync error:", err);
      alert("Failed to modify wishlist");
    }
  };

  const handleHover = (e, index) => {
    const stars = e.currentTarget.parentElement.children;
    for (let i = 0; i <= index; i++) {
      stars[i].style.filter = 'none';
      stars[i].style.transform = 'scale(1.2)';
    }
  };

  const handleLeave = (e) => {
    const stars = e.currentTarget.parentElement.children;
    for (let i = 0; i < stars.length; i++) {
      stars[i].style.filter = 'grayscale(100%)';
      stars[i].style.transform = 'scale(1)';
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Community Meal Explorer</h2>
      
      <form onSubmit={handleSearch} style={styles.searchBarContainer}>
        <input 
          style={styles.searchInput}
          placeholder="Search meals (e.g. Chicken)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" style={styles.searchButton}>
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      <div style={styles.grid}>
        {results.map((meal) => (
          <div key={meal._id} style={styles.card}>
            <div style={styles.tag}>{meal.type}</div>
            <h3 style={styles.mealName}>{meal.name}</h3>
            
            {/* TEXT REVIEWS BOX CONTAINER (AVERAGES REMOVED) */}
            <div style={styles.reviewsContainer}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#2c3e50' }}>Community Reviews:</h4>
              {meal.reviewsList && meal.reviewsList.length > 0 ? (
                meal.reviewsList.map((review, idx) => (
                  <p key={idx} style={styles.reviewText}>💬 {review}</p>
                ))
              ) : (
                <p style={styles.emptyReviews}>No reviews posted yet. Be the first!</p>
              )}
              <span style={{ color: '#888', fontSize: '11px', display: 'block', marginTop: '8px' }}>
                ({meal.totalVotes || 0} reviews total)
              </span>
            </div>

            {/* STAR VOTE INTERACTION ACTIONS */}
            <div style={styles.ratingBox}>
              <p style={{ fontSize: '11px', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Cast Your Star Vote:</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span 
                    key={i} 
                    style={styles.starIcon}
                    onClick={() => rateMeal(meal._id, i + 1)}
                    onMouseEnter={(e) => handleHover(e, i)}
                    onMouseLeave={handleLeave}
                  >⭐</span>
                ))}
              </div>
            </div>

            <button onClick={() => toggleFavorite(meal._id)} style={styles.wishlistButton}>
              ❤️ Save to Wishlist
            </button>
          </div>
        ))}
      </div>

      {hasSearched && results.length === 0 && !isSearching && (
        <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '30px', fontStyle: 'italic' }}>
          No meals matched your search query. Try another combination!
        </p>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '950px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' },
  title: { textAlign: 'center', color: '#2c3e50', marginBottom: '30px', fontSize: '28px' },
  searchBarContainer: { display: 'flex', gap: '10px', marginBottom: '40px' },
  searchInput: { flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', outline: 'none' },
  searchButton: { padding: '14px 28px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' },
  card: { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  tag: { background: '#e9ecef', color: '#495057', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', width: 'fit-content', marginBottom: '12px', textTransform: 'uppercase' },
  mealName: { margin: '0 0 12px 0', color: '#2c3e50', fontSize: '18px' },
  reviewsContainer: { marginBottom: '15px', borderBottom: '1px solid #f5f5f5', paddingBottom: '12px', minHeight: '60px' },
  reviewText: { fontSize: '12px', color: '#555', fontStyle: 'italic', margin: '4px 0', lineHeight: '1.4' },
  emptyReviews: { fontSize: '12px', color: '#95a5a6', fontStyle: 'italic', margin: '4px 0' },
  ratingBox: { background: '#f8f9fa', padding: '12px', borderRadius: '10px', textAlign: 'center', marginBottom: '15px', border: '1px solid #f0f0f0' },
  starIcon: { cursor: 'pointer', fontSize: '22px', filter: 'grayscale(100%)', transition: 'transform 0.1s', display: 'inline-block' },
  wishlistButton: { width: '100%', padding: '12px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};

export default ExploreMeals;