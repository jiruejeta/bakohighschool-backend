const Student = require('../models/Student');
const generateStudentToken = require('../utils/generateStudentToken');

// @desc    Login student
// @route   POST /api/student-auth/login
// @access  Public
const loginStudent = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const student = await Student.findOne({ username: username.toLowerCase().trim() }).select('+password');
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (!student.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = generateStudentToken(student._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: student._id,
        name: student.name,
        username: student.username,
        grade: student.grade,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in student
// @route   GET /api/student-auth/me
// @access  Private (student)
const getMe = async (req, res, next) => {
  try {
    const student = await Student.findById(req.student.id).populate('section', 'name grade');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: student._id,
        name: student.name,
        username: student.username,
        grade: student.grade,
        section: student.section,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginStudent, getMe };