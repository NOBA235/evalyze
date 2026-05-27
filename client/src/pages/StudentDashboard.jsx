import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Upload, TrendingUp, Award, X, Hash,
  AlertCircle, ChevronRight, FileText, ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { classroomAPI, submissionAPI, analyticsAPI, examAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/* ─── Join Classroom Modal ─── */
const JoinModal = ({ onClose, onJoin }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError(''); setLoading(true);
    try {
      const { data } = await classroomAPI.join(code.trim());
      onJoin(data.classroom); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid join code');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="bg-white border border-zinc-200 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-xl tracking-wide text-zinc-900">Join a Classroom</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-red-700 text-sm font-normal">{error}</p>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="label">Classroom Join Code</label>
            <div className="relative">
              <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                className="input-field pl-10 font-mono tracking-widest uppercase text-center text-lg"
                placeholder="XXXXXXXX" maxLength={8}
                value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
            <p className="text-zinc-400 text-xs mt-1.5 font-normal">Ask your teacher for the 8-character code</p>
          </div>
          <button type="submit" disabled={loading || code.length < 4}
            className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Joining…</>
              : 'Join Classroom'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ─── Submit Answer Sheet Modal ─── */
const SubmitModal = ({ onClose, classrooms }) => {
  const [examId, setExamId] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    if (!classrooms.length) return;
    Promise.all(classrooms.map(c => examAPI.listByClassroom(c._id)))
      .then(results => setExams(results.flatMap(r => r.data.exams || [])))
      .catch(console.error);
  }, [classrooms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!examId || files.length === 0) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('examId', examId);
      files.forEach(f => fd.append('answerSheets', f));
      await submissionAPI.submit(fd);
      onClose();
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="bg-white border border-zinc-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-xl tracking-wide text-zinc-900">Submit Answer Sheet</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Select Exam</label>
            <select className="input-field" value={examId} onChange={e => setExamId(e.target.value)} required>
              <option value="">Choose an exam…</option>
              {exams.map(ex => (
                <option key={ex._id} value={ex._id}>{ex.title} — {ex.subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Upload Answer Sheet(s)</label>
            <label className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
              files.length > 0 ? 'border-blue-400 bg-blue-50' : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50'
            }`}>
              <Upload size={24} className="text-zinc-400 mb-2" />
              <span className="text-zinc-600 text-sm font-normal">
                {files.length > 0 ? `${files.length} file(s) selected` : 'Click to choose files'}
              </span>
              <span className="text-zinc-400 text-xs mt-1">JPG, PNG, PDF · Max 20 MB each · Multiple pages ok</span>
              <input type="file" multiple accept="image/*,.pdf" className="hidden"
                onChange={e => setFiles(Array.from(e.target.files))} />
            </label>

            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-500 font-normal">
                    <FileText size={11} className="text-blue-500 shrink-0" />
                    {f.name}
                    <span className="text-zinc-300">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || !examId || files.length === 0}
            className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Uploading…</>
              : 'Submit Answer Sheet'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ─── Main Dashboard ─── */
export default function StudentDashboard() {
  const { user } = useAuth();
  const [classrooms, setClassrooms]   = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showJoin, setShowJoin]       = useState(false);
  const [showSubmit, setShowSubmit]   = useState(false);

  useEffect(() => {
    Promise.all([
      classroomAPI.list(),
      submissionAPI.getMy(),
      analyticsAPI.student().catch(() => ({ data: { analytics: null } })),
    ]).then(([cr, sub, an]) => {
      setClassrooms(cr.data.classrooms);
      setSubmissions(sub.data.submissions);
      setAnalytics(an.data.analytics);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const scoreHistory = analytics?.recentResults
    ?.slice().reverse()
    .map((r, i) => ({ name: r.examTitle?.slice(0, 12) || `Exam ${i + 1}`, score: r.percentage })) || [];

  const stats = [
    { label: 'Classrooms',  val: classrooms.length,              icon: BookOpen,   color: 'text-blue-600' },
    { label: 'Submissions', val: submissions.length,              icon: FileText,   color: 'text-indigo-600' },
    { label: 'Avg Score',   val: analytics?.averageScore ? `${analytics.averageScore}%` : '—', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Passed',      val: analytics?.passed ?? '—',        icon: Award,      color: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="section-label mb-1">Student Dashboard</p>
            <h1 className="heading-lg text-zinc-900">Welcome, {user?.name?.split(' ')[0]}</h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setShowJoin(true)}
              className="btn-ghost py-2.5 px-5 text-sm flex items-center gap-2">
              <Hash size={14} />Join Classroom
            </button>
            <button onClick={() => setShowSubmit(true)} disabled={classrooms.length === 0}
              className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-40">
              <Upload size={14} />Submit Answer Sheet
            </button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, val, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-zinc-200 rounded-2xl p-5">
              <div className={`w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center mb-3`}>
                <Icon size={16} className={color} />
              </div>
              <p className={`font-semibold text-2xl ${color}`}>{val}</p>
              <p className="text-zinc-400 text-xs mt-1 font-medium">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Classrooms */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900 tracking-wide">My Classrooms</h2>
                <button onClick={() => setShowJoin(true)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold transition-colors flex items-center gap-1">
                  + Join new
                </button>
              </div>

              {classrooms.length === 0 ? (
                <div className="p-10 text-center">
                  <BookOpen size={28} className="text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm font-normal mb-4">No classrooms yet.</p>
                  <button onClick={() => setShowJoin(true)} className="btn-primary px-6 py-2.5 text-xs">Join Classroom</button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {classrooms.map((cls, i) => (
                    <motion.div key={cls._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link to={`/classroom/${cls._id}`}
                        className="flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-zinc-50 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${cls.coverColor}18`, border: `1.5px solid ${cls.coverColor}44` }}>
                            <BookOpen size={15} style={{ color: cls.coverColor }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-zinc-900 text-sm font-semibold group-hover:text-blue-600 transition-colors truncate">{cls.name}</p>
                            <p className="text-zinc-400 text-xs font-normal">{cls.subject} · {cls.teacher?.name}</p>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-zinc-300 group-hover:text-blue-500 transition-colors shrink-0" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Submissions */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-zinc-100">
                <h2 className="font-semibold text-zinc-900 tracking-wide">My Submissions</h2>
              </div>

              {submissions.length === 0 ? (
                <div className="p-10 text-center">
                  <FileText size={28} className="text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm font-normal">No submissions yet</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {submissions.map((sub, i) => (
                    <motion.div key={sub._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                      <Link to={`/submission/${sub._id}`}
                        className="flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-zinc-50 transition-colors group">
                        <div className="min-w-0 mr-3">
                          <p className="text-zinc-900 text-sm font-semibold group-hover:text-blue-600 transition-colors truncate">
                            {sub.exam?.title || 'Exam'}
                          </p>
                          <p className="text-zinc-400 text-xs font-normal">
                            {sub.exam?.subject} · {new Date(sub.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {sub.evaluation && (
                            <div className="text-right hidden sm:block">
                              <p className="font-mono text-sm font-bold text-zinc-900">
                                {sub.evaluation.finalMarks}<span className="text-zinc-400">/{sub.exam?.totalMarks}</span>
                              </p>
                              <p className={`text-xs font-semibold ${sub.evaluation.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                                {sub.evaluation.grade}
                              </p>
                            </div>
                          )}
                          <StatusBadge status={sub.status} size="sm" />
                          <ChevronRight size={14} className="text-zinc-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column — analytics sidebar */}
          <div className="space-y-5">

            {/* Score trend */}
            {scoreHistory.length > 1 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-5">
                <h3 className="font-semibold text-zinc-900 text-sm tracking-wide mb-4">Score Trend</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={scoreHistory}>
                    <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 9, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontFamily: 'Inter', fontSize: 12 }}
                      formatter={v => [`${v}%`, 'Score']}
                    />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2}
                      dot={{ fill: '#2563eb', r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Weak topics */}
            {analytics?.weakTopics?.length > 0 && (
              <div className="bg-white border border-red-200 rounded-2xl p-5">
                <h3 className="font-semibold text-red-600 text-sm mb-3 flex items-center gap-2">
                  <AlertCircle size={14} />Areas to Improve
                </h3>
                <div className="space-y-2">
                  {analytics.weakTopics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2 text-zinc-600 text-xs font-normal">
                      <span className="w-5 h-5 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center text-xs font-semibold shrink-0">
                        {i + 1}
                      </span>
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent results */}
            {analytics?.recentResults?.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-5">
                <h3 className="font-semibold text-zinc-900 text-sm tracking-wide mb-4">Recent Results</h3>
                <div className="space-y-3">
                  {analytics.recentResults.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-zinc-700 text-xs font-medium truncate">{r.examTitle}</p>
                        <p className="text-zinc-400 text-xs font-normal">{r.subject}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-sm font-bold text-zinc-900">{r.percentage}%</p>
                        <p className={`text-xs font-semibold ${r.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>{r.grade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA if no classrooms */}
            {classrooms.length === 0 && !loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
                <p className="text-blue-700 text-sm font-semibold mb-2">Ready to get started?</p>
                <p className="text-blue-600 text-xs font-normal mb-4">Ask your teacher for a classroom join code</p>
                <button onClick={() => setShowJoin(true)} className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 mx-auto">
                  <Hash size={13} />Enter Code
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showJoin   && <JoinModal   onClose={() => setShowJoin(false)}   onJoin={c => setClassrooms(p => [...p, c])} />}
        {showSubmit && <SubmitModal onClose={() => setShowSubmit(false)} classrooms={classrooms} />}
      </AnimatePresence>
    </div>
  );
}
