// ============================================================================
// Model: MasterPerson (table: master_persons)
// ============================================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MasterPerson = sequelize.define(
  'MasterPerson',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    canonical_first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    canonical_last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    confirmed_status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['SHELTERED', 'HOSPITALIZED', 'REUNITED', 'DECEASED']],
      },
    },
    current_facility: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    primary_photo_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merged_report_ids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    tableName: 'master_persons',
    timestamps: true,
  }
);

module.exports = MasterPerson;
