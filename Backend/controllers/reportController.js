// ============================================================================
// Controller: Report Intake
// ============================================================================
const { Report, MatchCandidate, MasterPerson } = require('../models');
const { generateTrackingCode } = require('../utils/trackingCode');
const { findMatchesForReport } = require('../services/matchingOrchestrator');
const { Op } = require('sequelize');

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

    // Associate with authenticated user if available
    const user_id = req.user?.id || req.body.user_id || null;

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
      user_id,
    });

    // Fire-and-forget: trigger the matching engine in the background.
    findMatchesForReport(report.id).catch((err) =>
      console.error('✖  Background matching failed:', err)
    );

    // 7. Respond with the tracking code
    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      data: {
        tracking_code: report.tracking_code,
        id: report.id,
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

// ── GET /api/v1/intake/my-reports ───────────────────────────────────────────

/**
 * Returns all reports filed by the authenticated user with match & tracking details
 */
async function getUserReports(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userId = req.user.id;

    // Find all reports filed by this user
    const reports = await Report.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: MatchCandidate,
          as: 'matchesAsSource',
          include: [{ model: Report, as: 'targetReport' }],
        },
        {
          model: MatchCandidate,
          as: 'matchesAsTarget',
          include: [{ model: Report, as: 'sourceReport' }],
        },
      ],
    });

    // Enrich reports with match resolution details
    const enrichedReports = await Promise.all(
      reports.map(async (rep) => {
        const repData = rep.toJSON();

        const allMatches = [
          ...(repData.matchesAsSource || []),
          ...(repData.matchesAsTarget || []),
        ];

        const approvedMatch = allMatches.find((m) => m.status === 'APPROVED');
        const pendingMatches = allMatches.filter((m) => m.status === 'PENDING_REVIEW');

        let match_info = null;
        if (approvedMatch) {
          const counterpart =
            approvedMatch.source_report_id === repData.id
              ? approvedMatch.targetReport
              : approvedMatch.sourceReport;

          // Attempt to find MasterPerson record
          const masterPerson = await MasterPerson.findOne({
            where: {
              merged_report_ids: {
                [Op.contains]: [repData.id],
              },
            },
          }).catch(() => null);

          match_info = {
            match_status: 'APPROVED',
            counterpart: counterpart
              ? {
                  id: counterpart.id,
                  report_type: counterpart.report_type,
                  first_name: counterpart.first_name,
                  last_name: counterpart.last_name,
                  last_known_location: counterpart.last_known_location,
                  tracking_code: counterpart.tracking_code,
                  photo_path: counterpart.photo_path,
                }
              : null,
            facility: masterPerson?.current_facility || counterpart?.last_known_location || 'Emergency Relief Center',
            confirmed_status: masterPerson?.confirmed_status || 'SHELTERED',
          };
        } else if (pendingMatches.length > 0) {
          match_info = {
            match_status: 'PENDING_VERIFICATION',
            pending_candidates_count: pendingMatches.length,
          };
        }

        return {
          ...repData,
          matchesAsSource: undefined,
          matchesAsTarget: undefined,
          match_info,
        };
      })
    );

    const missing_reports = enrichedReports.filter((r) => r.report_type === 'MISSING');
    const rescued_reports = enrichedReports.filter(
      (r) => r.report_type === 'RESCUED' || r.report_type === 'HOSPITAL_PATIENT'
    );

    const stats = {
      total: enrichedReports.length,
      missing_count: missing_reports.length,
      rescued_count: rescued_reports.length,
      resolved_count: enrichedReports.filter((r) => r.status === 'RESOLVED_LOCATED').length,
      pending_verification_count: enrichedReports.filter(
        (r) => r.status === 'PENDING_VERIFICATION' || (r.match_info?.match_status === 'PENDING_VERIFICATION')
      ).length,
    };

    return res.status(200).json({
      success: true,
      data: {
        stats,
        missing_reports,
        rescued_reports,
        all_reports: enrichedReports,
      },
    });
  } catch (error) {
    console.error('✖  Error fetching user reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching your reports.',
    });
  }
}

module.exports = {
  createReport,
  getUserReports,
};
