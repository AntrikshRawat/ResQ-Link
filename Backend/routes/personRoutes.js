// ============================================================================
// Routes: /api/v1/persons and /api/v1/records
// ============================================================================
const express = require('express');
const router = express.Router();

const {
  getMasterPersons,
  getMasterPersonById,
} = require('../controllers/personController');

// GET /api/v1/persons (or /api/v1/records)
router.get('/', getMasterPersons);

// GET /api/v1/persons/:id (or /api/v1/records/:id)
router.get('/:id', getMasterPersonById);

module.exports = router;
