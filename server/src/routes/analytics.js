import express from 'express';
import { getClassroomAnalytics, getExamAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/classroom/:classroomId', requireRole('teacher'), getClassroomAnalytics);
router.get('/exam/:examId', requireRole('teacher'), getExamAnalytics);
router.get('/student/me', requireRole('student'), getStudentAnalytics);
export default router;
