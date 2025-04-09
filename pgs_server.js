// Backend - Node.js with Express & PostgreSQL
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "your_secret_key";

const PORT = 5000;

// PostgreSQL Database Connection
const pool = new Pool({
    user: 'postgres', //Should change to your own username
    host: 'localhost',
    database: 'selfcheckout',
    password: '3882426adC',
    port: 5432,
});

// Check Connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

// Register Route
app.post('/users/register',authMiddleware, async (req, res) => {

    console.log(req.user)
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const { name, username, password, role } = req.body;
        
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)', [name, username, hashedPassword, role]);

        res.json({ message: 'Account registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {

        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Username does not exist' });
        }
        
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }
        
        // Send the token along with the user's role
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ message: 'Login successful', token, role: user.role });
    } catch (error) {
        localStorage.clear();
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/statistics', async (req, res) => {
    try {
        const { timeframe } = req.query; // week, month, year

        let query = "";
        if (timeframe === "week") {
            query = `SELECT DATE_TRUNC('week', extracted_at) AS period, COUNT(*) as total_items 
                     FROM warehouse_log GROUP BY period ORDER BY period DESC;`;
        } else if (timeframe === "month") {
            query = `SELECT DATE_TRUNC('month', extracted_at) AS period, COUNT(*) as total_items 
                     FROM warehouse_log GROUP BY period ORDER BY period DESC;`;
        } else if (timeframe === "year") {
            query = `SELECT DATE_TRUNC('year', extracted_at) AS period, COUNT(*) as total_items 
                     FROM warehouse_log GROUP BY period ORDER BY period DESC;`;
        } else {
            return res.status(400).json({ message: "Invalid timeframe" });
        }

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

