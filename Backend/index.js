// ============================================================================
// ResQ-Link — Application Entry Point
// ============================================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files — serve uploaded images ────────────────────────────────────
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
const reportRoutes = require('./routes/reportRoutes');
const matchRoutes = require('./routes/matchRoutes');
const trackRoutes = require('./routes/trackRoutes');
const personRoutes = require('./routes/personRoutes');
const metricsRoutes = require('./routes/metricsRoutes');

app.use('/api/v1/intake', reportRoutes);
app.use('/api/v1/matching', matchRoutes);
app.use('/api/v1/triage', matchRoutes); // Alias for triage console
app.use('/api/v1/track', trackRoutes);
app.use('/api/v1/persons', personRoutes); // Master person record registry
app.use('/api/v1/records', personRoutes); // Alias for record registry
app.use('/api/v1/metrics', metricsRoutes); // Dashboard metrics overview

// ── Bootstrap ───────────────────────────────────────────────────────────────
(async () => {
  try {
    // Ensure pg_trgm extension exists (required for GIN trigram indexes)
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    console.log('✔  pg_trgm extension ensured');

    // Sync all models — use { alter: true } in dev, migrations in prod
    await sequelize.sync({ alter: true });
    console.log('✔  Database synced');

    app.listen(PORT, () => {
      console.log(`✔  ResQ-Link API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('✖  Failed to start:', err);
    process.exit(1);
  }
})();

module.exports = app;
