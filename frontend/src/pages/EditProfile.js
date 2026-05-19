import React, { useState } from 'react';

function EditProfile() {
  const storedEmail = localStorage.getItem('userEmail') || ''; // Adjust if you store email differently

  // Text Data State
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('Maintain Weight');
  
  // Image Data State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle standard text updates
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: storedEmail, currentWeight: weight, goal: goal }),
      });
      const data = await response.json();
      setMessage(response.ok ? "✅ " + data.message : "❌ " + data.error);
    } catch (err) {
      setMessage("❌ Server error.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Image Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    // Create a temporary URL to show the user a preview before uploading
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // Handle Image Upload to Node.js
  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("❌ Please select an image first.");

    setIsLoading(true);
    
    // We MUST use FormData to send files via fetch
    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('email', storedEmail);

    try {
      // NOTE: We do NOT set 'Content-Type' headers when sending FormData. The browser does it automatically.
      const response = await fetch('http://localhost:5000/api/profile/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setMessage(response.ok ? "✅ " + data.message : "❌ " + data.error);
    } catch (err) {
      setMessage("❌ Upload failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Edit My Profile</h2>

        
        <div style={styles.imageSection}>
            {previewUrl ? (
                <img src={previewUrl} alt="Profile Preview" style={styles.avatar} />
            ) : (
                <div style={styles.placeholderAvatar}>No Image</div>
            )}
            
            <form onSubmit={handleImageUpload} style={styles.uploadForm}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />
                <button type="submit" disabled={isLoading} style={styles.uploadButton}>
                    Upload Picture
                </button>
            </form>
        </div>

        <hr style={styles.divider} />

        
        <form onSubmit={handleUpdate} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Update Current Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Change Fitness Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)} style={styles.input}>
              <option value="Lose Weight">Lose Weight</option>
              <option value="Maintain Weight">Maintain Weight</option>
              <option value="Build Muscle">Build Muscle</option>
            </select>
          </div>
          <button type="submit" disabled={isLoading} style={styles.button}>
            Save Text Changes
          </button>
        </form>

        {message && <p style={styles.messageBox}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', marginTop: '50px', paddingBottom: '50px' },
  card: { background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '400px' },
  title: { textAlign: 'center', marginBottom: '20px' },
  imageSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' },
  avatar: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #000' },
  placeholderAvatar: { width: '100px', height: '100px', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontWeight: 'bold' },
  uploadForm: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px', gap: '10px' },
  fileInput: { fontSize: '12px' },
  uploadButton: { padding: '8px 12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  divider: { borderTop: '1px solid #eee', margin: '20px 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontWeight: 'bold', fontSize: '14px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' },
  button: { padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  messageBox: { marginTop: '15px', textAlign: 'center', fontWeight: 'bold', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }
};

export default EditProfile;