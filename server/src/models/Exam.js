import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  instructions: { type: String, default: '' },
  totalMarks: { type: Number, required: true, min: 1 },
  passingMarks: { type: Number, default: 0 },
  duration: { type: Number, default: 60 }, // minutes
  deadline: { type: Date },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionPaper: {
    filename: String,
    path: String,
    mimetype: String,
  },
  answerKey: {
    filename: String,
    path: String,
    mimetype: String,
    textContent: String,
  },
  rubric: {
    filename: String,
    path: String,
    textContent: String,
  },
  status: { type: String, enum: ['draft', 'active', 'closed'], default: 'active' },
  evaluationCriteria: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);
