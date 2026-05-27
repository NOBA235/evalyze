import Classroom from '../models/Classroom.js';
import User from '../models/User.js';

export const createClassroom = async (req, res) => {
  try {
    const { name, subject, description, coverColor } = req.body;
    const classroom = await Classroom.create({
      name, subject, description, coverColor,
      teacher: req.user._id,
    });
    res.status(201).json({ success: true, classroom });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyClassrooms = async (req, res) => {
  try {
    let classrooms;
    if (req.user.role === 'teacher') {
      classrooms = await Classroom.find({ teacher: req.user._id })
        .populate('teacher', 'name email')
        .populate('students', 'name email')
        .sort({ createdAt: -1 });
    } else {
      classrooms = await Classroom.find({ students: req.user._id })
        .populate('teacher', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json({ success: true, classrooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email');
    if (!classroom) return res.status(404).json({ success: false, message: 'Classroom not found' });
    res.json({ success: true, classroom });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const joinClassroom = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const classroom = await Classroom.findOne({ joinCode: joinCode.toUpperCase() });
    if (!classroom) return res.status(404).json({ success: false, message: 'Invalid join code' });

    if (classroom.students.includes(req.user._id))
      return res.status(400).json({ success: false, message: 'Already joined' });

    classroom.students.push(req.user._id);
    await classroom.save();
    res.json({ success: true, classroom });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      req.body,
      { new: true }
    );
    if (!classroom) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, classroom });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteClassroom = async (req, res) => {
  try {
    await Classroom.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    res.json({ success: true, message: 'Classroom deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
