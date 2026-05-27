import express from 'express';
import { createClassroom, getMyClassrooms, getClassroom, joinClassroom, updateClassroom, deleteClassroom } from '../controllers/classroomController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/', getMyClassrooms);
router.post('/', requireRole('teacher'), createClassroom);
router.get('/:id', getClassroom);
router.put('/:id', requireRole('teacher'), updateClassroom);
router.delete('/:id', requireRole('teacher'), deleteClassroom);
router.post('/join', requireRole('student'), joinClassroom);
export default router;
