// ============================================================================
// Routes: /api/v1/track
// ============================================================================
const express = require('express');
const router = express.Router();

const { trackReport } = require('../controllers/trackController');

// GET /api/v1/track/:trackingCode
router.get('/:trackingCode', trackReport);

module.exports = router;
