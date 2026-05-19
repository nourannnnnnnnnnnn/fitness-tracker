import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [meals, setMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({ name: '', type: 'breakfast', goal: 'Lose Weight' });
  const [editingId, setEditingId] = useState(null); 

  useEffect(() => {
    fetchUsers();
    fetchMeals();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error("Not authorized to fetch users");
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchMeals = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/meals/search?q=');
      const data = await res.json();
      setMeals(data);
    } catch (err) {
      console.error("Failed to fetch meals", err);
    }
  };

  const handleAddOrUpdateMeal = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `http://localhost:5000/api/admin/meals/${editingId}` 
      : 'http://localhost:5000/api/admin/add-meal'; 
    
    const method = editingId ? 'PUT' : 'POST';
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newMeal)
      });
      if (res.ok) {
        alert(editingId ? "✅ Meal Updated!" : "🍲 Meal Added!");
        resetForm();
        fetchMeals();
      } else {
        alert("Server rejected the request. Check your admin permissions.");
      }
    } catch (err) { alert("Error processing meal"); }
  };

  const deleteMeal = async (id) => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/admin/meals/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (res.ok) {
          fetchMeals();
        } else {
          alert("Unauthorized to delete this meal.");
        }
      } catch (err) { alert("Delete failed"); }
    }
  };

  const startEdit = (meal) => {
    setEditingId(meal._id);
    setNewMeal({ name: meal.name, type: meal.type, goal: meal.goal });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewMeal({ name: '', type: 'breakfast', goal: 'Lose Weight' });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>🛡️ Admin Control Center</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px' }}>
        
        {/* LEFT COLUMN: MANAGE USERS */}
        <section style={styles.section}>
          <h3>👥 Manage Users</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}><th>Email</th><th>Role</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={styles.row}>
                  <td>{u.email}</td>
                  <td><span style={u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}>{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* RIGHT COLUMN: ADD / EDIT MEAL */}
        <section style={styles.section}>
          <h3>{editingId ? "✏️ Edit Meal" : "🍲 Add New Meal"}</h3>
          <form onSubmit={handleAddOrUpdateMeal} style={styles.form}>
            <input 
              placeholder="Meal Name" 
              value={newMeal.name}
              onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
              style={styles.input} required
            />
            <select 
              value={newMeal.type}
              onChange={(e) => setNewMeal({...newMeal, type: e.target.value})}
              style={styles.input}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <select 
              value={newMeal.goal}
              onChange={(e) => setNewMeal({...newMeal, goal: e.target.value})}
              style={styles.input}
            >
              <option value="Lose Weight">Lose Weight</option>
              <option value="Build Muscle">Build Muscle</option>
              <option value="Maintain Weight">Maintain Weight</option>
            </select>
            <button type="submit" style={{...styles.button, background: editingId ? '#007bff' : '#28a745'}}>
              {editingId ? "Update Meal" : "Add to Database"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{...styles.button, background: '#6c757d'}}>
                Cancel Edit
              </button>
            )}
          </form>
        </section>
      </div>

      {/* BOTTOM SECTION: ALL MEALS WITH ACTIONS */}
      <section style={{ ...styles.section, marginTop: '40px' }}>
        <h3>📜 Current Meal Library ({meals.length})</h3>
        <div style={styles.mealGrid}>
          {meals.map(meal => (
            <div key={meal._id} style={styles.mealItem}>
              <div>
                <strong>{meal.name}</strong>
                <div style={{fontSize: '12px', color: '#666'}}>{meal.type} | {meal.goal}</div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => startEdit(meal)} style={styles.editBtn}>Edit</button>
                <button onClick={() => deleteMeal(meal._id)} style={styles.deleteBtn}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  section: { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  headerRow: { textAlign: 'left', borderBottom: '2px solid #eee' },
  row: { borderBottom: '1px solid #eee' },
  badgeAdmin: { background: '#ffc107', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  badgeUser: { background: '#eee', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd' },
  button: { padding: '10px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  mealGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', maxHeight: '400px', overflowY: 'auto', padding: '10px' },
  mealItem: { padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: '#fcfcfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  editBtn: { background: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  deleteBtn: { background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

export default AdminDashboard;