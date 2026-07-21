const studentService = require('../services/student.service');

function handleError(res, err) {
  return res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: [],
  });
}

async function list(req, res) {
  try {
    const { batch, search, limit, offset, openSource, internship, club, studentCouncil } = req.query;
    const result = await studentService.list({
      batch,
      search,
      openSource,
      internship,
      club,
      studentCouncil,
      limit: Math.min(Number.parseInt(limit) || 24, 100), // Max 100 per request
      offset: Number.parseInt(offset) || 0,
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    return handleError(res, err);
  }
}

async function getById(req, res) {
  try {
    const student = await studentService.getById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        errors: [],
      });
    }
    return res.json({ success: true, data: student });
  } catch (err) {
    return handleError(res, err);
  }
}

module.exports = { list, getById };
