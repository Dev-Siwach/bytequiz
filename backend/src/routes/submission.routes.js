const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireStudent, requireTeacher } = require('../middleware/role.middleware');
const validateMiddleware = require('../middleware/validate.middleware');
const { submitSchema } = require('../schemas/submission.schema');
const { submit, getMySubmission, getQuizSubmissions, getSubmissionById } = require('../controllers/submission.controller');

router.use(authMiddleware);

router.get('/:id', getSubmissionById);
router.post('/:quizId', requireStudent, validateMiddleware(submitSchema), submit);
router.get('/my/:quizId', requireStudent, getMySubmission);
router.get('/quiz/:quizId', requireTeacher, getQuizSubmissions);

module.exports = router;