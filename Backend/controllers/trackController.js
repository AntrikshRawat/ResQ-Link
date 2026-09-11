// ============================================================================
// Controller: Report Tracking — Public Lookup by Tracking Code
// ============================================================================
const { Report } = require('../models');

/**
 * Builds a dynamic timeline array based on the report's current status.
 * Each milestone has a label and a `reached` flag so the frontend can
 * render a progress stepper.
 */
function buildTimeline(status) {
  const milestones = [
    { label: 'Report Registered', reached: true },
    { label: 'Cross-Referenced Across Facilities', reached: false },
    { label: 'Potential Match Located', reached: false },
    { label: 'Verified & Safe', reached: false },
  ];

  // Determine how far along the pipeline we are
  const reachedIndex = {
    UNMATCHED: 0,
    PENDING_VERIFICATION: 2,
    RESOLVED_LOCATED: 3,
    CLOSED: 3,
  }[status] ?? 0;

  return milestones.map((m, i) => ({
    ...m,
    reached: i <= reachedIndex,
  }));
}

/**
 * GET /api/v1/track/:trackingCode
 *
 * Public-facing lookup — no auth required.
 * Returns the report status, a visual timeline, and primary details.
 */
async function trackReport(req, res) {
  try {
    const { trackingCode } = req.params;

    const report = await Report.findOne({
      where: { tracking_code: trackingCode },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `No report found for tracking code: ${trackingCode}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        tracking_code: report.tracking_code,
        status: report.status,
        timeline: buildTimeline(report.status),
        details: {
          first_name: report.first_name,
          last_name: report.last_name,
          approximate_age: report.approximate_age,
          last_known_location: report.last_known_location,
          photo_path: report.photo_path,
        },
      },
    });
  } catch (error) {
    console.error('✖  Track report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
}

module.exports = { trackReport };
