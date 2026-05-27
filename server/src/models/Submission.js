import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  files: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    pageNumber: Number,
  }],
  status: {
    type: String,
    enum: ['submitted', 'evaluating', 'ai_checked', 'teacher_approved'],
    default: 'submitted',
  },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
