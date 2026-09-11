// ============================================================================
// Model: MatchCandidate (table: match_candidates)
// ============================================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchCandidate = sequelize.define(
  'MatchCandidate',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    source_report_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'reports',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    target_report_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'reports',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    composite_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    face_similarity_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    phonetic_similarity_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    discrepancy_summary: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'PENDING_REVIEW',
      validate: {
        isIn: [['PENDING_REVIEW', 'APPROVED', 'DISMISSED']],
      },
    },
    reviewed_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'match_candidates',
    timestamps: true,
    indexes: [
      // Composite B‑tree: status + composite_score DESC — useful for
      // paginated queries like "show me the top pending matches".
      {
        name: 'idx_match_candidates_status_score',
        fields: [
          'status',
          { attribute: 'composite_score', order: 'DESC' },
        ],
      },
      // Foreign‑key indexes for fast JOINs and cascading deletes
      {
        name: 'idx_match_candidates_source_report',
        fields: ['source_report_id'],
      },
      {
        name: 'idx_match_candidates_target_report',
        fields: ['target_report_id'],
      },
    ],
  }
);

module.exports = MatchCandidate;
