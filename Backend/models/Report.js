// ============================================================================
// Model: Report (table: reports)
// ============================================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define(
  'Report',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    report_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['MISSING', 'RESCUED', 'HOSPITAL_PATIENT', 'UNIDENTIFIED_BODY']],
      },
    },
    source_channel: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['RELIEF_CAMP', 'HOSPITAL', 'PUBLIC_PORTAL', 'CALL_HELPLINE']],
      },
    },
    is_verified_source: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approximate_age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']],
      },
    },
    distinguishing_marks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clothing_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_known_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photo_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tracking_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    is_minor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'UNMATCHED',
      validate: {
        isIn: [['UNMATCHED', 'PENDING_VERIFICATION', 'RESOLVED_LOCATED', 'CLOSED']],
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    tableName: 'reports',
    timestamps: true,
    indexes: [
      // ── B‑tree indexes ────────────────────────────────────────────────
      {
        name: 'idx_reports_tracking_code',
        fields: ['tracking_code'],
      },
      {
        name: 'idx_reports_status',
        fields: ['status'],
      },
      {
        name: 'idx_reports_user_id',
        fields: ['user_id'],
      },

      // ── GIN trigram indexes (require pg_trgm extension) ───────────────
      // These enable fast ILIKE / similarity() / % queries for fuzzy match.
      // NOTE: You must run  CREATE EXTENSION IF NOT EXISTS pg_trgm;
      //       before syncing the models.
      {
        name: 'idx_reports_first_name_trgm',
        fields: [sequelize.literal('first_name gin_trgm_ops')],
        using: 'GIN',
      },
      {
        name: 'idx_reports_last_name_trgm',
        fields: [sequelize.literal('last_name gin_trgm_ops')],
        using: 'GIN',
      },
      {
        name: 'idx_reports_distinguishing_marks_trgm',
        fields: [sequelize.literal('distinguishing_marks gin_trgm_ops')],
        using: 'GIN',
      },
    ],
  }
);

module.exports = Report;
