require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const nationalExamRoutes = require('./routes/nationalExamRoutes');
const questionRoutes = require('./routes/questionRoutes');
const statsRoutes = require('./routes/statsRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const adminStudentRoutes = require('./routes/adminStudentRoutes');
const studentBrowseRoutes = require('./routes/studentBrowseRoutes');

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/national-exams', nationalExamRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/student-auth', studentAuthRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/students', adminStudentRoutes);
app.use('/api/student', studentBrowseRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});