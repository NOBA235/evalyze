import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinCode: {
    type: String,
    default: () => uuidv4().slice(0, 8).toUpperCase(),
    unique: true,
  },
  isActive: { type: Boolean, default: true },
  coverColor: { type: String, default: '#6366f1' },
}, { timestamps: true });

export default mongoose.model('Classroom', classroomSchema);
