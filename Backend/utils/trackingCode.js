// ============================================================================
// Utility: Tracking Code Generator
// ============================================================================
const crypto = require('crypto');
const { Report } = require('../models');

/**
 * Generates a random 4-character alphanumeric string (uppercase).
 * Uses crypto.randomBytes for better randomness than Math.random().
 */
function randomAlphanumeric(length = 4) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

/**
 * Generates a unique tracking code in the format `TRK-XXXX`.
 * Checks the database to guarantee uniqueness before returning.
 *
 * @param {number} [maxAttempts=10] - Safety limit to avoid infinite loops.
 * @returns {Promise<string>} A unique tracking code.
 * @throws {Error} If a unique code cannot be generated within maxAttempts.
 */
async function generateTrackingCode(maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = `TRK-${randomAlphanumeric(4)}`;

    const existing = await Report.findOne({
      where: { tracking_code: code },
      attributes: ['id'],
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error(
    `Failed to generate a unique tracking code after ${maxAttempts} attempts`
  );
}

module.exports = { generateTrackingCode };
