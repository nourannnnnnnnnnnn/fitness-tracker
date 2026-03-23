const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // We will leave these blank upon signup, but fill them in later for the Personalized Plan!
    age: { type: Number },
    weight: { type: Number },
    fitnessGoal: { type: String } 
});

module.exports = mongoose.model('User', userSchema);