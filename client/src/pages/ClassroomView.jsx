import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Copy, Check, Users, FileText, Clock, X, Upload, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { classroomAPI, examAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const ExamCard = ({ exam, index }) => {
  const deadline = exam.deadline ? new Date(exam.deadline) : null;
  const isPast = deadline && deadline < new Date();
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <Link to={`/exam/${exam._id}`}>
        <motion.div whileHover={{ y: -4 }} className="card group cursor-pointer">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${exam.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{exam.status}</span>
                {isPast && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-50 text-red-600">Closed</span>}
              </div>
              <h3 className="font-semibold text-zinc-900 tracking-wide group-hover:text-blue-600 transition-colors">{exam.title}</h3>
              <p className="text-zinc-500 text-sm mt-0.5 font-normal">{exam.subject}</p>
            </div>
            <ChevronRight size={18} className="text-zinc-300 group-hover:text-blue-500 transition-colors mt-1 shrink-0" />
          </div>
          <div className="flex items-center gap-4 mt-4 text-zinc-400 text-xs font-normal flex-wrap">
            <span className="flex items-center gap-1"><FileText size={12} />{exam.totalMarks} marks</span>
            {deadline && <span className="flex items-center gap-1"><Clock size={12} />{deadline.toLocaleDateString()}</span>}
            {exam.answerKey?.textContent || exam.answerKey?.path
              ? <span className="flex items-center gap-1 text-emerald-600"><Check size={12} />Answer key set</span>
              : <span className="text-amber-600">No answer key</span>}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

const CreateExamModal = ({ classroomId, onClose, onCreate }) => {
  const [form, setForm] = useState({ title: '', subject: '', description: '', instructions: '', totalMarks: '', passingMarks: '', duration: 60, deadline: '', evaluationCriteria: '' });
  const [files, setFiles] = useState({ questionPaper: null, answerKey: null, rubric: null });
  const [answerKeyText, setAnswerKeyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('details');

  const handleSubmit = async () => {
    if (!form.title || !form.subject || !form.totalMarks) { alert('Title, subject and total marks are required'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      fd.append('classroomId', classroomId);
      if (files.questionPaper) fd.append('questionPaper', files.questionPaper);
      if (files.answerKey)    fd.append('answerKey',    files.answerKey);
      if (files.rubric)       fd.append('rubric',       files.rubric);
      const { data } = await examAPI.create(fd);
      if (answerKeyText) {
        const akFd = new FormData(); akFd.append('textContent', answerKeyText);
        await examAPI.updateAnswerKey(data.exam._id, akFd);
      }
      onCreate(data.exam); onClose();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create exam'); }
    finally { setLoading(false); }
  };

  const tabs = ['details', 'files', 'answer key'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="font-medium text-xl tracking-wide text-zinc-900">Create Exam</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
        </div>
        <div className="flex gap-1 px-6 pt-4">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-zinc-500 hover:text-zinc-700'}`}>{t}</button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {tab === 'details' && (
            <div className="space-y-4">
              <div><label className="label">Title *</label><input className="input-field" placeholder="Mid-Term Exam" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><label className="label">Subject *</label><input className="input-field" placeholder="Physics" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Total Marks *</label><input type="number" className="input-field" placeholder="100" value={form.totalMarks} onChange={e => setForm(p => ({ ...p, totalMarks: e.target.value }))} /></div>
                <div><label className="label">Passing Marks</label><input type="number" className="input-field" placeholder="40" value={form.passingMarks} onChange={e => setForm(p => ({ ...p, passingMarks: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Duration (min)</label><input type="number" className="input-field" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} /></div>
                <div><label className="label">Deadline</label><input type="datetime-local" className="input-field" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} /></div>
              </div>
              <div><label className="label">Instructions</label><textarea className="input-field resize-none" rows={2} placeholder="Exam instructions…" value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} /></div>
              <div><label className="label">Evaluation Criteria</label><textarea className="input-field resize-none" rows={2} placeholder="How should answers be graded?" value={form.evaluationCriteria} onChange={e => setForm(p => ({ ...p, evaluationCriteria: e.target.value }))} /></div>
            </div>
          )}
          {tab === 'files' && (
            <div className="space-y-4">
              {[{ key: 'questionPaper', label: 'Question Paper', hint: 'PDF or image' }, { key: 'answerKey', label: 'Answer Key File', hint: 'Or paste text on next tab' }, { key: 'rubric', label: 'Marking Rubric', hint: 'Optional' }].map(({ key, label, hint }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${files[key] ? 'border-blue-300 bg-blue-50' : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50'}`}>
                    <Upload size={18} className="text-zinc-400" />
                    <div>
                      <div className="text-zinc-700 text-sm font-normal">{files[key] ? files[key].name : `Choose ${label}`}</div>
                      <div className="text-zinc-400 text-xs">{hint}</div>
                    </div>
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => e.target.files[0] && setFiles(p => ({ ...p, [key]: e.target.files[0] }))} />
                  </label>
                </div>
              ))}
            </div>
          )}
          {tab === 'answer key' && (
            <div className="space-y-3">
              <p className="text-zinc-500 text-sm font-normal">Paste model answer text. The AI uses this to grade submissions accurately.</p>
              <textarea className="input-field resize-none w-full" rows={12}
                placeholder={"Q1. Newton's First Law states that...\n\nQ2. The formula for work done is W = F × d × cos(θ)...\n\nQ3. ..."}
                value={answerKeyText} onChange={e => setAnswerKeyText(e.target.value)} />
            </div>
          )}
        </div>
        <div className="p-6 border-t border-zinc-100">
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating…</> : 'Create Exam'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ClassroomView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [classroom, setClassroom] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([classroomAPI.get(id), examAPI.listByClassroom(id)])
      .then(([cr, ex]) => { setClassroom(cr.data.classroom); setExams(ex.data.exams); })
      .finally(() => setLoading(false));
  }, [id]);

  const copyCode = () => { navigator.clipboard.writeText(classroom?.joinCode || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" /></div>;

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar backTo={isTeacher ? '/teacher' : '/student'} backLabel="Dashboard" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: classroom?.coverColor || '#2563eb' }} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
            <div className="min-w-0">
              <h1 className="font-semibold text-xl sm:text-2xl tracking-wide text-zinc-900">{classroom?.name}</h1>
              <p className="text-zinc-500 text-sm mt-1 font-normal">{classroom?.subject}{classroom?.description && ` · ${classroom.description}`}</p>
              <div className="flex items-center gap-4 mt-2 text-zinc-400 text-sm flex-wrap">
                <span className="flex items-center gap-1"><Users size={13} />{classroom?.students?.length || 0} students</span>
                <span className="flex items-center gap-1"><FileText size={13} />{exams.length} exams</span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <div>
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Join Code</p>
                  <p className="font-mono font-bold text-zinc-900 text-lg tracking-widest">{classroom?.joinCode}</p>
                </div>
                <button onClick={copyCode} className="p-2 rounded-lg hover:bg-zinc-200 transition-colors text-zinc-400 hover:text-zinc-700">
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
              {isTeacher && (
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 py-3 px-5">
                  <Plus size={15} />New Exam
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Exams */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-900 tracking-wide">Exams</h2>
          <span className="text-zinc-400 text-xs">{exams.length} total</span>
        </div>

        {exams.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-zinc-400" />
            </div>
            <h3 className="font-medium text-zinc-900 tracking-wide mb-2">No exams yet</h3>
            <p className="text-zinc-500 text-sm font-normal mb-6">{isTeacher ? 'Create your first exam for this classroom' : 'Your teacher has not created any exams yet'}</p>
            {isTeacher && <button onClick={() => setShowCreate(true)} className="btn-primary px-8 py-3">Create Exam</button>}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exams.map((ex, i) => <ExamCard key={ex._id} exam={ex} index={i} />)}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showCreate && <CreateExamModal classroomId={id} onClose={() => setShowCreate(false)} onCreate={e => setExams(p => [e, ...p])} />}
      </AnimatePresence>
    </div>
  );
}
