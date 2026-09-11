// ============================================================================
// Middleware: Multer — File Upload Configuration
// ============================================================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Ensure the uploads/ directory exists ────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Allowed MIME types ──────────────────────────────────────────────────────
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Storage configuration ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Prefix with timestamp to avoid collisions, preserve original extension
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

// ── File filter — reject non-image uploads ──────────────────────────────────
function fileFilter(_req, file, cb) {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        `Invalid file type: ${file.mimetype}. Only jpeg, png, and webp are allowed.`
      ),
      false
    );
  }
}

// ── Export configured middleware ─────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = upload;
