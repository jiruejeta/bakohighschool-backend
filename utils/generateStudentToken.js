const jwt = require('jsonwebtoken');

const generateStudentToken = (id) => {
  return jwt.sign({ id, role: 'student' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateStudentToken;