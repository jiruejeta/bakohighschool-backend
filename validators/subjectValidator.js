const { body } = require('express-validator');

const subjectValidator = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('description').optional().trim(),
];

module.exports = { subjectValidator };