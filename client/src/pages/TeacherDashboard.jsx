import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, BookOpen, X, Hash } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
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
          <div><label className="label">Classroom Name</label>
            <input className="input-field" placeholder="e.g. Grade 12 Physics" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
          <div><label className="label">Subject</label>
            <input className="input-field" placeholder="e.g. Physics" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required /></div>
          <div><label className="label">Description (optional)</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Brief description…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div>
            <label className="label">Colour</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, coverColor: c }))}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${form.coverColor === c ? 'scale-110 border-zinc-900' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating…</> : 'Create Classroom'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ClassroomCard = ({ classroom, index }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
    <Link to={`/classroom/${classroom._id}`}>
      <motion.div whileHover={{ y: -6 }} className="card group h-full cursor-pointer">
        <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: classroom.coverColor }} />
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-900 tracking-wide group-hover:text-blue-600 transition-colors truncate">{classroom.name}</h3>
            <p className="text-zinc-500 text-sm mt-0.5 font-normal">{classroom.subject}</p>
          </div>
          <div className="flex items-center gap-1 text-zinc-400 text-xs font-mono bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-lg shrink-0">
            <Hash size={10} />{classroom.joinCode}
          </div>
        </div>
        {classroom.description && <p className="text-zinc-500 text-xs mb-3 font-normal line-clamp-2">{classroom.description}</p>}
        <div className="flex items-center gap-1 text-zinc-400 text-xs font-normal">
          <Users size={12} />{classroom.students?.length || 0} students
        </div>
      </motion.div>
    </Link>
  </motion.div>
);

export default function TeacherDashboard() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    classroomAPI.list().then(({ data }) => setClassrooms(data.classrooms)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="section-label mb-1">Teacher Dashboard</p>
            <h1 className="heading-lg text-zinc-900">My Classrooms</h1>
            <p className="text-zinc-500 text-sm mt-1 font-normal">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto py-3 px-6">
            <Plus size={15} />New Classroom
          </button>
        </motion.div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Classrooms',      val: classrooms.length, color: 'text-blue-600' },
            { label: 'Total Students',  val: classrooms.reduce((a, c) => a + (c.students?.length || 0), 0), color: 'text-indigo-600' },
          ].map(({ label, val, color }) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-zinc-200 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs font-medium mb-1">{label}</p>
              <p className={`font-semibold text-3xl ${color}`}>{val}</p>
            </motion.div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-zinc-200 rounded-2xl h-40 animate-pulse" />)}
          </div>
        ) : classrooms.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-zinc-400" />
            </div>
            <h3 className="font-medium text-zinc-900 text-lg tracking-wide mb-2">No classrooms yet</h3>
            <p className="text-zinc-500 text-sm font-normal mb-6">Create your first classroom to get started</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary px-8 py-3">Create Classroom</button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((cls, i) => <ClassroomCard key={cls._id} classroom={cls} index={i} />)}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={c => setClassrooms(p => [c, ...p])} />}
      </AnimatePresence>
    </div>
  );
}
