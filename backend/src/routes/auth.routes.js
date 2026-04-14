const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/auth.controller');
const validateMiddleware = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', validateMiddleware(registerSchema), register);
router.post('/login', validateMiddleware(loginSchema), login);
router.get('/me', authMiddleware, me);

module.exports = router;