const cloudinary = require('../config/cloudinary');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const NationalExam = require('../models/NationalExam');

const destroyIfExists = async (fileObj, resourceType = 'image') => {
  if (fileObj && fileObj.publicId) {
    try {
      await cloudinary.uploader.destroy(fileObj.publicId, { resource_type: resourceType });
    } catch (err) {
      console.error('Cloudinary destroy error:', err.message);
    }
  }
};

const getUploadedFile = (req, fieldName) => {
  if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
    const file = req.files[fieldName][0];
    return { url: file.path, publicId: file.filename };
  }
  return null;
};

// @desc    Create a question
// @route   POST /api/questions
// @access  Private
const createQuestion = async (req, res, next) => {
  try {
    const {
      grade,
      subject,
      chapter,
      nationalExam,
      questionNumber,
      questionText,
      choices,
      correctAnswer,
      explanation,
      explanationVideoUrl,
      status,
    } = req.body;

    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const chapterExists = await Chapter.findById(chapter);
    if (!chapterExists) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    if (nationalExam) {
      const examExists = await NationalExam.findById(nationalExam);
      if (!examExists) {
        return res.status(404).json({ success: false, message: 'National exam year not found' });
      }
    }

    const questionImage = getUploadedFile(req, 'questionImage');
    const explanationImage = getUploadedFile(req, 'explanationImage');
    const explanationVideoFile = getUploadedFile(req, 'explanationVideoFile');

    const question = await Question.create({
      grade,
      subject,
      chapter,
      nationalExam: nationalExam || null,
      questionNumber,
      questionText,
      questionImage: questionImage || undefined,
      choices,
      correctAnswer,
      explanation,
      explanationImage: explanationImage || undefined,
      explanationVideoUrl: explanationVideoUrl || null,
      explanationVideoFile: explanationVideoFile || undefined,
      status,
      createdBy: req.admin.id,
    });

    await question.populate([
      { path: 'subject', select: 'name' },
      { path: 'chapter', select: 'title' },
      { path: 'nationalExam', select: 'year title' },
    ]);

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all questions (with filters + search + pagination)
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res, next) => {
  try {
    const {
      grade,
      subject,
      chapter,
      nationalExam,
      status,
      keyword,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (grade) filter.grade = Number(grade);
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (nationalExam) filter.nationalExam = nationalExam;
    if (status) filter.status = status;
    if (keyword) filter.$text = { $search: keyword };

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('subject', 'name')
        .populate('chapter', 'title')
        .populate('nationalExam', 'year title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Question.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private
const getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('subject', 'name')
      .populate('chapter', 'title')
      .populate('nationalExam', 'year title');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const {
      grade,
      subject,
      chapter,
      nationalExam,
      questionNumber,
      questionText,
      choices,
      correctAnswer,
      explanation,
      explanationVideoUrl,
      status,
      removeQuestionImage,
      removeExplanationImage,
      removeExplanationVideoFile,
    } = req.body;

    if (subject) {
      const subjectExists = await Subject.findById(subject);
      if (!subjectExists) {
        return res.status(404).json({ success: false, message: 'Subject not found' });
      }
    }
    if (chapter) {
      const chapterExists = await Chapter.findById(chapter);
      if (!chapterExists) {
        return res.status(404).json({ success: false, message: 'Chapter not found' });
      }
    }
    if (nationalExam) {
      const examExists = await NationalExam.findById(nationalExam);
      if (!examExists) {
        return res.status(404).json({ success: false, message: 'National exam year not found' });
      }
    }

    // Question image
    const newQuestionImage = getUploadedFile(req, 'questionImage');
    if (newQuestionImage) {
      await destroyIfExists(question.questionImage, 'image');
      question.questionImage = newQuestionImage;
    } else if (removeQuestionImage === 'true') {
      await destroyIfExists(question.questionImage, 'image');
      question.questionImage = {};
    }

    // Explanation image
    const newExplanationImage = getUploadedFile(req, 'explanationImage');
    if (newExplanationImage) {
      await destroyIfExists(question.explanationImage, 'image');
      question.explanationImage = newExplanationImage;
    } else if (removeExplanationImage === 'true') {
      await destroyIfExists(question.explanationImage, 'image');
      question.explanationImage = {};
    }

    // Explanation video file
    const newExplanationVideoFile = getUploadedFile(req, 'explanationVideoFile');
    if (newExplanationVideoFile) {
      await destroyIfExists(question.explanationVideoFile, 'video');
      question.explanationVideoFile = newExplanationVideoFile;
    } else if (removeExplanationVideoFile === 'true') {
      await destroyIfExists(question.explanationVideoFile, 'video');
      question.explanationVideoFile = {};
    }

    if (grade !== undefined) question.grade = grade;
    if (subject !== undefined) question.subject = subject;
    if (chapter !== undefined) question.chapter = chapter;
    if (nationalExam !== undefined) question.nationalExam = nationalExam || null;
    if (questionNumber !== undefined) question.questionNumber = questionNumber;
    if (questionText !== undefined) question.questionText = questionText;
    if (choices !== undefined) question.choices = choices;
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
    if (explanation !== undefined) question.explanation = explanation;
    if (explanationVideoUrl !== undefined) question.explanationVideoUrl = explanationVideoUrl || null;
    if (status !== undefined) question.status = status;

    await question.save();
    await question.populate([
      { path: 'subject', select: 'name' },
      { path: 'chapter', select: 'title' },
      { path: 'nationalExam', select: 'year title' },
    ]);

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await destroyIfExists(question.questionImage, 'image');
    await destroyIfExists(question.explanationImage, 'image');
    await destroyIfExists(question.explanationVideoFile, 'video');

    await question.deleteOne();

    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create questions for one Grade + Subject + Chapter
// @route   POST /api/questions/bulk
// @access  Private
const bulkCreateQuestions = async (req, res, next) => {
  try {
    const { grade, subject, chapter, nationalExam, status, questions } = req.body;

    if (!grade || !subject || !chapter) {
      return res.status(400).json({
        success: false,
        message: 'Grade, subject, and chapter are required for bulk upload',
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required',
      });
    }

    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const chapterExists = await Chapter.findById(chapter);
    if (!chapterExists) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    if (nationalExam) {
      const examExists = await NationalExam.findById(nationalExam);
      if (!examExists) {
        return res.status(404).json({ success: false, message: 'National exam year not found' });
      }
    }

    const createdIds = [];
    const failed = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      try {
        if (
          !q.questionNumber ||
          !q.questionText ||
          !q.choices ||
          !q.choices.A ||
          !q.choices.B ||
          !q.choices.C ||
          !q.choices.D ||
          !q.correctAnswer ||
          !['A', 'B', 'C', 'D'].includes(q.correctAnswer)
        ) {
          throw new Error('Missing or invalid required fields');
        }

        const doc = await Question.create({
          grade,
          subject,
          chapter,
          nationalExam: nationalExam || null,
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          status: status || 'draft',
          createdBy: req.admin.id,
        });

        createdIds.push(doc._id);
      } catch (err) {
        failed.push({
          row: i + 1,
          questionNumber: q.questionNumber,
          reason: err.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdIds.length} question(s) created, ${failed.length} failed`,
      createdCount: createdIds.length,
      failed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Attach one video (uploaded file OR URL) to multiple questions at once
// @route   POST /api/questions/bulk-video
// @access  Private
const bulkAssignVideo = async (req, res, next) => {
  try {
    const { questionIds, explanationVideoUrl } = req.body;

    let ids = questionIds;
    if (typeof ids === 'string') {
      try {
        ids = JSON.parse(ids);
      } catch {
        ids = [ids];
      }
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Select at least one question',
      });
    }

    const uploadedFile = getUploadedFile(req, 'explanationVideoFile');

    if (!uploadedFile && !explanationVideoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Provide either a video file or a video URL',
      });
    }

    const questions = await Question.find({ _id: { $in: ids } });
    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: 'No matching questions found' });
    }

    let updatedCount = 0;
    for (const question of questions) {
      if (uploadedFile) {
        await destroyIfExists(question.explanationVideoFile, 'video');
        question.explanationVideoFile = uploadedFile;
        question.explanationVideoUrl = null;
      } else if (explanationVideoUrl) {
        await destroyIfExists(question.explanationVideoFile, 'video');
        question.explanationVideoFile = {};
        question.explanationVideoUrl = explanationVideoUrl;
      }
      await question.save();
      updatedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Video attached to ${updatedCount} question(s)`,
      updatedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  bulkAssignVideo,
};