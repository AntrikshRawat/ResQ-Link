// ============================================================================
// Service: Scoring Service — AI Sidecar Dispatch & Fallback
// ============================================================================
const axios = require('axios');

const AI_SIDECAR_URL = 'http://localhost:8000/api/v1/evaluate-match';
const AI_TIMEOUT_MS = 2000;

/**
 * Dispatches a match evaluation request to the Python AI sidecar.
 * Falls back to a degraded text-only score if the sidecar is unavailable.
 *
 * @param {object} sourceReport - The report being searched for (Sequelize instance or plain object).
 * @param {object} targetReport - A potential match report from the database.
 * @param {number} dbTrigramScore - The pg_trgm similarity score from the coarse filter query.
 * @returns {Promise<object>} Scoring result with composite_score, component scores, and discrepancy_summary.
 */
async function evaluateMatch(sourceReport, targetReport, dbTrigramScore) {
  try {
    // ── Build the payload for the AI sidecar ────────────────────────────
    const payload = {
      source: {
        photo_path: sourceReport.photo_path || null,
        first_name: sourceReport.first_name,
        last_name: sourceReport.last_name || null,
        approximate_age: sourceReport.approximate_age,
      },
      target: {
        photo_path: targetReport.photo_path || null,
        first_name: targetReport.first_name,
        last_name: targetReport.last_name || null,
        approximate_age: targetReport.approximate_age,
      },
    };

    // ── Dispatch to AI sidecar with strict timeout ──────────────────────
    const response = await axios.post(AI_SIDECAR_URL, payload, {
      timeout: AI_TIMEOUT_MS,
    });

    const {
      composite_score,
      face_similarity,
      demographic_similarity,
      has_face,
    } = response.data;

    // ── Build discrepancy summary from the AI response ──────────────────
    const discrepancy_summary = {
      mode: 'AI_FULL',
      face_similarity,
      demographic_similarity,
      has_face,
      db_trigram_score: dbTrigramScore,
    };

    return {
      composite_score,
      face_similarity_score: face_similarity,
      phonetic_similarity_score: demographic_similarity,
      discrepancy_summary,
    };
  } catch (error) {
    // ── Fallback: degraded text-only scoring ─────────────────────────────
    const isTimeout =
      error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

    console.warn(
      `⚠  AI sidecar ${isTimeout ? 'timed out' : 'failed'}: ${error.message}. ` +
        'Falling back to degraded text-only scoring.'
    );

    // Degraded composite score derived solely from the trigram similarity.
    // We cap it at 0.85 so a text-only match can never outrank an AI-scored one.
    const degradedComposite = Math.min(dbTrigramScore * 0.9, 0.85);

    const discrepancy_summary = {
      mode: 'DEGRADED_TEXT_ONLY',
      reason: isTimeout ? 'AI_SIDECAR_TIMEOUT' : 'AI_SIDECAR_ERROR',
      error_message: error.message,
      db_trigram_score: dbTrigramScore,
    };

    return {
      composite_score: parseFloat(degradedComposite.toFixed(4)),
      face_similarity_score: null,
      phonetic_similarity_score: dbTrigramScore,
      discrepancy_summary,
    };
  }
}

module.exports = { evaluateMatch };
