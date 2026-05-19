const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const Meal = require('./models/Meal');
const Workout = require('./models/Workout'); 
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already in use" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            name, email, password: hashedPassword, role: role || 'user' 
        });
        await newUser.save();
        res.status(201).json({ message: "User created successfully!" });
    } catch (err) { res.status(500).json({ error: "Registration failed" }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role, email: user.email, message: "Logged in!" });
    } catch (err) { res.status(500).json({ error: "Login failed" }); }
});

// --- WORKOUT ROUTES ---
app.get('/api/workouts', async (req, res) => {
    try {
        const workouts = await Workout.find().sort({ date: -1 }); 
        res.json(workouts);
    } catch (err) { res.status(500).json({ error: 'Failed to fetch workouts' }); }
});

app.post('/api/workouts', async (req, res) => {
    try {
        const newWorkout = new Workout(req.body);
        await newWorkout.save();
        res.status(201).json(newWorkout);
    } catch (err) { res.status(400).json({ error: 'Failed to save workout' }); }
});

// --- COMMUNITY DISCOVERY & TEXT REVIEWS SEARCH ---
app.get('/api/meals/search', async (req, res) => {
    try {
        const searchQuery = req.query.q || ""; 
        console.log(`Incoming meal search query parameter: "${searchQuery}"`);

        const meals = await Meal.find({
            name: { $regex: searchQuery, $options: 'i' }
        }).limit(12);

        const adaptedMeals = meals.map(meal => {
            const ratings = meal.ratings || [];
            
            // Build custom descriptive review sentences: "username rated this X stars"
            const userReviews = ratings.map(r => {
                const username = r.email ? r.email.split('@')[0] : "Anonymous";
                return `${username} rated this ${r.score} stars`;
            });

            return {
                ...meal._doc,
                reviewsList: userReviews, 
                totalVotes: ratings.length
            };
        });

        res.json(adaptedMeals);
    } catch (err) {
        console.error("Search failed:", err);
        res.status(500).json({ error: "Search execution failure" });
    }
});

// --- TRANSACTIONAL RATING & REVIEW ENGINE (FIXED INSTANT SYNC) ---
app.post('/api/meals/rate', async (req, res) => {
    try {
        const { email, mealId, score } = req.body;
        console.log(`Review post received - Email: [${email}], Meal: [${mealId}], Score: [${score}]`);

        if (!email || !mealId || score === undefined) {
            return res.status(400).json({ error: "Missing required parameters: email, mealId, or score." });
        }

        const meal = await Meal.findById(mealId);
        if (!meal) return res.status(404).json({ error: "Meal document not found" });

        const cleanEmail = email.trim().toLowerCase();
        
        if (!meal.ratings) {
            meal.ratings = [];
        }

        const existingIndex = meal.ratings.findIndex(r => r.email === cleanEmail);
        
        if (existingIndex >= 0) { 
            meal.ratings[existingIndex].score = Number(score); 
        } else { 
            meal.ratings.push({ email: cleanEmail, score: Number(score) }); 
        }

        // Explicitly notify Mongoose that the nested array properties have altered
        meal.markModified('ratings');
        
        // Enforce await constraint to fully finalize database indexing changes before response delivery
        await meal.save();
        console.log("Review committed to MongoDB successfully!");

        // Build a fresh text reviews array using the newly updated data block
        const freshReviewsList = meal.ratings.map(r => {
            const username = r.email ? r.email.split('@')[0] : "Anonymous";
            return `${username} rated this ${r.score} stars`;
        });

        // Send back the brand new attributes directly in the payload to allow instant UI mutations
        res.json({ 
            message: "Review updated successfully!",
            reviewsList: freshReviewsList,
            totalVotes: meal.ratings.length
        });

    } catch (err) { 
        console.error("Rating database transaction failed:", err);
        res.status(500).json({ error: "Rating failed due to server error" }); 
    }
});

// --- WISHLIST TOGGLE INTERACTION CONTROLLER ---
app.post('/api/favorites/toggle', async (req, res) => {
    try {
        const { email, mealId } = req.body;
        console.log(`Wishlist transaction request for: [${email}] on Item ID: [${mealId}]`);

        if (!email || !mealId) {
            return res.status(400).json({ error: "Missing required tracking parameters." });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail });
        
        if (!user) {
            return res.status(404).json({ error: "User profile record not found." });
        }

        if (!user.favoriteMeals) {
            user.favoriteMeals = [];
        }

        // Structural ObjectId evaluation casting constraint guard
        const mealIndex = user.favoriteMeals.findIndex(id => id.toString() === mealId.toString());

        if (mealIndex >= 0) {
            user.favoriteMeals.splice(mealIndex, 1);
            await user.save();
            return res.json({ message: "Removed from Wishlist", isFavorite: false });
        } else {
            user.favoriteMeals.push(mealId);
            await user.save();
            return res.json({ message: "Saved to Wishlist!", isFavorite: true });
        }
    } catch (err) {
        console.error("Wishlist toggle fail:", err);
        res.status(500).json({ error: "Internal crash handling favorites array updates." });
    }
});

// --- WISHLIST ARRAY POPULATION VIEW ROUTE ---
app.get('/api/favorites/:email', async (req, res) => {
    try {
        const cleanEmail = req.params.email.trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail }).populate('favoriteMeals');
        
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user.favoriteMeals || []);
    } catch (err) {
        res.status(500).json({ error: "Populate failed" });
    }
});

// --- SMART PLAN ROUTE ---
app.get('/api/smart-plan/:email', async (req, res) => {
    try {
        const userEmail = req.params.email;
        const user = await User.findOne({ email: userEmail });

        if (!user || !user.goal) {
            return res.json({ goal: "Not Set", meals: [], workouts: [] });
        }

        const suggestedMeals = await Meal.find({ goal: user.goal }).limit(3);
        const suggestedWorkouts = await Workout.find({ goal: user.goal }).limit(3);

        res.json({ goal: user.goal, meals: suggestedMeals, workouts: suggestedWorkouts });
    } catch (err) { res.status(500).json({ error: "Internal Server Error" }); }
});

// --- PROFILE UPDATE ---
app.put('/api/profile/update', async (req, res) => {
    try {
        const { email, currentWeight, goal } = req.body;
        const user = await User.findOneAndUpdate(
            { email: email },
            { weight: currentWeight, goal: goal },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ message: "Updated!", user });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// --- SEED ROUTE ---
app.get('/api/seed-meals', async (req, res) => {
    try {
        await Meal.deleteMany({});
        await Workout.deleteMany({});
        
        const sampleMeals = [
            { name: "Egg & Spinach Scramble", type: "breakfast", goal: "Lose Weight" },
            { name: "Avocado & Chicken Wrap", type: "lunch", goal: "Lose Weight" },
            { name: "Giant Protein Oats", type: "breakfast", goal: "Build Muscle" },
            { name: "Steak & Mashed Potato", type: "dinner", goal: "Build Muscle" },
            { name: "Mediterranean Pasta", type: "lunch", goal: "Maintain Weight" }
        ];

        const sampleWorkouts = [
            { type: "HIIT Fat Burner", duration: 25, goal: "Lose Weight" },
            { type: "Morning Run", duration: 30, goal: "Lose Weight" },
            { type: "Upper Body Hypertrophy", duration: 60, goal: "Build Muscle" },
            { type: "Deadlift Max Strength", duration: 45, goal: "Build Muscle" },
            { type: "Yoga Flow", duration: 40, goal: "Maintain Weight" }
        ];

        await Meal.insertMany(sampleMeals);
        await Workout.insertMany(sampleWorkouts);
        res.json({ message: "Database Seeded!" });
    } catch (err) { res.status(500).json({ error: "Seed failed" }); }
});
// --- COMPLEMENTARY PURGE PATHWAY FOR RECENT WORKOUTS ---
app.delete('/api/workouts/:id', async (req, res) => {
    try {
        const removedWorkout = await Workout.findByIdAndDelete(req.params.id);
        if (!removedWorkout) return res.status(404).json({ error: "Workout log file not found" });
        res.json({ message: "Workout entry removed successfully from MongoDB!" });
    } catch (err) {
        res.status(500).json({ error: "System failed to process resource clearance" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));