import express from 'express';
import { submitAnswerSheet, getSubmissionsByExam, getMySubmissions, getSubmission } from '../controllers/submissionController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
router.use(protect);
router.get('/my', getMySubmissions);
router.get('/exam/:examId', requireRole('teacher'), getSubmissionsByExam);
router.get('/:id', getSubmission);
router.post('/', requireRole('student'), upload.array('answerSheets', 10), submitAnswerSheet);
export default router;
