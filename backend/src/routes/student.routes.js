const express = require('express');
const { param, query } = require('express-validator');
const studentController = require('../controllers/student.controller');
const { validate, requestedWith } = require('../middlewares/validator.middleware');
const { studentsLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

router.use(requestedWith);
router.use(studentsLimiter);

router.get(
  '/',
  [
    query('batch').optional().trim().escape(),
    query('search').optional().trim().escape(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  validate,
  studentController.list
);

router.get(
  '/:id',
  [param('id').trim().notEmpty().escape()],
  validate,
  studentController.getById
);

module.exports = router;

