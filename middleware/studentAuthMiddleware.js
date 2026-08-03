const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const protectStudent = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'student') {
      return res.status(401).json({ success: false, message: 'Not authorized as a student' });
    }

    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(401).json({ success: false, message: 'Not authorized, student not found' });
    }

    if (!student.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated' });
    }

    req.student = { id: student._id, grade: student.grade, section: student.section };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
  }
};

module.exports = { protectStudent };