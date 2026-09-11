// ============================================================================
// Service: Scoring Service — AI Sidecar Dispatch & Fallback
// ============================================================================
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const AI_SIDECAR_URL =
  process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/api/v1/evaluate-match';
const AI_HEALTH_URL =
  process.env.AI_HEALTH_URL || 'http://127.0.0.1:8000/health';
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS, 10) || 10000;

/**
 * Resolves an image path string to an accessible file path.
 * Checks absolute path, backend root relative, and uploads folder relative.
 *
 * @param {string|null} rawPath
 * @returns {string|null} Resolved file path or original string/null
 */
function resolvePhotoPath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return null;

  try {
    // 1. Direct absolute path check
    if (path.isAbsolute(rawPath) && fs.existsSync(rawPath)) {
      return path.resolve(rawPath);
    }

    // 2. Relative to backend directory (e.g., "uploads/123.jpg")
    const backendResolved = path.resolve(__dirname, '..', rawPath);
    if (fs.existsSync(backendResolved)) {
      return backendResolved;
    }

    // 3. Relative to backend uploads directory (e.g., "123.jpg")
    const uploadsResolved = path.resolve(__dirname, '..', 'uploads', rawPath);
    if (fs.existsSync(uploadsResolved)) {
      return uploadsResolved;
    }

    // 4. Return original if no file found locally
    return rawPath;
  } catch (err) {
    return rawPath;
  }
}

/**
 * Formats a report or profile object into the ReportCandidateInput schema
 * required by the FastAPI AI service.
 *
 * @param {object} report - Sequelize model or plain object
 * @returns {object} Formatted candidate object matching FastAPI schema
 */
function formatReportCandidate(report) {
  if (!report) {
    throw new Error('Report data is required for matching evaluation.');
  }

  const raw = typeof report.toJSON === 'function' ? report.toJSON() : report;

  const firstName = (raw.first_name || raw.firstName || '').trim();
  const lastName = (raw.last_name || raw.lastName || '').trim() || null;
  const age =
    raw.approximate_age !== undefined && raw.approximate_age !== null
      ? Number(raw.approximate_age)
      : raw.approximateAge !== undefined && raw.approximateAge !== null
      ? Number(raw.approximateAge)
      : null;

  return {
    id: raw.id ? String(raw.id) : undefined,
    firstName: firstName || 'Unknown',
    lastName: lastName,
    approximateAge: isNaN(age) ? null : age,
    distinguishingMarks: raw.distinguishing_marks || raw.distinguishingMarks || null,
    clothingDescription: raw.clothing_description || raw.clothingDescription || null,
    photoPath: resolvePhotoPath(raw.photo_path || raw.photoPath),
  };
}

/**
 * Dispatches a match evaluation request to the Python AI sidecar.
 * Evaluates face, phonetic, demographic, and physical marks similarity.
 * Falls back to degraded text-only score if the sidecar is unavailable.
 *
 * @param {object} sourceReport - The report being searched for.
 * @param {object} targetReport - A potential match report from the database.
 * @param {number} dbTrigramScore - The pg_trgm similarity score from coarse filter query.
 * @returns {Promise<object>} Scoring result with composite_score, component scores, and discrepancy_summary.
 */
async function evaluateMatch(sourceReport, targetReport, dbTrigramScore = 0) {
  try {
    const reportA = formatReportCandidate(sourceReport);
    const reportB = formatReportCandidate(targetReport);

    const payload = { reportA, reportB };

    const response = await axios.post(AI_SIDECAR_URL, payload, {
      timeout: AI_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    });

    const {
      compositeScore,
      faceSimilarity,
      phoneticSimilarity,
      demographicScore,
      marksScore,
      isEligibleForReview,
      isDegradedTextOnly,
      faceDetectedA,
      faceDetectedB,
      phoneticKeysA,
      phoneticKeysB,
      ageDelta,
      discrepancies,
    } = response.data;

    const discrepancy_summary = {
      mode: isDegradedTextOnly ? 'AI_TEXT_ONLY' : 'AI_MULTIMODAL',
      face_detected_a: faceDetectedA,
      face_detected_b: faceDetectedB,
      phonetic_keys_a: phoneticKeysA,
      phonetic_keys_b: phoneticKeysB,
      age_delta: ageDelta,
      demographic_score: demographicScore,
      marks_score: marksScore,
      is_eligible_for_review: isEligibleForReview,
      is_degraded_text_only: isDegradedTextOnly,
      db_trigram_score: dbTrigramScore,
      ...(discrepancies || {}),
    };

    return {
      composite_score: compositeScore,
      face_similarity_score: faceSimilarity,
      phonetic_similarity_score: phoneticSimilarity,
      demographic_score: demographicScore,
      marks_score: marksScore,
      is_eligible_for_review: isEligibleForReview,
      is_degraded_text_only: isDegradedTextOnly,
      discrepancy_summary,
      raw_ai_response: response.data,
    };
  } catch (error) {
    const isTimeout =
      error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

    console.warn(
      `⚠  AI sidecar ${isTimeout ? 'timed out' : 'failed'}: ${error.message}. ` +
        'Falling back to degraded text-only scoring.'
    );

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
      demographic_score: null,
      marks_score: null,
      is_eligible_for_review: degradedComposite >= 0.60,
      is_degraded_text_only: true,
      discrepancy_summary,
    };
  }
}

/**
 * Direct evaluation helper for two arbitrary person profiles.
 * Can be used by API controllers or testing tools to compare any two profiles.
 *
 * @param {object} profileA - First person profile
 * @param {object} profileB - Second person profile
 * @returns {Promise<object>} Complete evaluation response
 */
async function evaluateTwoProfiles(profileA, profileB) {
  const reportA = formatReportCandidate(profileA);
  const reportB = formatReportCandidate(profileB);

  const payload = { reportA, reportB };

  const response = await axios.post(AI_SIDECAR_URL, payload, {
    timeout: AI_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
}

/**
 * Checks connectivity and health of the AI matching sidecar.
 *
 * @returns {Promise<object>} Health status
 */
async function checkAiHealth() {
  try {
    const response = await axios.get(AI_HEALTH_URL, { timeout: 3000 });
    return {
      online: true,
      data: response.data,
    };
  } catch (error) {
    return {
      online: false,
      error: error.message,
    };
  }
}

module.exports = {
  evaluateMatch,
  evaluateTwoProfiles,
  checkAiHealth,
  formatReportCandidate,
  resolvePhotoPath,
};
