// backend/routes/statsRoutes.js
const express = require('express');
const statsController = require('../controllers/statsController');
// Import authMiddleware if you need to protect this route in the future
// const authMiddleware = require('../middleware/authMiddleware'); 

const router = express.Router();

// Define the route for getting statistics
// Example: GET /api/statistics?timeframe=month 
// Add authMiddleware here if needed: router.get('/statistics', authMiddleware, statsController.getStatistics);
router.get('/statistics', statsController.getStatistics);

module.exports = router;