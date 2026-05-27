import Submission from '../models/Submission.js';
import Exam from '../models/Exam.js';
import Classroom from '../models/Classroom.js';
import Evaluation from '../models/Evaluation.js';

export const submitAnswerSheet = async (req, res) => {
  try {
    const { examId } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const classroom = await Classroom.findOne({ _id: exam.classroom, students: req.user._id });
    if (!classroom) return res.status(403).json({ success: false, message: 'Not enrolled in this classroom' });

    // Check for existing submission
    const existing = await Submission.findOne({ exam: examId, student: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already submitted' });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No files uploaded' });

    const files = req.files.map((f, i) => ({
      filename: f.originalname,
      path: f.path,
      mimetype: f.mimetype,
      size: f.size,
      pageNumber: i + 1,
    }));

    const submission = await Submission.create({
      exam: examId,
      student: req.user._id,
      classroom: exam.classroom,
      files,
    });

    res.status(201).json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSubmissionsByExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.examId, teacher: req.user._id });
    if (!exam) return res.status(403).json({ success: false, message: 'Access denied' });

    const submissions = await Submission.find({ exam: req.params.examId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    const evaluations = await Evaluation.find({ exam: req.params.examId });
    const evalMap = {};
    evaluations.forEach(e => { evalMap[e.student.toString()] = e; });

    const enriched = submissions.map(s => ({
      ...s.toObject(),
      evaluation: evalMap[s.student._id.toString()] || null,
    }));

    res.json({ success: true, submissions: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('exam', 'title subject totalMarks')
      .populate('classroom', 'name')
      .sort({ submittedAt: -1 });

    const evaluations = await Evaluation.find({ student: req.user._id });
    const evalMap = {};
    evaluations.forEach(e => { evalMap[e.submission.toString()] = e; });

    const enriched = submissions.map(s => ({
      ...s.toObject(),
      evaluation: evalMap[s._id.toString()] || null,
    }));

    res.json({ success: true, submissions: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student', 'name email')
      .populate('exam', 'title subject totalMarks')
      .populate('classroom', 'name');

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    const evaluation = await Evaluation.findOne({ submission: submission._id });
    res.json({ success: true, submission, evaluation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
