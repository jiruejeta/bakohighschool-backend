const { body } = require('express-validator');
const { GRADES } = require('../constants/grades');

const chapterValidator = [
  body('title').trim().notEmpty().withMessage('Chapter title is required'),
  body('subject').notEmpty().withMessage('Subject is required')
    .isMongoId().withMessage('Invalid subject id'),
  body('grade')
    .notEmpty().withMessage('Grade is required')
    .isInt().withMessage('Grade must be a number')
    .custom((value) => GRADES.includes(Number(value)))
    .withMessage(`Grade must be one of ${GRADES.join(', ')}`),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive number'),
];

module.exports = { chapterValidator };