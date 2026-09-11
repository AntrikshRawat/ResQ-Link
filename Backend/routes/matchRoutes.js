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
  deleteCandidate,
  evaluatePersons,
  getAiHealth,
  triggerReportMatching,
} = require('../controllers/matchController');

// GET /api/v1/matching/ai-health (Ping AI sidecar status)
router.get('/ai-health', getAiHealth);

// POST /api/v1/matching/evaluate (Profile matching of two persons' data)
router.post('/evaluate', evaluatePersons);

// POST /api/v1/matching/trigger/:reportId (Trigger matching engine for a specific report)
router.post('/trigger/:reportId', triggerReportMatching);
router.post('/run/:reportId', triggerReportMatching);

// GET /api/v1/matching/stats
router.get('/stats', getTriageStats);

// GET /api/v1/matching/candidates
router.get('/candidates', getCandidates);

// GET /api/v1/matching/candidates/:id
router.get('/candidates/:id', getCandidateById);

// DELETE /api/v1/matching/candidates/:id
router.delete('/candidates/:id', deleteCandidate);

// POST /api/v1/matching/verify
router.post('/verify', verifyMatch);

module.exports = router;

