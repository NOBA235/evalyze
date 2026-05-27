import express from 'express';
import { triggerEvaluation, getEvaluation, teacherOverride, approveEvaluation, batchEvaluate } from '../controllers/evaluationController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.post('/batch', requireRole('teacher'), batchEvaluate);
router.post('/:submissionId/evaluate', requireRole('teacher'), triggerEvaluation);
router.get('/:submissionId', getEvaluation);
router.put('/:submissionId/override', requireRole('teacher'), teacherOverride);
router.patch('/:submissionId/approve', requireRole('teacher'), approveEvaluation);
export default router;
