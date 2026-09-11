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

  // Automatically attach auth token if present in browser storage
  let token = null;
  if (typeof window !== "undefined") {
    try {
      token = localStorage.getItem("resqlink_token");
    } catch (e) {
      // Ignore localStorage access issues
    }
  }

  const config = {
    headers: {
      ...(options.body instanceof FormData
        ? {} // Let browser set multipart boundary
        : { "Content-Type": "application/json" }),
      ...(token && !options.headers?.Authorization
        ? { Authorization: `Bearer ${token}` }
        : {}),
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

// ── Authentication Endpoints ────────────────────────────────────────────────

/**
 * Register a new normal user account.
 * @param {{ full_name: string, email: string, password: string }} data
 */
export async function signupUser(data) {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Login for normal users or administrators.
 * @param {{ email: string, password: string }} data
 */
export async function loginUser(data) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Dedicated login for administrators only (rejects normal users).
 * @param {{ email: string, password: string }} data
 */
export async function loginAdmin(data) {
  return apiFetch("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Fetch currently authenticated user profile using token.
 * @param {string} token
 */
export async function getCurrentUser(token) {
  return apiFetch("/auth/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
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

/** Fetch all reports filed by the currently authenticated user */
export async function getUserReports() {
  return apiFetch("/intake/my-reports");
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

/**
 * Delete a match candidate from triage console.
 * @param {string} candidateId - UUID of the MatchCandidate
 */
export async function deleteMatchCandidate(candidateId) {
  return apiFetch(`/matching/candidates/${candidateId}`, {
    method: "DELETE",
  });
}

// ── Master Person / Records Endpoints ─────────────────────────────────────────

/** Fetch all master person and report records */
export async function getMasterPersons(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/persons${query ? `?${query}` : ""}`);
}

/** Fetch a single master person or report by ID */
export async function getMasterPerson(id) {
  return apiFetch(`/persons/${id}`);
}

/**
 * Delete a record (MasterPerson or Report) by ID.
 * @param {string} id - UUID of the record
 */
export async function deleteRecord(id) {
  return apiFetch(`/persons/${id}`, {
    method: "DELETE",
  });
}

// ── Metrics ─────────────────────────────────────────────────────────────────

/** Fetch dashboard metrics (counts) */
export async function getMetrics() {
  return apiFetch("/metrics");
}
