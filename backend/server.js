const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const Meal = require('./models/Meal');
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
// POST Route: Calculate BMI and Generate DYNAMIC Diet Plan
app.post('/api/profile/plan', async (req, res) => {
    try {
        const { name, age, weight, height, goal } = req.body;

        // 1. Calculate BMI
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

        // 2. Determine BMI Category
        let category = 'Normal weight';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi >= 25 && bmi < 29.9) category = 'Overweight';
        else if (bmi >= 30) category = 'Obese';

        // 3. The Query Algorithm: Fetch 1 random meal from the database
        const fetchRandomMeal = async (mealType) => {
            const result = await Meal.aggregate([
                { $match: { goal: goal, type: mealType } }, // Match the goal and time of day
                { $sample: { size: 1 } }                    // Grab exactly 1 at random
            ]);
            
            // If the database is empty, provide a fallback string so the app doesn't crash
            return result.length > 0 ? result[0].name : "Standard healthy option (Database Empty)";
        };

        // 4. Build the dynamic plan
        const dailyPlan = {
            breakfast: await fetchRandomMeal('breakfast'),
            lunch: await fetchRandomMeal('lunch'),
            dinner: await fetchRandomMeal('dinner'),
            snacks: await fetchRandomMeal('snack')
        };

        // Send the complete package back to the frontend
        res.json({ bmi, category, plan: dailyPlan });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate dynamic plan' });
    }
});
// TEMPORARY ROUTE: Run this ONCE to fill your database with dynamic meals
// TEMPORARY ROUTE: Run this ONCE to fill your database with dynamic meals
// THE BULLETPROOF SEED ROUTE (Nuke & Pave)
// CHANGED TO GET: Now you can just visit this link in your browser!
app.get('/api/seed-meals', async (req, res) => {
    try {
        // 1. Wipe the old database clean
        await Meal.deleteMany({});

        // 2. The complete meal list for ALL goals
        const sampleMeals = [
            // Lose Weight Meals
            { name: "Boiled eggs with cucumber", type: "breakfast", goal: "Lose Weight" },
            { name: "Grilled chicken salad", type: "lunch", goal: "Lose Weight" },
            { name: "Baked white fish with steamed broccoli", type: "dinner", goal: "Lose Weight" },
            { name: "A green apple", type: "snack", goal: "Lose Weight" },

            // Build Muscle Meals
            { name: "Oatmeal with protein powder", type: "breakfast", goal: "Build Muscle" },
            { name: "Large portion of Shish Tawook", type: "lunch", goal: "Build Muscle" },
            { name: "Lean steak with sweet potatoes", type: "dinner", goal: "Build Muscle" },
            { name: "High-protein fruit smoothie", type: "snack", goal: "Build Muscle" },

            // Maintain Weight Meals
            { name: "Ful Medames with olive oil and pita", type: "breakfast", goal: "Maintain Weight" },
            { name: "Lentil soup with mixed greens", type: "lunch", goal: "Maintain Weight" },
            { name: "Grilled chicken breast with quinoa", type: "dinner", goal: "Maintain Weight" },
            { name: "Greek yogurt with honey", type: "snack", goal: "Maintain Weight" }
        ];

        // 3. Insert the fresh data
        await Meal.insertMany(sampleMeals);
        
        res.json({ message: "SUCCESS: Database Wiped and Re-Seeded with ALL meals!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to seed database" });
    }
});
// This is the crucial block that keeps the server awake!
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});