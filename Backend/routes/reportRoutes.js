// ============================================================================
// Routes: /api/v1/intake
// ============================================================================
const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = require('../middleware/upload');
const { createReport } = require('../controllers/reportController');

// POST /api/v1/intake/report
// Accepts multipart/form-data with an optional `photo` image field.
router.post('/report', upload.single('photo'), createReport);

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
