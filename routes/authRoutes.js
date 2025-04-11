    // backend/routes/authRoutes.js
    const express = require('express');
    const authController = require('../controllers/authController');
    const authMiddleware = require('../middleware/authMiddleware'); // Import middleware

    const router = express.Router();

    // Apply authMiddleware only to routes that need authentication/authorization
    router.post('/register', authMiddleware, authController.registerUser);
    router.post('/login', authController.loginUser);

    module.exports = router;