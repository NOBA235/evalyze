import Exam from '../models/Exam.js';
import Classroom from '../models/Classroom.js';
import path from 'path';

export const createExam = async (req, res) => {
  try {
    const { title, subject, description, instructions, totalMarks, passingMarks, duration, deadline, classroomId, evaluationCriteria } = req.body;

    const classroom = await Classroom.findOne({ _id: classroomId, teacher: req.user._id });
    if (!classroom) return res.status(403).json({ success: false, message: 'Classroom not found or access denied' });

    const examData = {
      title, subject, description, instructions,
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks) || 0,
      duration: Number(duration) || 60,
      deadline: deadline ? new Date(deadline) : undefined,
      classroom: classroomId,
      teacher: req.user._id,
      evaluationCriteria,
    };

    if (req.files?.questionPaper?.[0]) {
      examData.questionPaper = {
        filename: req.files.questionPaper[0].originalname,
        path: req.files.questionPaper[0].path,
        mimetype: req.files.questionPaper[0].mimetype,
      };
    }
    if (req.files?.answerKey?.[0]) {
      examData.answerKey = {
        filename: req.files.answerKey[0].originalname,
        path: req.files.answerKey[0].path,
        mimetype: req.files.answerKey[0].mimetype,
      };
    }
    if (req.files?.rubric?.[0]) {
      examData.rubric = {
        filename: req.files.rubric[0].originalname,
        path: req.files.rubric[0].path,
      };
    }

    const exam = await Exam.create(examData);
    res.status(201).json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getExamsByClassroom = async (req, res) => {
  try {
    const exams = await Exam.find({ classroom: req.params.classroomId })
      .sort({ createdAt: -1 });
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('classroom', 'name subject');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      req.body,
      { new: true }
    );
    if (!exam) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAnswerKey = async (req, res) => {
  try {
    const { textContent } = req.body;
    const updateData = {};

    if (textContent) updateData['answerKey.textContent'] = textContent;
    if (req.file) {
      updateData['answerKey.filename'] = req.file.originalname;
      updateData['answerKey.path'] = req.file.path;
      updateData['answerKey.mimetype'] = req.file.mimetype;
    }

    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      { $set: updateData },
      { new: true }
    );
    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
