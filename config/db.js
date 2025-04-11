    // backend/config/db.js
    const { Pool } = require('pg');
    require('dotenv').config(); // Ensure env vars are loaded

    const pool = new Pool({
        user: process.env.DB_USER || 'postgres', // Use environment variables
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'selfcheckout',
        password: process.env.DB_PASSWORD || '3882426adC', // Strongly recommend using env vars
        port: process.env.DB_PORT || 5432,
    });

    // Optional: Check connection here or in server.js
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Error connecting to PostgreSQL:', err);
        } else {
            console.log('Connected to PostgreSQL');
        }
    });

    module.exports = pool;