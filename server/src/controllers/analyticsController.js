import Evaluation from '../models/Evaluation.js';
import Submission from '../models/Submission.js';
import Exam from '../models/Exam.js';
import Classroom from '../models/Classroom.js';
import { generateAnalytics } from '../services/geminiService.js';

export const getClassroomAnalytics = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const classroom = await Classroom.findOne({ _id: classroomId, teacher: req.user._id });
    if (!classroom) return res.status(403).json({ success: false, message: 'Access denied' });

    const evaluations = await Evaluation.find({ classroom: classroomId })
      .populate('student', 'name email')
      .populate('exam', 'title subject totalMarks');

    if (evaluations.length === 0)
      return res.json({ success: true, analytics: null, message: 'No evaluations yet' });

    const marks = evaluations.map(e => e.finalMarks);
    const percentages = evaluations.map(e => e.percentage);
    const passed = evaluations.filter(e => e.isPassed).length;

    const allWeakTopics = evaluations.flatMap(e => e.weakTopics);
    const topicFreq = {};
    allWeakTopics.forEach(t => { topicFreq[t] = (topicFreq[t] || 0) + 1; });
    const weakTopics = Object.entries(topicFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    const analytics = {
      totalStudents: evaluations.length,
      totalSubmissions: evaluations.length,
      classAverage: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
      highestMarks: Math.max(...marks),
      lowestMarks: Math.min(...marks),
      passCount: passed,
      failCount: evaluations.length - passed,
      passRate: Math.round((passed / evaluations.length) * 100),
      weakTopics,
      gradeDistribution: {
        'A+': evaluations.filter(e => e.grade === 'A+').length,
        'A': evaluations.filter(e => e.grade === 'A').length,
        'B+': evaluations.filter(e => e.grade === 'B+').length,
        'B': evaluations.filter(e => e.grade === 'B').length,
        'C': evaluations.filter(e => e.grade === 'C').length,
        'D': evaluations.filter(e => e.grade === 'D').length,
        'F': evaluations.filter(e => e.grade === 'F').length,
      },
      recentEvaluations: evaluations.slice(0, 5).map(e => ({
        studentName: e.student?.name,
        examTitle: e.exam?.title,
        marks: e.finalMarks,
        percentage: e.percentage,
        grade: e.grade,
      })),
    };

    res.json({ success: true, analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getExamAnalytics = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findOne({ _id: examId, teacher: req.user._id });
    if (!exam) return res.status(403).json({ success: false, message: 'Access denied' });

    const evaluations = await Evaluation.find({ exam: examId })
      .populate('student', 'name email');

    if (evaluations.length === 0)
      return res.json({ success: true, analytics: null });

    const percentages = evaluations.map(e => e.percentage);
    const passed = evaluations.filter(e => e.isPassed).length;

    res.json({
      success: true,
      analytics: {
        totalEvaluated: evaluations.length,
        average: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
        highest: Math.max(...percentages),
        lowest: Math.min(...percentages),
        passRate: Math.round((passed / evaluations.length) * 100),
        students: evaluations.map(e => ({
          name: e.student?.name,
          marks: e.finalMarks,
          percentage: e.percentage,
          grade: e.grade,
          isPassed: e.isPassed,
          weakTopics: e.weakTopics,
        })),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStudentAnalytics = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ student: req.user._id })
      .populate('exam', 'title subject totalMarks')
      .populate('classroom', 'name')
      .sort({ createdAt: -1 });

    const percentages = evaluations.map(e => e.percentage);
    const allWeakTopics = evaluations.flatMap(e => e.weakTopics);
    const topicFreq = {};
    allWeakTopics.forEach(t => { topicFreq[t] = (topicFreq[t] || 0) + 1; });

    res.json({
      success: true,
      analytics: {
        totalExams: evaluations.length,
        averageScore: percentages.length
          ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
          : 0,
        passed: evaluations.filter(e => e.isPassed).length,
        failed: evaluations.filter(e => !e.isPassed).length,
        weakTopics: Object.entries(topicFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t),
        recentResults: evaluations.slice(0, 10).map(e => ({
          examTitle: e.exam?.title,
          subject: e.exam?.subject,
          marks: e.finalMarks,
          totalMarks: e.exam?.totalMarks,
          percentage: e.percentage,
          grade: e.grade,
          isPassed: e.isPassed,
          evaluatedAt: e.evaluatedAt,
        })),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
