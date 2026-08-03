const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');

// @desc    Create a chapter
// @route   POST /api/chapters
// @access  Private
const createChapter = async (req, res, next) => {
  try {
    const { title, subject, grade, order } = req.body;

    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const existing = await Chapter.findOne({ title: title.trim(), subject, grade });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This chapter already exists for the selected subject and grade',
      });
    }

    const chapter = await Chapter.create({ title, subject, grade, order });
    await chapter.populate('subject', 'name');

    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chapters (optionally filter by subject and/or grade)
// @route   GET /api/chapters
// @access  Private
const getChapters = async (req, res, next) => {
  try {
    const { subject, grade } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (grade) filter.grade = Number(grade);

    const chapters = await Chapter.find(filter)
      .populate('subject', 'name')
      .sort({ grade: 1, order: 1, title: 1 });

    res.status(200).json({ success: true, count: chapters.length, data: chapters });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single chapter
// @route   GET /api/chapters/:id
// @access  Private
const getChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('subject', 'name');
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }
    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

// @desc    Update chapter
// @route   PUT /api/chapters/:id
// @access  Private
const updateChapter = async (req, res, next) => {
  try {
    const { title, subject, grade, order, isActive } = req.body;

    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    if (subject) {
      const subjectExists = await Subject.findById(subject);
      if (!subjectExists) {
        return res.status(404).json({ success: false, message: 'Subject not found' });
      }
    }

    const nextTitle = title !== undefined ? title.trim() : chapter.title;
    const nextSubject = subject !== undefined ? subject : chapter.subject;
    const nextGrade = grade !== undefined ? Number(grade) : chapter.grade;

    const duplicate = await Chapter.findOne({
      _id: { $ne: chapter._id },
      title: nextTitle,
      subject: nextSubject,
      grade: nextGrade,
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'This chapter already exists for the selected subject and grade',
      });
    }

    if (title !== undefined) chapter.title = title;
    if (subject !== undefined) chapter.subject = subject;
    if (grade !== undefined) chapter.grade = Number(grade);
    if (order !== undefined) chapter.order = order;
    if (isActive !== undefined) chapter.isActive = isActive;

    await chapter.save();
    await chapter.populate('subject', 'name');

    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete chapter
// @route   DELETE /api/chapters/:id
// @access  Private
const deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    await chapter.deleteOne();

    res.status(200).json({ success: true, message: 'Chapter deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChapter,
  getChapters,
  getChapter,
  updateChapter,
  deleteChapter,
};