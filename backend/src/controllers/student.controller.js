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
    const { batch, search } = req.query;
    const data = await studentService.list({ batch, search });
    return res.json({ success: true, data });
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
