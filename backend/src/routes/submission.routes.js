const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireStudent, requireTeacher } = require('../middleware/role.middleware');
const validateMiddleware = require('../middleware/validate.middleware');
const { submitSchema } = require('../schemas/submission.schema');
const { submit, getMySubmission, getQuizSubmissions, getSubmissionById, resetSubmission } = require('../controllers/submission.controller');

router.use(authMiddleware);

router.get('/test-route', (req, res) => res.json({ success: true }));
router.delete('/:quizId/redo', requireStudent, resetSubmission);
router.get('/my/:quizId', requireStudent, getMySubmission);
router.get('/quiz/:quizId', requireTeacher, getQuizSubmissions);
router.get('/:id', getSubmissionById);
router.post('/:quizId', requireStudent, validateMiddleware(submitSchema), submit);

module.exports = router;