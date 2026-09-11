// ============================================================================
// Controller: Report Intake
// ============================================================================
const { Report } = require('../models');
const { generateTrackingCode } = require('../utils/trackingCode');
const { findMatchesForReport } = require('../services/matchingOrchestrator');

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Basic XSS-safe sanitisation: trim whitespace and escape HTML entities.
 * For production, consider a dedicated library like `xss` or `DOMPurify`.
 */
function sanitize(value) {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Sanitise every string value in an object (shallow). */
function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitize(value);
  }
  return sanitized;
}

// ── POST /api/v1/intake/report ──────────────────────────────────────────────

async function createReport(req, res) {
  try {
    // 1. Extract & sanitise body fields
    const {
      report_type,
      source_channel,
      first_name,
      last_name,
      approximate_age,
      gender,
      distinguishing_marks,
      clothing_description,
      last_known_location,
    } = sanitizeObject(req.body);

    // 2. Basic validation for required fields
    if (!report_type || !source_channel || !first_name || !gender || !last_known_location) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: report_type, source_channel, first_name, gender, and last_known_location are required.',
      });
    }

    // 3. Determine if the person is a minor
    const parsedAge = approximate_age ? parseInt(approximate_age, 10) : null;
    const is_minor = parsedAge !== null && !isNaN(parsedAge) && parsedAge < 18;

    // 4. Generate a unique tracking code
    const tracking_code = await generateTrackingCode();

    // 5. Grab the uploaded photo path (may be undefined if no file sent)
    const photo_path = req.file ? req.file.path : null;

    // 6. Create the Report record
    const report = await Report.create({
      report_type,
      source_channel,
      first_name,
      last_name: last_name || null,
      approximate_age: parsedAge,
      gender,
      distinguishing_marks: distinguishing_marks || null,
      clothing_description: clothing_description || null,
      last_known_location,
      photo_path,
      tracking_code,
      is_minor,
    });

    // Fire-and-forget: trigger the matching engine in the background.
    // Do NOT await — the client gets their 201 response immediately.
    findMatchesForReport(report.id).catch((err) =>
      console.error('✖  Background matching failed:', err)
    );
    // 7. Respond with the tracking code
    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      data: {
        tracking_code: report.tracking_code,
      },
    });
  } catch (error) {
    console.error('✖  Error creating report:', error);

    // Sequelize validation errors → 400
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: error.errors.map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
}

module.exports = { createReport };
