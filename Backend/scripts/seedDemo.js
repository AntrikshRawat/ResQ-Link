// ============================================================================
// Script: seedDemo.js — Populate the database with sample data for testing
// ============================================================================
//
// Usage:  node scripts/seedDemo.js
//
// Creates:
//   1. A MISSING report  (Arun Kumar)
//   2. A RESCUED report  (Aroon Kumaar — phonetic variation)
//   3. A MatchCandidate linking them (composite_score: 0.89)
//
// Logs the tracking codes so you can immediately test:
//   GET /api/v1/track/:trackingCode
//   GET /api/v1/matching/candidates
// ============================================================================
const sequelize = require('../config/database');
const { Report, MatchCandidate } = require('../models');
const { generateTrackingCode } = require('../utils/trackingCode');

async function seed() {
  try {
    // Ensure DB connection & schema are up to date
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    await sequelize.sync({ alter: true });
    console.log('✔  Database synced\n');

    // ── 1. MISSING report ─────────────────────────────────────────────────
    const missingCode = await generateTrackingCode();
    const missingReport = await Report.create({
      report_type: 'MISSING',
      source_channel: 'PUBLIC_PORTAL',
      first_name: 'Arun',
      last_name: 'Kumar',
      approximate_age: 28,
      gender: 'MALE',
      distinguishing_marks: 'Small scar above left eyebrow',
      clothing_description: 'Blue denim jacket, dark trousers',
      last_known_location: 'Sector 4, Block B — near community hall',
      tracking_code: missingCode,
      is_minor: false,
    });
    console.log(`📋  MISSING report created`);
    console.log(`    Name:           Arun Kumar`);
    console.log(`    Tracking Code:  ${missingCode}`);
    console.log(`    ID:             ${missingReport.id}\n`);

    // ── 2. RESCUED report (phonetic variation) ────────────────────────────
    const rescuedCode = await generateTrackingCode();
    const rescuedReport = await Report.create({
      report_type: 'RESCUED',
      source_channel: 'RELIEF_CAMP',
      first_name: 'Aroon',
      last_name: 'Kumaar',
      approximate_age: 30,
      gender: 'MALE',
      distinguishing_marks: 'Scar on forehead, left side',
      clothing_description: 'Faded blue jacket, dark pants',
      last_known_location: 'Camp Green-4 Medical Tent',
      tracking_code: rescuedCode,
      is_minor: false,
      is_verified_source: true,
    });
    console.log(`🏥  RESCUED report created`);
    console.log(`    Name:           Aroon Kumaar`);
    console.log(`    Tracking Code:  ${rescuedCode}`);
    console.log(`    ID:             ${rescuedReport.id}\n`);

    // ── 3. MatchCandidate linking them ────────────────────────────────────
    const candidate = await MatchCandidate.create({
      source_report_id: missingReport.id,
      target_report_id: rescuedReport.id,
      composite_score: 0.89,
      face_similarity_score: 0.91,
      phonetic_similarity_score: 0.95,
      discrepancy_summary: {
        mode: 'SEED_DATA',
        notes: 'Demo seed — high-confidence phonetic + face match',
        age_difference: Math.abs(missingReport.approximate_age - rescuedReport.approximate_age),
      },
      status: 'PENDING_REVIEW',
    });
    console.log(`🔗  MatchCandidate created`);
    console.log(`    Candidate ID:     ${candidate.id}`);
    console.log(`    Composite Score:  ${candidate.composite_score}`);
    console.log(`    Face Similarity:  ${candidate.face_similarity_score}`);
    console.log(`    Phonetic Score:   ${candidate.phonetic_similarity_score}`);
    console.log(`    Status:           ${candidate.status}\n`);

    // ── Summary ───────────────────────────────────────────────────────────
    console.log('─'.repeat(60));
    console.log('✔  Seed complete! Quick-test commands:\n');
    console.log(`  Track MISSING:   GET /api/v1/track/${missingCode}`);
    console.log(`  Track RESCUED:   GET /api/v1/track/${rescuedCode}`);
    console.log(`  Triage console:  GET /api/v1/matching/candidates`);
    console.log(`  Verify match:    POST /api/v1/matching/verify`);
    console.log(`                   Body: { "candidate_id": "${candidate.id}", "decision": "APPROVE" }`);
    console.log('─'.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('✖  Seed failed:', error);
    process.exit(1);
  }
}

seed();
