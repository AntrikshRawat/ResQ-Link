// ============================================================================
// Routes: /api/v1/matching
// ============================================================================
const express = require('express');
const router = express.Router();

const {
  verifyMatch,
  getCandidates,
  getCandidateById,
  getTriageStats,
} = require('../controllers/matchController');

// GET /api/v1/matching/stats
router.get('/stats', getTriageStats);

// GET /api/v1/matching/candidates
router.get('/candidates', getCandidates);

// GET /api/v1/matching/candidates/:id
router.get('/candidates/:id', getCandidateById);

// POST /api/v1/matching/verify
router.post('/verify', verifyMatch);

module.exports = router;
