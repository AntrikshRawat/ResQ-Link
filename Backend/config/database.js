// ============================================================================
// Database Configuration — Sequelize + PostgreSQL
// ============================================================================
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'resqlink',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,   // Auto‑manage createdAt / updatedAt
      underscored: false,  // Keep camelCase column names
    },
  }
);

module.exports = sequelize;
