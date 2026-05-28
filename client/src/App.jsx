import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx'; 
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} />;
  }
  
  return children;
};

// Helper function to determine back navigation based on route
const useBackNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const path = location.pathname;
  
  // Exam view - back to classroom
  if (path.startsWith('/exam/')) {
    // You might need to get classroomId from somewhere, 
    // but ExamView should handle this internally
    return { 
      backTo: user?.role === 'teacher' ? '/teacher' : '/student',
      backLabel: 'Back to Dashboard'
    };
  }
  
  // Submission view - back to exam or dashboard
  if (path.startsWith('/submission/')) {
    return { 
      backTo: user?.role === 'teacher' ? '/teacher' : '/student',
      backLabel: 'Back to Dashboard'
    };
  }
  
  // Classroom view - back to dashboard
  if (path.startsWith('/classroom/')) {
    return {
      backTo: user?.role === 'teacher' ? '/teacher' : '/student',
      backLabel: 'Dashboard'
    };
  }
  
  // Teacher dashboard - back to landing (if needed)
  if (path === '/teacher') {
    return null; // No back button on main dashboard
  }
  
  // Student dashboard - back to landing (if needed)
  if (path === '/student') {
    return null; // No back button on main dashboard
  }
  
  // Default - no back navigation
  return null;
};

const AppContent = () => {
  const backNav = useBackNavigation();
  
  return (
    <>
      <Navbar 
        backTo={backNav?.backTo} 
        backLabel={backNav?.backLabel} 
      />
      <AppRoutes />
    </>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route 
        path="/login" 
        element={
          user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} /> : <Login />
        } 
      />
      <Route 
        path="/register" 
        element={
          user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} /> : <Register />
        } 
      />
      
      {/* Protected routes - Teacher */}
      <Route 
        path="/teacher" 
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected routes - Student */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected routes - Both roles */}
      <Route 
        path="/classroom/:id" 
        element={
          <ProtectedRoute>
            <ClassroomView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/exam/:id" 
        element={
          <ProtectedRoute>
            <ExamView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/submission/:id" 
        element={
          <ProtectedRoute>
            <SubmissionView />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}