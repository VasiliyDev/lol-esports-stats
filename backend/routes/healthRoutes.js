// routes/healthRoutes.js
const express = require('express');
const { healthController } = require('../controllers');

const router = express.Router();

// Health check route
router.get('/health', healthController.checkHealth);

// Welcome route
router.get('/', healthController.welcome);

module.exports = router;
