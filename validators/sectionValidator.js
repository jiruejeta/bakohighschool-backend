const { body } = require('express-validator');
const { GRADES } = require('../constants/grades');

const sectionValidator = [
  body('grade')
    .notEmpty().withMessage('Grade is required')
    .custom((value) => GRADES.includes(Number(value)))
    .withMessage(`Grade must be one of ${GRADES.join(', ')}`),
  body('name')
    .trim()
    .notEmpty().withMessage('Section name is required')
    .isLength({ max: 5 }).withMessage('Section name must be short, e.g. A, B, C'),
];

module.exports = { sectionValidator };