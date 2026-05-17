const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireStudent, requireTeacher } = require('../middleware/role.middleware');
const { explain, generate, enhance } = require('../controllers/llm.controller');

router.use(authMiddleware);

router.post('/explain', requireStudent, explain);
router.post('/generate', requireTeacher, generate);
router.post('/enhance', requireTeacher, enhance);

module.exports = router;