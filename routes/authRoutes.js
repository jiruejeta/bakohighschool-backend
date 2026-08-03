const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getMe } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerValidator, validateRequest, registerAdmin);
router.post('/login', loginValidator, validateRequest, loginAdmin);
router.get('/me', protect, getMe);

module.exports = router;