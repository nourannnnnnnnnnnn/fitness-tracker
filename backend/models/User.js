const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, default: 'user' }, 
    age: { type: Number },
    weight: { type: Number },
    
    // --- CHANGE fitnessGoal TO goal ---
    goal: { type: String }, 
    
    profilePicture: { type: String, default: "" },
    favoriteMeals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }]
});

module.exports = mongoose.model('User', userSchema);