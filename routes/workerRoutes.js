const express = require('express');
const workerController = require('../controllers/workerController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET all workers
router.get('/', authMiddleware, workerController.getAllWorkers);

// GET individual worker profile
router.get('/:id', authMiddleware, workerController.getWorkerProfile);

// PUT update worker
router.put('/:id', authMiddleware, workerController.updateWorker);

// DELETE worker
router.delete('/:id', authMiddleware, workerController.deleteWorker);

module.exports = router;