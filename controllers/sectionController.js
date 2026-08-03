const Section = require('../models/Section');
const Student = require('../models/Student');

// @desc    Create a section
// @route   POST /api/sections
// @access  Private (admin)
const createSection = async (req, res, next) => {
  try {
    const { grade, name } = req.body;
    const upperName = name.trim().toUpperCase();

    const existing = await Section.findOne({ grade, name: upperName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Section ${grade}${upperName} already exists`,
      });
    }

    const section = await Section.create({ grade, name: upperName });

    res.status(201).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sections (optionally filter by grade), with student counts
// @route   GET /api/sections
// @access  Private (admin)
const getSections = async (req, res, next) => {
  try {
    const { grade } = req.query;
    const filter = {};
    if (grade) filter.grade = Number(grade);

    const sections = await Section.find(filter).sort({ grade: 1, name: 1 });

    const withCounts = await Promise.all(
      sections.map(async (section) => {
        const studentCount = await Student.countDocuments({ section: section._id });
        return { ...section.toJSON(), studentCount };
      })
    );

    res.status(200).json({ success: true, count: withCounts.length, data: withCounts });
  } catch (error) {
    next(error);
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private (admin)
const updateSection = async (req, res, next) => {
  try {
    const { grade, name, isActive } = req.body;

    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const nextGrade = grade !== undefined ? Number(grade) : section.grade;
    const nextName = name !== undefined ? name.trim().toUpperCase() : section.name;

    const duplicate = await Section.findOne({
      _id: { $ne: section._id },
      grade: nextGrade,
      name: nextName,
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Section ${nextGrade}${nextName} already exists`,
      });
    }

    if (grade !== undefined) section.grade = grade;
    if (name !== undefined) section.name = nextName;
    if (isActive !== undefined) section.isActive = isActive;

    await section.save();

    res.status(200).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private (admin)
const deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const studentCount = await Student.countDocuments({ section: section._id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${studentCount} student(s) are still assigned to this section`,
      });
    }

    await section.deleteOne();

    res.status(200).json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSection, getSections, updateSection, deleteSection };