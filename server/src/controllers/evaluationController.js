import Submission from '../models/Submission.js';
import Exam from '../models/Exam.js';
import Evaluation from '../models/Evaluation.js';
import { extractAnswers, evaluateAnswers, generateFeedback } from '../services/geminiService.js';
import fs from 'fs';

export const triggerEvaluation = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId).populate('student', 'name');
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    const exam = await Exam.findOne({ _id: submission.exam, teacher: req.user._id });
    if (!exam) return res.status(403).json({ success: false, message: 'Access denied' });

    // Check if already evaluated
    const existing = await Evaluation.findOne({ submission: submissionId });
    if (existing?.status === 'ai_checked' && !req.body.force)
      return res.status(400).json({ success: false, message: 'Already evaluated. Pass force=true to re-evaluate.' });

    // Update submission status
    submission.status = 'evaluating';
    await submission.save();

    res.json({ success: true, message: 'Evaluation started', submissionId });

    // Run evaluation async
    runEvaluation(submission, exam, req.user._id).catch(console.error);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const runEvaluation = async (submission, exam, teacherId) => {
  try {
    // Step 1: Extract answers from uploaded files
    let extractionResult;
    if (submission.files && submission.files.length > 0) {
      extractionResult = await extractAnswers(submission.files);
    } else {
      extractionResult = { extractedText: 'No files found', answers: [], confidence: 'low' };
    }

    const studentAnswerText = extractionResult.extractedText || 
      extractionResult.answers?.map(a => `Q${a.questionNumber}: ${a.answerText}`).join('\n') ||
      'No answers extracted';

    // Step 2: Get answer key content
    let answerKeyContent = exam.answerKey?.textContent || '';
    if (!answerKeyContent && exam.answerKey?.path && fs.existsSync(exam.answerKey.path)) {
      answerKeyContent = 'Answer key file provided (image/pdf)';
    }

    // Step 3: AI Evaluation
    const evalResult = await evaluateAnswers({
      subject: exam.subject,
      title: exam.title,
      totalMarks: exam.totalMarks,
      answerKey: answerKeyContent || 'Evaluate based on general subject knowledge',
      rubric: exam.rubric?.textContent || '',
      studentAnswers: studentAnswerText,
    });

    // Step 4: Calculate final marks
    const aiMarks = Math.min(
      Math.round(evalResult.totalMarksAwarded || 0),
      exam.totalMarks
    );
    const percentage = Math.round((aiMarks / exam.totalMarks) * 100);
    const passingMarks = exam.passingMarks || Math.round(exam.totalMarks * 0.4);

    // Step 5: Save evaluation
    const evalDoc = await Evaluation.findOneAndUpdate(
      { submission: submission._id },
      {
        submission: submission._id,
        exam: exam._id,
        student: submission.student._id,
        classroom: submission.classroom,
        aiMarks,
        aiFeedback: evalResult.overallFeedback || '',
        aiQuestionBreakdown: evalResult.questionBreakdown || [],
        weakTopics: evalResult.weakTopics || [],
        strongTopics: evalResult.strongTopics || [],
        missedConcepts: evalResult.missedConcepts || [],
        improvementSuggestions: evalResult.improvementSuggestions || [],
        extractedAnswerText: studentAnswerText,
        finalMarks: aiMarks,
        finalFeedback: evalResult.overallFeedback || '',
        percentage,
        isPassed: aiMarks >= passingMarks,
        evaluatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Set grade
    evalDoc.grade = evalDoc.calculateGrade();
    await evalDoc.save();

    // Update submission status
    await Submission.findByIdAndUpdate(submission._id, { status: 'ai_checked' });
  } catch (err) {
    console.error('Evaluation failed:', err.message);
    await Submission.findByIdAndUpdate(submission._id, { status: 'submitted' });
  }
};

export const getEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ submission: req.params.submissionId })
      .populate('student', 'name email')
      .populate('exam', 'title subject totalMarks');
    if (!evaluation) return res.status(404).json({ success: false, message: 'Not evaluated yet' });
    res.json({ success: true, evaluation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const teacherOverride = async (req, res) => {
  try {
    const { teacherMarks, teacherFeedback, teacherComments } = req.body;
    const evaluation = await Evaluation.findOne({ submission: req.params.submissionId });
    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluation not found' });

    const exam = await Exam.findOne({ _id: evaluation.exam, teacher: req.user._id });
    if (!exam) return res.status(403).json({ success: false, message: 'Access denied' });

    evaluation.teacherMarks = teacherMarks;
    evaluation.teacherFeedback = teacherFeedback;
    evaluation.teacherComments = teacherComments;
    evaluation.isOverridden = true;
    evaluation.finalMarks = teacherMarks ?? evaluation.aiMarks;
    evaluation.finalFeedback = teacherFeedback || evaluation.aiFeedback;
    evaluation.percentage = Math.round((evaluation.finalMarks / exam.totalMarks) * 100);
    evaluation.grade = evaluation.calculateGrade();
    evaluation.isPassed = evaluation.finalMarks >= (exam.passingMarks || exam.totalMarks * 0.4);

    await evaluation.save();
    await Submission.findByIdAndUpdate(req.params.submissionId, { status: 'teacher_approved' });

    res.json({ success: true, evaluation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ submission: req.params.submissionId });
    if (!evaluation) return res.status(404).json({ success: false, message: 'Not found' });

    evaluation.approvedAt = new Date();
    evaluation.approvedBy = req.user._id;
    await evaluation.save();

    await Submission.findByIdAndUpdate(req.params.submissionId, { status: 'teacher_approved' });
    res.json({ success: true, evaluation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const batchEvaluate = async (req, res) => {
  try {
    const { submissionIds } = req.body;
    if (!Array.isArray(submissionIds) || submissionIds.length === 0)
      return res.status(400).json({ success: false, message: 'No submission IDs provided' });

    res.json({ success: true, message: `Batch evaluation started for ${submissionIds.length} submissions` });

    for (const submissionId of submissionIds) {
      try {
        const submission = await Submission.findById(submissionId).populate('student', 'name');
        if (!submission || submission.status === 'teacher_approved') continue;
        const exam = await Exam.findOne({ _id: submission.exam, teacher: req.user._id });
        if (!exam) continue;
        submission.status = 'evaluating';
        await submission.save();
        await runEvaluation(submission, exam, req.user._id);
      } catch (e) { console.error('Batch eval error for', submissionId, e.message); }
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
