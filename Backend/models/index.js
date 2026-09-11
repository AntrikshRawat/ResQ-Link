// ============================================================================
// models/index.js — Model Registry & Association Setup
// ============================================================================
const sequelize = require('../config/database');

// ── Import models ───────────────────────────────────────────────────────────
const Report = require('./Report');
const MasterPerson = require('./MasterPerson');
const MatchCandidate = require('./MatchCandidate');
const User = require('./User');

// ── Associations ────────────────────────────────────────────────────────────

// MatchCandidate → Report (source)
// "A MatchCandidate belongs to a source Report"
MatchCandidate.belongsTo(Report, {
  foreignKey: 'source_report_id',
  as: 'sourceReport',
  onDelete: 'CASCADE',
});

// MatchCandidate → Report (target)
// "A MatchCandidate belongs to a target Report"
MatchCandidate.belongsTo(Report, {
  foreignKey: 'target_report_id',
  as: 'targetReport',
  onDelete: 'CASCADE',
});

// Report → MatchCandidate (inverse — one report can appear in many matches)
Report.hasMany(MatchCandidate, {
  foreignKey: 'source_report_id',
  as: 'matchesAsSource',
});

Report.hasMany(MatchCandidate, {
  foreignKey: 'target_report_id',
  as: 'matchesAsTarget',
});

// User → Report
User.hasMany(Report, {
  foreignKey: 'user_id',
  as: 'reports',
  onDelete: 'SET NULL',
});

Report.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// ── Export everything ───────────────────────────────────────────────────────
module.exports = {
  sequelize,
  Report,
  MasterPerson,
  MatchCandidate,
  User,
};
