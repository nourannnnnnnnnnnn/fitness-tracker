const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['breakfast', 'lunch', 'dinner', 'snack'], 
        required: true 
    },
    goal: { 
        type: String, 
        enum: ['Lose Weight', 'Build Muscle', 'Maintain Weight'], 
        required: true 
    }
});

module.exports = mongoose.model('Meal', mealSchema);