// ============================================================================
// Controller: System Metrics / Stats Overview
// ============================================================================
const { Report, MasterPerson, MatchCandidate } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/v1/metrics
 * Returns real-time aggregate statistics for the dashboard ticker
 */
async function getMetrics(req, res) {
  try {
    const [
      totalReports,
      peopleMatched,
      activeSearches,
      familiesReunited,
    ] = await Promise.all([
      Report.count(),
      MasterPerson.count(),
      Report.count({
        where: {
          status: {
            [Op.in]: ['UNMATCHED', 'PENDING_VERIFICATION'],
          },
        },
      }),
      MasterPerson.count({
        where: {
          confirmed_status: 'REUNITED',
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total_reports: totalReports,
        people_matched: peopleMatched,
        active_searches: activeSearches,
        families_reunited: familiesReunited,
      },
    });
  } catch (error) {
    console.error('✖  Get metrics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching metrics.',
    });
  }
}

module.exports = { getMetrics };
