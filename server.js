const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests for frontend


const PORT = 5000;
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/selfcheckout');

// Connection Status
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('Connection error:', error);
});

// User Schema
const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Auth Service - Register
app.post('/register', async (req, res) => {
    try {
        console.log('Received registration request:', req.body);
        const { id, name, username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists:', username);
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Ensure the password is hashed before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Storing hashed password:', hashedPassword);

        const newUser = new User({ id, name, username, password: hashedPassword });
        await newUser.save();

        console.log('User registered successfully:', username);
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Auth Service - Login
app.post('/login', async (req, res) => {
    try {
        console.log('Received login request:', req.body);
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
            console.log('Login failed: Username does not exist');
            return res.status(400).json({ message: 'Username does not exist' });
        }
        
        console.log('Stored hashed password:', user.password); // Log stored password for debugging
        
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch); // Log comparison result
        
        if (!isMatch) {
            console.log('Login failed: Incorrect password for', username);
            return res.status(400).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });
        console.log('Login successful:', username);
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
