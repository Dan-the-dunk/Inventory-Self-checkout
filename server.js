    // backend/server.js
    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const pool = require('./config/db'); // Import the pool (optional, if needed directly here)
    const authRoutes = require('./routes/authRoutes');
    const statsRoutes = require('./routes/statsRoutes'); // Assuming you create this too

    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use('/auth', authRoutes); // Prefix auth routes with /auth (e.g., /auth/login)
    app.use('/api', statsRoutes); // Example prefix for stats (e.g., /api/statistics)
    // app.use('/api/workers', workerRoutes); // You'll add this later

    // Basic Root Route (optional)
    app.get('/', (req, res) => {
        res.send('API is running...');
    });


    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });