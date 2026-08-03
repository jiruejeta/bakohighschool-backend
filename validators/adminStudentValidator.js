const { body } = require('express-validator');

const createStudentValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('section').notEmpty().withMessage('Section is required').isMongoId().withMessage('Invalid section id'),
];

const bulkCreateStudentValidator = [
  body('section').notEmpty().withMessage('Section is required').isMongoId().withMessage('Invalid section id'),
  body('names').isArray({ min: 1 }).withMessage('At least one student name is required'),
];

const updateStudentValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name is required'),
  body('section').optional().isMongoId().withMessage('Invalid section id'),
];

module.exports = { createStudentValidator, bulkCreateStudentValidator, updateStudentValidator };