const Student = require('../models/Student');
const Section = require('../models/Section');
const { generateStudentCredentials } = require('../utils/generateCredentials');

const generateUniqueCredentials = async (fullName) => {
  let attempts = 0;
  let username, password;
  let isUnique = false;

  while (!isUnique && attempts < 8) {
    const creds = generateStudentCredentials(fullName);
    username = creds.username;
    password = creds.password;
    const existing = await Student.findOne({ username });
    isUnique = !existing;
    attempts++;
  }

  if (!isUnique) {
    // extremely unlikely fallback: append timestamp fragment
    username = `${username}${Date.now().toString().slice(-3)}`;
  }

  return { username, password };
};

// @desc    Create a single student
// @route   POST /api/students
// @access  Private (admin)
const createStudent = async (req, res, next) => {
  try {
    const { name, section } = req.body;

    const sectionDoc = await Section.findById(section);
    if (!sectionDoc) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const { username, password } = await generateUniqueCredentials(name);

    const student = await Student.create({
      name,
      username,
      password,
      grade: sectionDoc.grade,
      section: sectionDoc._id,
      createdBy: req.admin.id,
    });

    res.status(201).json({
      success: true,
      message: 'Student created. Save these credentials — the password will not be shown again.',
      data: {
        id: student._id,
        name: student.name,
        username: student.username,
        password,
        grade: student.grade,
        section: { id: sectionDoc._id, label: sectionDoc.label },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create students for one section (paste names)
// @route   POST /api/students/bulk
// @access  Private (admin)
const bulkCreateStudents = async (req, res, next) => {
  try {
    const { section, names } = req.body;

    const sectionDoc = await Section.findById(section);
    if (!sectionDoc) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const created = [];
    const failed = [];

    for (let i = 0; i < names.length; i++) {
      const rawName = String(names[i]).trim();
      if (!rawName) {
        failed.push({ row: i + 1, reason: 'Empty name' });
        continue;
      }

      try {
        const { username, password } = await generateUniqueCredentials(rawName);

        const student = await Student.create({
          name: rawName,
          username,
          password,
          grade: sectionDoc.grade,
          section: sectionDoc._id,
          createdBy: req.admin.id,
        });

        created.push({
          id: student._id,
          name: student.name,
          username: student.username,
          password,
        });
      } catch (err) {
        failed.push({ row: i + 1, name: rawName, reason: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `${created.length} student(s) created, ${failed.length} failed`,
      section: { id: sectionDoc._id, label: sectionDoc.label, grade: sectionDoc.grade },
      createdCount: created.length,
      students: created,
      failed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (optionally filter by grade/section/keyword)
// @route   GET /api/students
// @access  Private (admin)
const getStudents = async (req, res, next) => {
  try {
    const { grade, section, keyword } = req.query;
    const filter = {};
    if (grade) filter.grade = Number(grade);
    if (section) filter.section = section;
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { username: { $regex: keyword, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .populate('section', 'name grade')
      .sort({ grade: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (admin)
const updateStudent = async (req, res, next) => {
  try {
    const { name, section, isActive } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (section) {
      const sectionDoc = await Section.findById(section);
      if (!sectionDoc) {
        return res.status(404).json({ success: false, message: 'Section not found' });
      }
      student.section = sectionDoc._id;
      student.grade = sectionDoc.grade;
    }

    if (name !== undefined) student.name = name;
    if (isActive !== undefined) student.isActive = isActive;

    await student.save();
    await student.populate('section', 'name grade');

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset a student's password
// @route   POST /api/students/:id/reset-password
// @access  Private (admin)
const resetStudentPassword = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { password } = await generateUniqueCredentials(student.name);
    student.password = password;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Password reset. Save this — it will not be shown again.',
      data: { username: student.username, password },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (admin)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await student.deleteOne();

    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  bulkCreateStudents,
  getStudents,
  updateStudent,
  resetStudentPassword,
  deleteStudent,
};