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
<<<<<<< HEAD
  evaluateProfiles,
  getAiHealth,
  triggerMatching,
} = require('../controllers/matchController');

// GET /api/v1/matching/ai-health (AI Sidecar connectivity check)
router.get('/ai-health', getAiHealth);

// POST /api/v1/matching/evaluate (Direct evaluation of two profiles via AI sidecar)
router.post('/evaluate', evaluateProfiles);

// POST /api/v1/matching/run/:reportId (Trigger matching pipeline for a report)
router.post('/run/:reportId', triggerMatching);
=======
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
>>>>>>> 8c94acc927649382026e3bf1d51a3306be21f80d

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

