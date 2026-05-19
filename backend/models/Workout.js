const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true 
    },
    goal: { 
        type: String, 
        required: false // Set to true if you want to force every workout to have a goal
    },
    email: {
        type: String, // To track which user performed the workout
        required: false
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Workout', workoutSchema);