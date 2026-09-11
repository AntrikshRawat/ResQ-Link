// ============================================================================
// lib/api.js — Central API Client
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/**
 * Generic fetch wrapper with error handling.
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

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || "API request failed");
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

/** Fetch a report by tracking code */
export async function getReportByTrackingCode(code) {
  return apiFetch(`/reports/track/${code}`);
}

/** Fetch all reports with optional filters */
export async function getReports(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/reports${query ? `?${query}` : ""}`);
}

// ── Match Candidate Endpoints ───────────────────────────────────────────────

/** Fetch pending match candidates for triage */
export async function getMatchCandidates(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/matches${query ? `?${query}` : ""}`);
}

/** Approve or dismiss a match candidate */
export async function updateMatchStatus(matchId, status, reviewedBy) {
  return apiFetch(`/matches/${matchId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, reviewed_by: reviewedBy }),
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
