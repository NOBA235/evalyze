import express from 'express';
import { createExam, getExamsByClassroom, getExam, updateExam, updateAnswerKey } from '../controllers/examController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
router.use(protect);
router.get('/classroom/:classroomId', getExamsByClassroom);
router.get('/:id', getExam);
router.post('/', requireRole('teacher'),
  upload.fields([
    { name: 'questionPaper', maxCount: 1 },
    { name: 'answerKey', maxCount: 1 },
    { name: 'rubric', maxCount: 1 },
  ]),
  createExam
);
router.put('/:id', requireRole('teacher'), updateExam);
router.patch('/:id/answer-key', requireRole('teacher'), upload.single('answerKey'), updateAnswerKey);
export default router;
