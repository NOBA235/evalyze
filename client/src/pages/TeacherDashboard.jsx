import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, BookOpen, X, Hash, ChevronRight, GraduationCap, LayoutGrid } from 'lucide-react';
import { classroomAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const COLORS = ['#2563eb','#7c3aed','#059669','#d97706','#dc2626','#0891b2'];

const CreateModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', subject: '', description: '', coverColor: COLORS[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await classroomAPI.create(form);
      onCreate(data.classroom); onClose();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="bg-white border border-zinc-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-xl tracking-wide text-zinc-900">New Classroom</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Classroom Name</label>
            <input className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
              placeholder="e.g. Grade 12 Physics" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Subject</label>
            <input className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
              placeholder="e.g. Physics" value={form.subject}
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Description (optional)</label>
            <textarea className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" 
              rows={2} placeholder="Brief description…"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Colour</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, coverColor: c }))}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    form.coverColor === c ? 'border-zinc-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating…</>
              : 'Create Classroom'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ClassroomCard = ({ classroom, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
  >
    <Link to={`/classroom/${classroom._id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18 }}
        className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden cursor-pointer
                   hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-100 transition-shadow duration-200"
      >
        {/* Colour band */}
        <div className="h-1.5 w-full" style={{ backgroundColor: classroom.coverColor }} />

        <div className="p-5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-zinc-900 tracking-wide group-hover:text-blue-600 transition-colors truncate leading-snug">
                {classroom.name}
              </h3>
              <p className="text-zinc-500 text-sm mt-0.5 font-normal">{classroom.subject}</p>
            </div>
            <ChevronRight size={16}
              className="text-zinc-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
          </div>

          {/* Description */}
          {classroom.description && (
            <p className="text-zinc-400 text-xs mb-4 font-normal line-clamp-2 leading-relaxed">
              {classroom.description}
            </p>
          )}

          {/* Footer meta */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
            <span className="flex items-center gap-1.5 text-zinc-400 text-xs font-normal">
              <Users size={12} />
              <span>{classroom.students?.length || 0} student{classroom.students?.length !== 1 ? 's' : ''}</span>
            </span>

            {/* Join code pill */}
            <span className="flex items-center gap-1 text-zinc-400 text-xs font-mono bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-lg">
              <Hash size={9} />{classroom.joinCode}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  </motion.div>
);

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, accent, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon size={18} className="opacity-80" />
    </div>
    <div>
      <p className="text-zinc-400 text-xs font-medium mb-0.5">{label}</p>
      <p className="font-semibold text-2xl text-zinc-900 leading-none">{value}</p>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-1.5 bg-zinc-100" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-zinc-100 rounded w-2/3" />
      <div className="h-3 bg-zinc-100 rounded w-1/3" />
      <div className="h-3 bg-zinc-100 rounded w-full mt-4" />
      <div className="flex justify-between pt-3 border-t border-zinc-100">
        <div className="h-3 bg-zinc-100 rounded w-20" />
        <div className="h-3 bg-zinc-100 rounded w-14" />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */
export default function TeacherDashboard() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not a teacher
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        navigate('/login', { replace: true });
      } else if (user.role !== 'teacher') {
        navigate(`/${user.role}`, { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Fetch classrooms only if authenticated as teacher
  useEffect(() => {
    if (isAuthenticated && user?.role === 'teacher') {
      classroomAPI.list()
        .then(({ data }) => setClassrooms(data.classrooms))
        .catch((error) => {
          console.error('Failed to fetch classrooms:', error);
          // If 401 or 403, redirect to login
          if (error.response?.status === 401 || error.response?.status === 403) {
            navigate('/login', { replace: true });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not a teacher
  if (!isAuthenticated || !user || user.role !== 'teacher') {
    return null; // Will redirect via useEffect
  }

  const firstName = user?.name?.split(' ')[0] || 'Teacher';
  const totalStudents = classrooms.reduce((a, c) => a + (c.students?.length || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* ── PAGE HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8"
        >
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Teacher Dashboard</p>
            <h1 className="text-3xl font-bold text-zinc-900 leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-normal">
              Manage your classrooms and track student activity
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl 
              transition-all flex items-center gap-2 self-start sm:self-auto py-3 px-5 
              shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <Plus size={15} />New Classroom
          </button>
        </motion.div>

        {/* ── STAT STRIP ── */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard
            label="Classrooms"
            value={loading ? '—' : classrooms.length}
            icon={LayoutGrid}
            accent="bg-blue-50 text-blue-600"
            delay={0.05}
          />
          <StatCard
            label="Total Students"
            value={loading ? '—' : totalStudents}
            icon={GraduationCap}
            accent="bg-indigo-50 text-indigo-600"
            delay={0.1}
          />
        </div>

        {/* ── SECTION LABEL ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-900 tracking-wide text-sm">Your Classrooms</h2>
          {!loading && classrooms.length > 0 && (
            <span className="text-zinc-400 text-xs">{classrooms.length} total</span>
          )}
        </div>

        {/* ── GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : classrooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200 border-dashed rounded-2xl py-24 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-zinc-400" />
            </div>
            <h3 className="font-medium text-zinc-900 tracking-wide mb-1.5">No classrooms yet</h3>
            <p className="text-zinc-400 text-sm font-normal mb-6 max-w-xs">
              Create your first classroom to start assigning exams and tracking students
            </p>
            <button 
              onClick={() => setShowCreate(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl 
                transition-all flex items-center gap-2 px-7 py-2.5 shadow-lg shadow-blue-500/25"
            >
              <Plus size={14} />Create Classroom
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((cls, i) => (
              <ClassroomCard key={cls._id} classroom={cls} index={i} />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showCreate && (
          <CreateModal
            onClose={() => setShowCreate(false)}
            onCreate={c => setClassrooms(p => [c, ...p])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}