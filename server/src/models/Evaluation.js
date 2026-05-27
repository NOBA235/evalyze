import mongoose from 'mongoose';

const questionEvalSchema = new mongoose.Schema({
  questionNumber: Number,
  questionText: String,
  studentAnswer: String,
  modelAnswer: String,
  marksAwarded: Number,
  maxMarks: Number,
  feedback: String,
  status: { type: String, enum: ['correct', 'partial', 'incorrect'], default: 'incorrect' },
});

const evaluationSchema = new mongoose.Schema({
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },

  // AI Generated
  aiMarks: { type: Number, default: 0 },
  aiFeedback: { type: String, default: '' },
  aiQuestionBreakdown: [questionEvalSchema],
  weakTopics: [String],
  strongTopics: [String],
  missedConcepts: [String],
  improvementSuggestions: [String],
  extractedAnswerText: { type: String, default: '' },

  // Teacher Override
  teacherMarks: { type: Number },
  teacherFeedback: { type: String },
  teacherComments: { type: String },
  isOverridden: { type: Boolean, default: false },

  // Final
  finalMarks: { type: Number, default: 0 },
  finalFeedback: { type: String, default: '' },
  percentage: { type: Number, default: 0 },
  grade: { type: String, default: '' },
  isPassed: { type: Boolean, default: false },

  evaluatedAt: { type: Date },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Calculate grade from percentage
evaluationSchema.methods.calculateGrade = function () {
  const p = this.percentage;
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B+';
  if (p >= 60) return 'B';
  if (p >= 50) return 'C';
  if (p >= 40) return 'D';
  return 'F';
};

export default mongoose.model('Evaluation', evaluationSchema);
