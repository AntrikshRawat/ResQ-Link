// ============================================================================
// Routes: /api/v1/matching
// ============================================================================
const express = require('express');
const router = express.Router();

const { verifyMatch, getCandidates } = require('../controllers/matchController');

// GET /api/v1/matching/candidates
router.get('/candidates', getCandidates);

// POST /api/v1/matching/verify
router.post('/verify', verifyMatch);

module.exports = router;
