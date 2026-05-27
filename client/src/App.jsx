import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import ClassroomView from './pages/ClassroomView.jsx';
import ExamView from './pages/ExamView.jsx';
import SubmissionView from './pages/SubmissionView.jsx';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-dark-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} /> : <Register />} />
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/classroom/:id" element={<ProtectedRoute><ClassroomView /></ProtectedRoute>} />
      <Route path="/exam/:id" element={<ProtectedRoute><ExamView /></ProtectedRoute>} />
      <Route path="/submission/:id" element={<ProtectedRoute><SubmissionView /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
