    // backend/controllers/authController.js
    const pool = require('../config/db');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key"; // Use env var

    exports.registerUser = async (req, res) => {
        // Keep the 'admin' role check logic here, using req.user from authMiddleware
        if (req.user.role !== 'admin') {
             return res.status(403).json({ message: 'Access denied: Admins only' });
        }
        try {
            const { name, username, password, email, role, area } = req.body;
            // ... (rest of your registration logic: check existing user, hash password, insert) ...
             const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
             if (existingUser.rows.length > 0) {
                 return res.status(400).json({ message: 'Username already exists' });
             }
             const hashedPassword = await bcrypt.hash(password, 10);
             await pool.query('INSERT INTO users (name, username, password, email, role, area) VALUES ($1, $2, $3, $4, $5, $6)', [name, username, hashedPassword, email, role, area]);
             res.json({ message: 'Account registered successfully' });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    };

    exports.loginUser = async (req, res) => {
        try {
            const { username, password } = req.body;
             // ... (rest of your login logic: find user, compare password, generate JWT) ...
             const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
             if (result.rows.length === 0) {
                 return res.status(400).json({ message: 'Username does not exist' });
             }
             const user = result.rows[0];
             const isMatch = await bcrypt.compare(password, user.password);
             if (!isMatch) {
                 return res.status(400).json({ message: 'Incorrect password' });
             }
             const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
             res.json({ message: 'Login successful', token, role: user.role });
        } catch (error) {
             console.error('Login error:', error);
             // Avoid clearing localStorage on the server side
             res.status(500).json({ message: 'Server error during login' });
        }
    };