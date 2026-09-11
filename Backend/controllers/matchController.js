// ============================================================================
// Controller: Match Verification — Atomic HITL Merge Engine
// ============================================================================
const sequelize = require('../config/database');
const { MatchCandidate, Report, MasterPerson } = require('../models');

/**
 * POST /api/v1/matching/verify
 *
 * Processes a human-in-the-loop decision on a MatchCandidate.
 * - DISMISS → marks the candidate as dismissed.
 * - APPROVE → merges both reports into a new MasterPerson record,
 *   marks reports as RESOLVED_LOCATED, all inside an atomic transaction.
 */
async function verifyMatch(req, res) {
  const { candidate_id, decision } = req.body;

  // ── Input validation ────────────────────────────────────────────────────
  if (!candidate_id || !decision) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: candidate_id and decision are required.',
    });
  }

  if (!['APPROVE', 'DISMISS'].includes(decision)) {
    return res.status(400).json({
      success: false,
      message: "Invalid decision. Must be 'APPROVE' or 'DISMISS'.",
    });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      // ── 1. Fetch the candidate with both associated reports ───────────
      const candidate = await MatchCandidate.findByPk(candidate_id, {
        include: [
          { model: Report, as: 'sourceReport' },
          { model: Report, as: 'targetReport' },
        ],
        transaction: t,
      });

      if (!candidate) {
        const err = new Error(`MatchCandidate not found: ${candidate_id}`);
        err.statusCode = 404;
        throw err;
      }

      // ── 2. Handle DISMISS ─────────────────────────────────────────────
      if (decision === 'DISMISS') {
        candidate.status = 'DISMISSED';
        await candidate.save({ transaction: t });

        return { dismissed: true };
      }

      // ── 3. Handle APPROVE — atomic merge ──────────────────────────────
      const { sourceReport, targetReport } = candidate;

      // 3a. Update the candidate status
      candidate.status = 'APPROVED';
      await candidate.save({ transaction: t });

      // 3b. Mark both reports as resolved
      sourceReport.status = 'RESOLVED_LOCATED';
      targetReport.status = 'RESOLVED_LOCATED';

      await sourceReport.save({ transaction: t });
      await targetReport.save({ transaction: t });

      // 3c. Create the unified MasterPerson record
      const masterPerson = await MasterPerson.create(
        {
          canonical_first_name: sourceReport.first_name,
          canonical_last_name: sourceReport.last_name,
          confirmed_status: 'SHELTERED',
          current_facility: targetReport.last_known_location,
          primary_photo_path: sourceReport.photo_path || targetReport.photo_path || null,
          merged_report_ids: [sourceReport.id, targetReport.id],
        },
        { transaction: t }
      );

      return { dismissed: false, masterPerson };
    });

    // ── 4. Return the appropriate response ──────────────────────────────
    if (result.dismissed) {
      return res.status(200).json({
        success: true,
        message: 'Match candidate dismissed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Match approved. Reports merged into a unified person record.',
      data: {
        master_person_id: result.masterPerson.id,
      },
    });
  } catch (error) {
    console.error('✖  Match verification error:', error);

    // Surface known status codes (e.g. 404 for missing candidate)
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error.' : error.message,
    });
  }
}



/**
 * GET /api/v1/matching/candidates
 *
 * Returns match candidates for the triage console.
 * Supports optional query params:
 *   - minScore (default 0.60) — minimum composite_score filter
 *   - limit    (default 20)   — max rows returned
 *   - status   (default PENDING_REVIEW, or ALL / APPROVED / DISMISSED)
 */
async function getCandidates(req, res) {
  try {
    const { Op } = require('sequelize');
    const minScore = req.query.minScore !== undefined ? parseFloat(req.query.minScore) : 0.60;
    const limit = parseInt(req.query.limit, 10) || 20;
    const statusParam = req.query.status ? req.query.status.toUpperCase() : 'PENDING_REVIEW';

    const where = {};
    if (statusParam !== 'ALL') {
      where.status = statusParam;
    }
    if (!isNaN(minScore) && minScore > 0) {
      where.composite_score = { [Op.gte]: minScore };
    }

    const reportAttributes = [
      'id',
      'tracking_code',
      'first_name',
      'last_name',
      'approximate_age',
      'gender',
      'photo_path',
      'last_known_location',
      'distinguishing_marks',
      'clothing_description',
      'report_type',
      'source_channel',
      'status',
      'createdAt',
    ];

    const candidates = await MatchCandidate.findAll({
      where,
      include: [
        {
          model: Report,
          as: 'sourceReport',
          attributes: reportAttributes,
        },
        {
          model: Report,
          as: 'targetReport',
          attributes: reportAttributes,
        },
      ],
      order: [['composite_score', 'DESC']],
      limit,
    });

    return res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    console.error('✖  Get candidates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching match candidates.',
    });
  }
}

/**
 * GET /api/v1/matching/candidates/:id
 *
 * Returns a single match candidate by ID with associated reports.
 */
async function getCandidateById(req, res) {
  try {
    const { id } = req.params;

    const reportAttributes = [
      'id',
      'tracking_code',
      'first_name',
      'last_name',
      'approximate_age',
      'gender',
      'photo_path',
      'last_known_location',
      'distinguishing_marks',
      'clothing_description',
      'report_type',
      'source_channel',
      'status',
      'createdAt',
    ];

    const candidate = await MatchCandidate.findByPk(id, {
      include: [
        {
          model: Report,
          as: 'sourceReport',
          attributes: reportAttributes,
        },
        {
          model: Report,
          as: 'targetReport',
          attributes: reportAttributes,
        },
      ],
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: `Match candidate not found with ID: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    console.error('✖  Get candidate by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching candidate.',
    });
  }
}

/**
 * GET /api/v1/matching/stats
 *
 * Returns summary statistics for triage decisions.
 */
async function getTriageStats(req, res) {
  try {
    const [pending, approved, dismissed, total] = await Promise.all([
      MatchCandidate.count({ where: { status: 'PENDING_REVIEW' } }),
      MatchCandidate.count({ where: { status: 'APPROVED' } }),
      MatchCandidate.count({ where: { status: 'DISMISSED' } }),
      MatchCandidate.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        dismissed,
      },
    });
  } catch (error) {
    console.error('✖  Get triage stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching triage stats.',
    });
  }
}

/**
 * DELETE /api/v1/matching/candidates/:id
 *
 * Deletes a match candidate from the triage console.
 */
async function deleteCandidate(req, res) {
  try {
    const { id } = req.params;
    const candidate = await MatchCandidate.findByPk(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: `Match candidate not found with ID: ${id}`,
      });
    }

    await candidate.destroy();

    return res.status(200).json({
      success: true,
      message: 'Match candidate deleted successfully.',
    });
  } catch (error) {
    console.error('✖  Delete candidate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting match candidate.',
    });
  }
}

/**
 * POST /api/v1/matching/evaluate
 *
 * Evaluates multimodal profile matching of two persons' data
 * via the AI sidecar service (/api/v1/evaluate-match).
 *
 * Accepts either:
 * 1) DB Report IDs: { reportAId: "...", reportBId: "..." }
 * 2) Raw profile payloads: { reportA: { firstName, ... }, reportB: { firstName, ... } }
 */
async function evaluatePersons(req, res) {
  try {
    const { evaluateTwoProfiles } = require('../services/scoringService');
    const { reportAId, reportBId, reportA, reportB } = req.body;

    let candidateA = null;
    let candidateB = null;

    if (reportAId && reportBId) {
      const [foundA, foundB] = await Promise.all([
        Report.findByPk(reportAId),
        Report.findByPk(reportBId),
      ]);

      if (!foundA || !foundB) {
        return res.status(404).json({
          success: false,
          message: `One or both reports not found. (reportAId: ${reportAId}, reportBId: ${reportBId})`,
        });
      }

      candidateA = foundA;
      candidateB = foundB;
    } else if (reportA && reportB) {
      candidateA = reportA;
      candidateB = reportB;
    } else {
      return res.status(400).json({
        success: false,
        message:
          'Please provide either (reportAId and reportBId) or (reportA and reportB) in request body.',
      });
    }

    const evaluation = await evaluateTwoProfiles(candidateA, candidateB);

    return res.status(200).json({
      success: true,
      message: 'Profile match evaluated successfully via AI service.',
      data: evaluation,
    });
  } catch (error) {
    console.error('✖  Profile evaluation error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Failed to evaluate profile matching.',
    });
  }
}

/**
 * GET /api/v1/matching/ai-health
 *
 * Pings the AI FastAPI service /health endpoint to check status.
 */
async function getAiHealth(req, res) {
  try {
    const { checkAiHealth } = require('../services/scoringService');
    const health = await checkAiHealth();

    return res.status(health.online ? 200 : 503).json({
      success: health.online,
      ai_service: health.online ? 'healthy' : 'unavailable',
      data: health.data || null,
      error: health.error || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /api/v1/matching/trigger/:reportId
 * POST /api/v1/matching/run/:reportId
 *
 * Manually triggers the coarse filter + AI matching pipeline for a report.
 */
async function triggerReportMatching(req, res) {
  try {
    const { findMatchesForReport } = require('../services/matchingOrchestrator');
    const { reportId } = req.params;

    const result = await findMatchesForReport(reportId);

    return res.status(200).json({
      success: true,
      message: `Matching process executed for report ${reportId}.`,
      data: result,
    });
  } catch (error) {
    console.error('✖  Trigger matching error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to execute matching for report.',
    });
  }
}

module.exports = {
  verifyMatch,
  getCandidates,
  getCandidateById,
  getTriageStats,
  deleteCandidate,
  evaluatePersons,
  evaluateProfiles: evaluatePersons,
  getAiHealth,
  triggerReportMatching,
  triggerMatching: triggerReportMatching,
};


