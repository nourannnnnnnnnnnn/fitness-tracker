const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Ensure you created this file at backend/models/Workout.js!
const Workout = require('./models/Workout'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));

// GET Route: Fetch all workouts
app.get('/api/workouts', async (req, res) => {
    try {
        const workouts = await Workout.find().sort({ date: -1 }); 
        res.json(workouts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
});

// POST Route: Save a new workout
app.post('/api/workouts', async (req, res) => {
    try {
        const newWorkout = new Workout(req.body);
        const savedWorkout = await newWorkout.save();
        res.status(201).json(savedWorkout);
    } catch (err) {
        res.status(400).json({ error: 'Failed to save workout' });
    }
});

// DELETE Route: Remove a workout by ID
app.delete('/api/workouts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Workout.findByIdAndDelete(id);
        res.status(200).json({ message: 'Workout deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete workout' });
    }
});
// --- Add these imports at the top ---
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// --- Add these routes right above app.listen(PORT...) ---

// REGISTER Route
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already in use" });

        // 2. Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save the new user
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error during registration" });
    }
});

// LOGIN Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        // 2. Check the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        // 3. Create the VIP token (JSON Web Token)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, message: "Logged in successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error during login" });
    }
});

// POST Route: Calculate BMI and Generate Diet Plan
app.post('/api/profile/plan', (req, res) => {
    try {
        const { name, age, weight, height, goal } = req.body;

        // 1. Calculate BMI: Weight (kg) / Height (m)^2
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

        // 2. Determine BMI Category
        let category = 'Normal weight';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi >= 25 && bmi < 29.9) category = 'Overweight';
        else if (bmi >= 30) category = 'Obese';

        // 3. Generate Personalized Diet Plan
        let dailyPlan = {};
        
        if (goal === 'Lose Weight') {
            dailyPlan = {
                breakfast: 'Boiled eggs with cucumber and a slice of whole-wheat bread',
                lunch: 'Grilled chicken salad with a light vinaigrette',
                dinner: 'Baked white fish with steamed broccoli',
                snacks: 'A handful of raw almonds or a green apple'
            };
        } else if (goal === 'Build Muscle') {
            dailyPlan = {
                breakfast: 'Oatmeal with protein powder, peanut butter, and bananas',
                lunch: 'Large portion of grilled Shish Tawook with brown rice',
                dinner: 'Lean steak with roasted sweet potatoes',
                snacks: 'Cottage cheese or a high-protein fruit smoothie'
            };
        } else {
            // Default: Maintain Weight
            dailyPlan = {
                breakfast: 'Ful Medames with olive oil, tomatoes, and whole grain pita',
                lunch: 'Lentil soup with a side of mixed greens',
                dinner: 'Grilled chicken breast with quinoa and roasted vegetables',
                snacks: 'Greek yogurt with a drizzle of honey'
            };
        }

        // Send the complete package back to the frontend
        res.json({ bmi, category, plan: dailyPlan });

    } catch (err) {
        res.status(500).json({ error: 'Failed to generate plan' });
    }
});
// This is the crucial block that keeps the server awake!
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});