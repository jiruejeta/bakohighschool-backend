const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// @desc    Register a new admin
// @route   POST /api/auth/register
// @access  Public (should be restricted/disabled in production after first admin is created)
const registerAdmin = async (req, res, next) => {
  try {
    const { name, username, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin with this username already exists',
      });
    }

    const admin = await Admin.create({
      name,
      username,
      password,
      role: role === 'superadmin' ? 'superadmin' : 'admin',
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username: username.toLowerCase() }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in admin
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerAdmin, loginAdmin, getMe };