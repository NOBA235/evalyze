import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './src/routes/auth.js';
import classroomRoutes from './src/routes/classrooms.js';
import examRoutes from './src/routes/exams.js';
import submissionRoutes from './src/routes/submissions.js';
import evaluationRoutes from './src/routes/evaluations.js';
import analyticsRoutes from './src/routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Evalyze server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
