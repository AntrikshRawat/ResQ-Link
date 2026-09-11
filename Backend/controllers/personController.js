// ============================================================================
// Controller: Master Person / Record Registry
// ============================================================================
const { Op } = require('sequelize');
const { MasterPerson, Report } = require('../models');

/**
 * GET /api/v1/persons
 * GET /api/v1/records
 *
 * Retrieves consolidated master person records for the registry.
 * Query Parameters:
 *   - search:   string (case-insensitive search in first/last name)
 *   - status:   string (SHELTERED | HOSPITALIZED | REUNITED | DECEASED)
 *   - facility: string (case-insensitive match for current_facility)
 *   - limit:    integer (default: 50)
 *   - offset:   integer (default: 0)
 */
async function getMasterPersons(req, res) {
  try {
    const { search, status, facility, limit = 50, offset = 0 } = req.query;

    const where = {};

    // Filter by confirmed_status if specified
    if (status && status.trim() !== '') {
      where.confirmed_status = status.trim().toUpperCase();
    }

    // Filter by facility if specified
    if (facility && facility.trim() !== '') {
      where.current_facility = {
        [Op.iLike]: `%${facility.trim()}%`,
      };
    }

    // Search by name if specified
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { canonical_first_name: { [Op.iLike]: term } },
        { canonical_last_name: { [Op.iLike]: term } },
      ];
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const { count, rows } = await MasterPerson.findAndCountAll({
      where,
      order: [['updatedAt', 'DESC']],
      limit: parsedLimit,
      offset: parsedOffset,
    });

    return res.status(200).json({
      success: true,
      count: rows.length,
      total: count,
      data: rows,
    });
  } catch (error) {
    console.error('✖  Get master persons error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching records.',
    });
  }
}

/**
 * GET /api/v1/persons/:id
 * GET /api/v1/records/:id
 *
 * Retrieves a single master person record by ID, including details
 * of all original reports merged into this record.
 */
async function getMasterPersonById(req, res) {
  try {
    const { id } = req.params;

    const person = await MasterPerson.findByPk(id);
    if (!person) {
      return res.status(404).json({
        success: false,
        message: `No record found with ID: ${id}`,
      });
    }

    // Fetch details of all reports merged into this person
    let mergedReports = [];
    if (person.merged_report_ids && person.merged_report_ids.length > 0) {
      mergedReports = await Report.findAll({
        where: {
          id: {
            [Op.in]: person.merged_report_ids,
          },
        },
        attributes: [
          'id',
          'tracking_code',
          'report_type',
          'source_channel',
          'first_name',
          'last_name',
          'approximate_age',
          'gender',
          'photo_path',
          'last_known_location',
          'distinguishing_marks',
          'clothing_description',
          'status',
          'createdAt',
        ],
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...person.toJSON(),
        merged_reports: mergedReports,
      },
    });
  } catch (error) {
    console.error('✖  Get master person by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching person record.',
    });
  }
}

module.exports = {
  getMasterPersons,
  getMasterPersonById,
};
