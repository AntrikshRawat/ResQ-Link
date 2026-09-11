// ============================================================================
// Controller: Record Registry / Master Person & Report Management
// ============================================================================
const { Op } = require('sequelize');
const { MasterPerson, Report, MatchCandidate } = require('../models');

/**
 * Normalizes a category name for consistent filtering.
 */
function normalizeCategory(category) {
  if (!category) return null;
  const upper = category.trim().toUpperCase();
  if (upper === 'ALL' || upper === '') return null;
  if (upper === 'HOSPITAL_PATIENT') return 'HOSPITALIZED';
  if (upper === 'RESCUED') return 'SHELTERED';
  if (upper === 'RESOLVED_LOCATED') return 'REUNITED';
  if (upper === 'UNIDENTIFIED_BODY') return 'DECEASED';
  return upper;
}

/**
 * GET /api/v1/persons
 * GET /api/v1/records
 *
 * Retrieves all types of records in the registry:
 * - Intake Reports (MISSING, RESCUED, HOSPITAL_PATIENT, UNIDENTIFIED_BODY)
 * - Master Persons (Confirmed unified identities)
 *
 * Query Parameters:
 *   - category / status: string (MISSING | HOSPITALIZED | SHELTERED | REUNITED | DECEASED | ALL)
 *   - search:            string (case-insensitive name search)
 *   - facility:          string (case-insensitive location/facility filter)
 *   - limit:             integer (default: 100)
 *   - offset:            integer (default: 0)
 */
async function getMasterPersons(req, res) {
  try {
    const { search, status, category, facility, limit = 100, offset = 0 } = req.query;
    const targetCategory = normalizeCategory(category || status);
    const searchTerm = search ? search.trim().toLowerCase() : null;
    const facilityTerm = facility ? facility.trim().toLowerCase() : null;

    // 1. Fetch all MasterPerson records
    const masterPersons = await MasterPerson.findAll({
      order: [['updatedAt', 'DESC']],
    });

    // Collect all merged report IDs
    const mergedReportIdSet = new Set();
    masterPersons.forEach((mp) => {
      if (Array.isArray(mp.merged_report_ids)) {
        mp.merged_report_ids.forEach((id) => mergedReportIdSet.add(id));
      }
    });

    // 2. Fetch all Reports
    const reports = await Report.findAll({
      order: [['updatedAt', 'DESC']],
    });

    // 3. Map MasterPerson items to unified schema
    const unifiedMasterPersons = masterPersons.map((mp) => {
      const cat = normalizeCategory(mp.confirmed_status) || 'SHELTERED';
      return {
        id: mp.id,
        record_kind: 'MASTER_PERSON',
        canonical_first_name: mp.canonical_first_name,
        canonical_last_name: mp.canonical_last_name,
        confirmed_status: mp.confirmed_status,
        category: cat,
        current_facility: mp.current_facility,
        primary_photo_path: mp.primary_photo_path,
        merged_report_ids: mp.merged_report_ids || [],
        tracking_code: null,
        is_merged: true,
        createdAt: mp.createdAt,
        updatedAt: mp.updatedAt,
      };
    });

    // 4. Map Report items to unified schema
    const unifiedReports = reports.map((r) => {
      let cat = 'MISSING';
      if (r.report_type === 'HOSPITAL_PATIENT') {
        cat = 'HOSPITALIZED';
      } else if (r.report_type === 'RESCUED') {
        cat = r.status === 'RESOLVED_LOCATED' ? 'REUNITED' : 'SHELTERED';
      } else if (r.report_type === 'UNIDENTIFIED_BODY') {
        cat = 'DECEASED';
      } else if (r.report_type === 'MISSING') {
        cat = r.status === 'RESOLVED_LOCATED' ? 'REUNITED' : 'MISSING';
      }

      const isMerged = mergedReportIdSet.has(r.id);

      return {
        id: r.id,
        record_kind: 'REPORT',
        canonical_first_name: r.first_name,
        canonical_last_name: r.last_name,
        confirmed_status: isMerged ? 'REUNITED' : cat,
        category: cat,
        current_facility: r.last_known_location,
        primary_photo_path: r.photo_path,
        merged_report_ids: [],
        tracking_code: r.tracking_code,
        gender: r.gender,
        approximate_age: r.approximate_age,
        report_type: r.report_type,
        source_channel: r.source_channel,
        status: r.status,
        distinguishing_marks: r.distinguishing_marks,
        clothing_description: r.clothing_description,
        is_merged: isMerged,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    // Combine both lists
    let allRecords = [...unifiedMasterPersons, ...unifiedReports];

    // Filter by Category
    if (targetCategory) {
      allRecords = allRecords.filter((rec) => {
        if (rec.category === targetCategory) return true;
        if (rec.confirmed_status === targetCategory) return true;
        if (rec.report_type === targetCategory) return true;
        if (targetCategory === 'SHELTERED' && (rec.category === 'RESCUED' || rec.report_type === 'RESCUED')) return true;
        if (targetCategory === 'HOSPITALIZED' && rec.report_type === 'HOSPITAL_PATIENT') return true;
        if (targetCategory === 'DECEASED' && rec.report_type === 'UNIDENTIFIED_BODY') return true;
        return false;
      });
    }

    // Filter by Search (Name)
    if (searchTerm) {
      allRecords = allRecords.filter((rec) => {
        const fullName = `${rec.canonical_first_name || ''} ${rec.canonical_last_name || ''}`.toLowerCase();
        const tracking = (rec.tracking_code || '').toLowerCase();
        return fullName.includes(searchTerm) || tracking.includes(searchTerm);
      });
    }

    // Filter by Facility
    if (facilityTerm) {
      allRecords = allRecords.filter((rec) => {
        const fac = (rec.current_facility || '').toLowerCase();
        return fac.includes(facilityTerm);
      });
    }

    // Sort by latest updatedAt first
    allRecords.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const total = allRecords.length;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);
    const paginated = allRecords.slice(parsedOffset, parsedOffset + parsedLimit);

    return res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      data: paginated,
    });
  } catch (error) {
    console.error('✖  Get master persons/records error:', error);
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
 * Retrieves a single record by ID (either MasterPerson or Report).
 */
async function getMasterPersonById(req, res) {
  try {
    const { id } = req.params;

    // Check MasterPerson first
    const person = await MasterPerson.findByPk(id);
    if (person) {
      let mergedReports = [];
      if (person.merged_report_ids && person.merged_report_ids.length > 0) {
        mergedReports = await Report.findAll({
          where: {
            id: {
              [Op.in]: person.merged_report_ids,
            },
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...person.toJSON(),
          record_kind: 'MASTER_PERSON',
          merged_reports: mergedReports,
        },
      });
    }

    // Check Report second
    const report = await Report.findByPk(id);
    if (report) {
      return res.status(200).json({
        success: true,
        data: {
          ...report.toJSON(),
          record_kind: 'REPORT',
          canonical_first_name: report.first_name,
          canonical_last_name: report.last_name,
          confirmed_status: report.report_type,
          current_facility: report.last_known_location,
          primary_photo_path: report.photo_path,
          merged_reports: [report],
        },
      });
    }

    return res.status(404).json({
      success: false,
      message: `No record found with ID: ${id}`,
    });
  } catch (error) {
    console.error('✖  Get record by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching record.',
    });
  }
}

/**
 * DELETE /api/v1/persons/:id
 * DELETE /api/v1/records/:id
 *
 * Deletes any record (MasterPerson or Report) by ID.
 * Safely cascades and cleans up linked candidates.
 */
async function deleteRecord(req, res) {
  try {
    const { id } = req.params;

    // 1. Check if it is a MasterPerson
    const person = await MasterPerson.findByPk(id);
    if (person) {
      await person.destroy();
      return res.status(200).json({
        success: true,
        message: 'Master person record deleted successfully.',
      });
    }

    // 2. Check if it is a Report
    const report = await Report.findByPk(id);
    if (report) {
      // Remove any MatchCandidate that references this report
      await MatchCandidate.destroy({
        where: {
          [Op.or]: [
            { source_report_id: id },
            { target_report_id: id },
          ],
        },
      });

      await report.destroy();

      return res.status(200).json({
        success: true,
        message: 'Report record and associated match candidates deleted successfully.',
      });
    }

    return res.status(404).json({
      success: false,
      message: `Record not found with ID: ${id}`,
    });
  } catch (error) {
    console.error('✖  Delete record error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting record.',
    });
  }
}

module.exports = {
  getMasterPersons,
  getMasterPersonById,
  deleteRecord,
};
