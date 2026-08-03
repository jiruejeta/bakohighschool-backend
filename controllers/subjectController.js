const Subject = require('../models/Subject');

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existing = await Subject.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A subject with this name already exists',
      });
    }

    const subject = await Subject.create({ name, description });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    if (name && name.trim() !== subject.name) {
      const existing = await Subject.findOne({ name: name.trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A subject with this name already exists',
        });
      }
    }

    if (name !== undefined) subject.name = name;
    if (description !== undefined) subject.description = description;
    if (isActive !== undefined) subject.isActive = isActive;

    await subject.save();

    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await subject.deleteOne();

    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
};