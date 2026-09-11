// ============================================================================
// lib/api.js — Central API Client
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/**
 * Base URL of the backend server (without /api/v1).
 * Used for resolving static assets like uploaded photos.
 * Example: `${BACKEND_URL}/${report.photo_path}`
 */
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

/**
 * Generic fetch wrapper with error handling.
 * Extracts the server's error message from the JSON response body when possible.
 * @param {string} endpoint - API path (e.g. "/intake/report")
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} parsed JSON response
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: {
      ...(options.body instanceof FormData
        ? {} // Let browser set multipart boundary
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    // Network-level failure (server down, CORS, DNS, etc.)
    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!response.ok) {
    // Try to extract the backend's error message
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.message ||
      errorBody?.errors?.join(", ") ||
      `HTTP ${response.status}: ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  return response.json();
}

// ── Report Endpoints ────────────────────────────────────────────────────────

/** Submit a new report (missing or rescued). Accepts FormData for photo upload. */
export async function createReport(formData) {
  return apiFetch("/intake/report", {
    method: "POST",
    body: formData,
  });
}

/** Fetch a report's status and timeline by tracking code */
export async function getReportByTrackingCode(code) {
  return apiFetch(`/track/${code}`);
}

// ── Match Candidate Endpoints ───────────────────────────────────────────────

/**
 * Fetch match candidates for triage.
 * @param {{ minScore?: number, limit?: number, status?: string }} params
 */
export async function getMatchCandidates(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/matching/candidates${query ? `?${query}` : ""}`);
}

/** Fetch a single match candidate by ID */
export async function getMatchCandidate(id) {
  return apiFetch(`/matching/candidates/${id}`);
}

/** Fetch triage statistics (pending, approved, dismissed counts) */
export async function getTriageStats() {
  return apiFetch("/matching/stats");
}

/**
 * Approve or dismiss a match candidate (HITL verification).
 * @param {string} candidateId - UUID of the MatchCandidate
 * @param {"APPROVE" | "DISMISS"} decision
 */
export async function verifyMatch(candidateId, decision) {
  return apiFetch("/matching/verify", {
    method: "POST",
    body: JSON.stringify({
      candidate_id: candidateId,
      decision,
    }),
  });
}

// ── Master Person Endpoints ─────────────────────────────────────────────────

/** Fetch all master person records */
export async function getMasterPersons(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/persons${query ? `?${query}` : ""}`);
}

/** Fetch a single master person by ID */
export async function getMasterPerson(id) {
  return apiFetch(`/persons/${id}`);
}

// ── Metrics ─────────────────────────────────────────────────────────────────

/** Fetch dashboard metrics (counts) */
export async function getMetrics() {
  return apiFetch("/metrics");
}
