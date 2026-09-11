// ============================================================================
// Service: Matching Orchestrator — Trigram Filtering & Candidate Creation
// ============================================================================
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const { Report, MatchCandidate } = require('../models');
const { evaluateMatch } = require('./scoringService');

// Minimum composite score required to persist a MatchCandidate
const COMPOSITE_THRESHOLD = 0.60;

// pg_trgm similarity threshold used in the coarse filter
const TRIGRAM_THRESHOLD = 0.3;

/**
 * Maps a report type to the set of "opposite" types it should match against.
 *
 * MISSING reports match against reports of found/identified people.
 * Found/identified reports match against MISSING reports.
 */
function getOppositeTypes(reportType) {
  if (reportType === 'MISSING') {
    return ['RESCUED', 'HOSPITAL_PATIENT', 'UNIDENTIFIED_BODY'];
  }
  // For RESCUED, HOSPITAL_PATIENT, UNIDENTIFIED_BODY → match against MISSING
  return ['MISSING'];
}

/**
 * Finds potential matches for a given report, scores them via the AI sidecar
 * (or fallback), and persists qualifying MatchCandidate records.
 *
 * @param {string} reportId - UUID of the report to find matches for.
 * @returns {Promise<object>} Summary of matching results.
 */
async function findMatchesForReport(reportId) {
  try {
    // ── 1. Fetch the source report ──────────────────────────────────────
    const sourceReport = await Report.findByPk(reportId);

    if (!sourceReport) {
      throw new Error(`Report not found: ${reportId}`);
    }

    // ── 2. Determine which report types to search ───────────────────────
    const oppositeTypes = getOppositeTypes(sourceReport.report_type);

    // ── 3. Coarse trigram filtering via raw SQL ─────────────────────────
    //    Uses pg_trgm's similarity() on first_name and last_name.
    //    Returns rows where either name column exceeds the threshold.
    const potentialMatches = await sequelize.query(
      `
      SELECT
        r.*,
        GREATEST(
          similarity(r.first_name, :firstName),
          COALESCE(similarity(r.last_name, :lastName), 0)
        ) AS trigram_score
      FROM reports r
      WHERE r.id != :reportId
        AND r.report_type IN (:oppositeTypes)
        AND (
          similarity(r.first_name, :firstName) > :threshold
          OR similarity(r.last_name, :lastName) > :threshold
        )
      ORDER BY trigram_score DESC
      `,
      {
        replacements: {
          reportId,
          firstName: sourceReport.first_name,
          lastName: sourceReport.last_name || '',
          oppositeTypes,
          threshold: TRIGRAM_THRESHOLD,
        },
        type: QueryTypes.SELECT,
      }
    );

    console.log(
      `ℹ  Found ${potentialMatches.length} trigram candidate(s) for report ${reportId}`
    );

    // ── 4. Score each candidate and persist qualifying matches ──────────
    const createdCandidates = [];

    for (const match of potentialMatches) {
      const trigramScore = parseFloat(match.trigram_score);

      const scoringResult = await evaluateMatch(
        sourceReport,
        match,
        trigramScore
      );

      // Only persist candidates that meet the composite threshold
      if (scoringResult.composite_score >= COMPOSITE_THRESHOLD) {
        const candidate = await MatchCandidate.create({
          source_report_id: reportId,
          target_report_id: match.id,
          composite_score: scoringResult.composite_score,
          face_similarity_score: scoringResult.face_similarity_score,
          phonetic_similarity_score: scoringResult.phonetic_similarity_score,
          discrepancy_summary: scoringResult.discrepancy_summary,
          status: 'PENDING_REVIEW',
        });

        createdCandidates.push(candidate);
      }
    }

    console.log(
      `✔  Created ${createdCandidates.length} match candidate(s) for report ${reportId}`
    );

    return {
      reportId,
      candidatesEvaluated: potentialMatches.length,
      candidatesCreated: createdCandidates.length,
      candidates: createdCandidates,
    };
  } catch (error) {
    console.error(`✖  Matching orchestrator error for report ${reportId}:`, error);
    throw error;
  }
}

module.exports = { findMatchesForReport };
