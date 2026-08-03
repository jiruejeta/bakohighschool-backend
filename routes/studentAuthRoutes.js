const express = require('express');
const router = express.Router();
const { loginStudent, getMe } = require('../controllers/studentAuthController');
const { studentLoginValidator } = require('../validators/studentAuthValidator');
const validateRequest = require('../middleware/validateRequest');
const { protectStudent } = require('../middleware/studentAuthMiddleware');

router.post('/login', studentLoginValidator, validateRequest, loginStudent);
router.get('/me', protectStudent, getMe);

module.exports = router;