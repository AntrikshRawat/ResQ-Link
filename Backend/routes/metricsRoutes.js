// ============================================================================
// Routes: /api/v1/metrics
// ============================================================================
const express = require('express');
const router = express.Router();

const { getMetrics } = require('../controllers/metricsController');

// GET /api/v1/metrics
router.get('/', getMetrics);

module.exports = router;
