// ============================================================================
// Service: Scoring Service — AI Sidecar Dispatch & Fallback
// ============================================================================
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const AI_SIDECAR_URL =
  process.env.AI_SERVICE_URL || process.env.AI_SIDECAR_URL || 'http://localhost:8000/api/v1/evaluate-match';
const AI_HEALTH_URL =
  process.env.AI_HEALTH_URL || 'http://localhost:8000/health';
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS, 10) || 30000;

/**
 * Safely resolves photo file path to absolute filesystem path so the Python
 * AI sidecar can load and compute facial embeddings directly.
 *
 * @param {string|null} photo - relative or absolute photo path
 * @returns {string|null} verified absolute path, or null if file not found
 */
function resolvePhotoPath(photo) {
  if (!photo || typeof photo !== 'string') return null;

  try {
    // 1. Direct absolute path check
    if (path.isAbsolute(photo) && fs.existsSync(photo) && fs.statSync(photo).isFile()) {
      return photo;
    }

    // 2. Relative to Backend/ root (e.g. "uploads/123.jpg")
    const backendPath = path.resolve(__dirname, '..', photo);
    if (fs.existsSync(backendPath) && fs.statSync(backendPath).isFile()) {
      return backendPath;
    }

    // 3. Basename within Backend/uploads/ (e.g. "123.jpg" or extracted filename)
    const uploadsPath = path.resolve(__dirname, '..', 'uploads', path.basename(photo));
    if (fs.existsSync(uploadsPath) && fs.statSync(uploadsPath).isFile()) {
      return uploadsPath;
    }
  } catch (err) {
    console.warn(`[ScoringService] Could not resolve photo path "${photo}":`, err.message);
  }

  return null;
}

/**
 * Normalizes any person/report object (Sequelize model, plain object, camelCase, or snake_case)
 * to match the AI sidecar's `ReportCandidateInput` schema (AI/app/schemas/match.py).
 *
 * @param {object} report
 * @returns {object} ReportCandidateInput
 */
function formatCandidateInput(report) {
  if (!report) {
    return {
      id: null,
      firstName: '',
      lastName: null,
      approximateAge: null,
      distinguishingMarks: null,
      clothingDescription: null,
      photoPath: null,
    };
  }

  const rawAge =
    report.approximate_age !== undefined
      ? report.approximate_age
      : report.approximateAge;
  const parsedAge =
    rawAge !== null && rawAge !== undefined && !isNaN(Number(rawAge))
      ? parseInt(Number(rawAge), 10)
      : null;

  const rawPhoto = report.photo_path || report.photoPath || null;
  const resolvedPhoto = resolvePhotoPath(rawPhoto);

  return {
    id: report.id ? String(report.id) : null,
    firstName: (report.first_name || report.firstName || '').trim(),
    lastName: (report.last_name || report.lastName || null)?.trim() || null,
    approximateAge: parsedAge,
    distinguishingMarks:
      (report.distinguishing_marks || report.distinguishingMarks || null)?.trim() || null,
    clothingDescription:
      (report.clothing_description || report.clothingDescription || null)?.trim() || null,
    photoPath: resolvedPhoto,
  };
}

/**
 * Dispatches a profile matching request to the Python AI sidecar (/api/v1/evaluate-match).
 * Adheres strictly to the AI sidecar's EvaluateMatchRequest and EvaluateMatchResponse.
 * Falls back gracefully to degraded text-only scoring if the AI sidecar is offline or times out.
 *
 * @param {object} sourceReport - The source person/report record.
 * @param {object} targetReport - The target candidate person/report record.
 * @param {number} dbTrigramScore - The pg_trgm similarity score or fallback score (default: 0.50).
 * @returns {Promise<object>} Match evaluation with composite_score, component scores, and discrepancy_summary.
 */
async function evaluateMatch(sourceReport, targetReport, dbTrigramScore = 0.5) {
  const repA = formatCandidateInput(sourceReport);
  const repB = formatCandidateInput(targetReport);

  // Schema matching AI/app/schemas/match.py: EvaluateMatchRequest
  const payload = {
    reportA: repA,
    reportB: repB,
  };

  try {
    const response = await axios.post(AI_SIDECAR_URL, payload, {
      timeout: AI_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;

    // AI/app/schemas/match.py: EvaluateMatchResponse
    const compositeScore = Number(data.compositeScore ?? 0.0);
    const faceSimilarity = Number(data.faceSimilarity ?? 0.0);
    const phoneticSimilarity = Number(data.phoneticSimilarity ?? 0.0);
    const demographicScore = Number(data.demographicScore ?? 0.0);
    const marksScore = Number(data.marksScore ?? 0.0);
    const isEligibleForReview = Boolean(data.isEligibleForReview);
    const isDegradedTextOnly = Boolean(data.isDegradedTextOnly);
    const faceDetectedA = Boolean(data.faceDetectedA);
    const faceDetectedB = Boolean(data.faceDetectedB);
    const phoneticKeysA = data.phoneticKeysA || [];
    const phoneticKeysB = data.phoneticKeysB || [];
    const ageDelta = data.ageDelta ?? null;
    const discrepancies = data.discrepancies || {};

    const discrepancy_summary = {
      mode: isDegradedTextOnly ? 'AI_TEXT_ONLY' : 'AI_FULL',
      face_similarity: faceSimilarity,
      phonetic_similarity: phoneticSimilarity,
      demographic_score: demographicScore,
      marks_score: marksScore,
      is_eligible_for_review: isEligibleForReview,
      is_degraded_text_only: isDegradedTextOnly,
      face_detected_a: faceDetectedA,
      face_detected_b: faceDetectedB,
      phonetic_keys_a: phoneticKeysA,
      phonetic_keys_b: phoneticKeysB,
      age_delta: ageDelta,
      discrepancies,
      db_trigram_score: dbTrigramScore,
      ...(discrepancies || {}),
    };

    return {
      composite_score: parseFloat(compositeScore.toFixed(4)),
      face_similarity_score:
        faceDetectedA && faceDetectedB ? parseFloat(faceSimilarity.toFixed(4)) : null,
      phonetic_similarity_score: parseFloat(phoneticSimilarity.toFixed(4)),
      demographic_score: parseFloat(demographicScore.toFixed(4)),
      marks_score: parseFloat(marksScore.toFixed(4)),
      is_eligible_for_review: isEligibleForReview,
      is_degraded_text_only: isDegradedTextOnly,
      face_detected_a: faceDetectedA,
      face_detected_b: faceDetectedB,
      discrepancy_summary,
      raw_ai_response: response.data,
    };
  } catch (error) {
    const isTimeout =
      error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

    console.warn(
      `⚠  AI sidecar ${isTimeout ? 'timed out' : 'unavailable'} (${error.message}). ` +
        'Falling back to degraded text-only scoring.'
    );

    // Degraded heuristic fallback:
    // Compute age delta
    let ageDelta = null;
    let demographicScore = 0.50; // Neutral default
    if (repA.approximateAge != null && repB.approximateAge != null) {
      ageDelta = Math.abs(repA.approximateAge - repB.approximateAge);
      demographicScore = Math.max(0.0, 1.0 - ageDelta / 10.0);
    }

    // Distinguishing marks token overlap
    let marksScore = 0.0;
    if (repA.distinguishingMarks && repB.distinguishingMarks) {
      const tokensA = new Set(
        repA.distinguishingMarks.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean)
      );
      const tokensB = new Set(
        repB.distinguishingMarks.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean)
      );
      const intersection = [...tokensA].filter((t) => tokensB.has(t));
      const union = new Set([...tokensA, ...tokensB]);
      marksScore = union.size > 0 ? intersection.length / union.size : 0.0;
    }

    const trigram = typeof dbTrigramScore === 'number' ? dbTrigramScore : 0.50;

    // Standard Fallback weighting from AI README:
    // Score = 0.70 * Name + 0.20 * Age + 0.10 * Marks
    const fallbackComposite = Math.min(
      0.70 * trigram + 0.20 * demographicScore + 0.10 * marksScore,
      0.85
    );

    const discrepancy_summary = {
      mode: 'DEGRADED_TEXT_ONLY',
      reason: isTimeout ? 'AI_SIDECAR_TIMEOUT' : 'AI_SIDECAR_UNAVAILABLE',
      error_message: error.message,
      db_trigram_score: trigram,
      demographic_score: demographicScore,
      marks_score: marksScore,
      age_delta: ageDelta,
      face_detected_a: false,
      face_detected_b: false,
    };

    return {
      composite_score: parseFloat(fallbackComposite.toFixed(4)),
      face_similarity_score: null,
      phonetic_similarity_score: parseFloat(trigram.toFixed(4)),
      demographic_score: parseFloat(demographicScore.toFixed(4)),
      marks_score: parseFloat(marksScore.toFixed(4)),
      is_eligible_for_review: fallbackComposite >= 0.60,
      is_degraded_text_only: true,
      face_detected_a: false,
      face_detected_b: false,
      discrepancy_summary,
    };
  }
}

/**
 * Direct evaluation helper for profile matching of two persons' arbitrary data.
 *
 * @param {object} personA - First person profile { firstName, lastName, approximateAge, distinguishingMarks, clothingDescription, photoPath }
 * @param {object} personB - Second person profile { firstName, lastName, approximateAge, distinguishingMarks, clothingDescription, photoPath }
 * @returns {Promise<object>} Match evaluation result
 */
async function evaluateTwoPersons(personA, personB) {
  return evaluateMatch(personA, personB, 0.50);
}

/**
 * Health check ping to AI Sidecar (/health).
 *
 * @returns {Promise<object>} Health status
 */
async function checkAiHealth() {
  try {
    const res = await axios.get(AI_HEALTH_URL, { timeout: 2000 });
    return {
      online: true,
      status: res.data.status,
      service: res.data.service,
      version: res.data.version,
      device: res.data.device,
      reviewThreshold: res.data.reviewThreshold,
    };
  } catch (err) {
    return {
      online: false,
      error: err.message,
    };
  }
}

module.exports = {
  evaluateMatch,
  evaluateTwoPersons,
  evaluateTwoProfiles: evaluateTwoPersons,
  formatCandidateInput,
  checkAiHealth,
  resolvePhotoPath,
};

