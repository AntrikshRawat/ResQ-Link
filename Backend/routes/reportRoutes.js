// ============================================================================
// Routes: /api/v1/intake
// ============================================================================
const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = require('../middleware/upload');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { createReport, getUserReports } = require('../controllers/reportController');

// GET /api/v1/intake/my-reports
// Returns all reports filed by the authenticated user
router.get('/my-reports', authenticate, getUserReports);

// POST /api/v1/intake/report
// Accepts multipart/form-data with an optional `photo` image field.
// Associates report with user if authenticated.
router.post('/report', optionalAuthenticate, upload.single('photo'), createReport);

// ── Multer error handler ────────────────────────────────────────────────────
// Catches file-size, file-type, and other Multer-specific errors before they
// hit the global error handler, returning a clear 400 response.
router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      code: err.code,
    });
  }
  next(err);
});

module.exports = router;
