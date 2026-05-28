import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Upload, TrendingUp, Award, X, Hash,
  AlertCircle, ChevronRight, FileText, ArrowRight,
  Plus, BarChart3, Clock, CheckCircle2, GraduationCap
} from 'lucide-react';
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
          <h2 className="font-semibold text-lg text-zinc-900">Join Classroom</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Classroom Code</label>
            <div className="relative">
              <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 
                  focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                  transition-all font-mono tracking-[0.3em] uppercase text-center text-lg placeholder:text-zinc-300"
                placeholder="ENTER CODE" maxLength={8}
                value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
            <p className="text-zinc-400 text-xs mt-2">Ask your teacher for the 8-character code</p>
          </div>
          <button type="submit" disabled={loading || code.length < 4}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed
              text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]
              flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Joining…</>
            ) : 'Join Classroom'}
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
          <h2 className="font-semibold text-lg text-zinc-900">Submit Answer Sheet</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Select Exam</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 
                focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                transition-all text-zinc-900"
              value={examId} onChange={e => setExamId(e.target.value)} required>
              <option value="">Choose an exam…</option>
              {exams.map(ex => (
                <option key={ex._id} value={ex._id}>{ex.title} — {ex.subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Upload Files</label>
            <label className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed 
              cursor-pointer transition-all ${
              files.length > 0 
                ? 'border-blue-400 bg-blue-50/50' 
                : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50'
            }`}>
              <Upload size={28} className={`mb-3 ${files.length > 0 ? 'text-blue-500' : 'text-zinc-400'}`} />
              <span className={`text-sm font-medium ${files.length > 0 ? 'text-blue-600' : 'text-zinc-600'}`}>
                {files.length > 0 ? `${files.length} file(s) selected` : 'Click to choose files'}
              </span>
              <span className="text-zinc-400 text-xs mt-1">JPG, PNG, PDF · Max 20 MB each</span>
              <input type="file" multiple accept="image/*,.pdf" className="hidden"
                onChange={e => setFiles(Array.from(e.target.files))} />
            </label>

            {files.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg text-xs text-zinc-600">
                    <FileText size={12} className="text-blue-500 shrink-0" />
                    <span className="truncate">{f.name}</span>
                    <span className="text-zinc-400 shrink-0">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <button type="submit" disabled={loading || !examId || files.length === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed
              text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]
              flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading…</>
            ) : 'Submit Answer Sheet'}
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
    { 
      label: 'Enrolled Classes', 
      val: classrooms.length, 
      icon: BookOpen, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Submissions', 
      val: submissions.length, 
      icon: FileText, 
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600'
    },
    { 
      label: 'Average Score', 
      val: analytics?.averageScore ? `${analytics.averageScore}%` : '—', 
      icon: BarChart3, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    { 
      label: 'Exams Passed', 
      val: analytics?.passed ?? '—', 
      icon: CheckCircle2, 
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-zinc-500 text-sm font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ── Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap size={18} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Student Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Track your progress and manage submissions</p>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowJoin(true)}
                className="px-5 py-3 bg-white border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50
                  text-zinc-700 hover:text-blue-700 rounded-xl font-medium text-sm transition-all
                  flex items-center gap-2 shadow-sm"
              >
                <Plus size={16} />
                Join Classroom
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSubmit(true)} 
                disabled={classrooms.length === 0}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed
                  text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2
                  shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <Upload size={16} />
                Submit Answer Sheet
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, val, icon: Icon, color, bgColor, iconColor }, i) => (
            <motion.div 
              key={label} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
              className="group relative bg-white border border-zinc-200/60 rounded-2xl p-5 
                hover:border-zinc-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-zinc-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center mb-3 
                  ring-1 ring-zinc-900/5 group-hover:scale-110 transition-transform`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <p className={`text-2xl font-bold text-zinc-900 tracking-tight`}>{val}</p>
                <p className="text-zinc-500 text-xs font-medium mt-1">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Classrooms Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg text-zinc-900">My Classrooms</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">{classrooms.length} active classroom{classrooms.length !== 1 ? 's' : ''}</p>
                </div>
                {classrooms.length > 0 && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowJoin(true)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                    title="Join new classroom"
                  >
                    <Plus size={18} />
                  </motion.button>
                )}
              </div>

              {classrooms.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={28} className="text-blue-400" />
                  </div>
                  <p className="text-zinc-700 font-medium mb-2">No classrooms yet</p>
                  <p className="text-zinc-400 text-sm mb-6">Join a classroom to get started with your learning journey</p>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowJoin(true)} 
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium
                      shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                  >
                    Join Your First Classroom
                  </motion.button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {classrooms.map((cls, i) => (
                    <motion.div 
                      key={cls._id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link to={`/classroom/${cls._id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gradient-to-r 
                          hover:from-blue-50/50 hover:to-transparent transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                              group-hover:scale-110 transition-transform"
                              style={{ 
                                background: `linear-gradient(135deg, ${cls.coverColor}15, ${cls.coverColor}25)`,
                                border: `1.5px solid ${cls.coverColor}40`
                              }}>
                              <BookOpen size={16} style={{ color: cls.coverColor }} />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-zinc-900 text-sm font-semibold group-hover:text-blue-600 
                              transition-colors truncate">
                              {cls.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-zinc-400 text-xs">{cls.subject}</span>
                              <span className="text-zinc-300">·</span>
                              <span className="text-zinc-400 text-xs">{cls.teacher?.name}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-zinc-300 group-hover:text-blue-500 
                          group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Submissions Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="px-6 py-5 border-b border-zinc-100">
                <div>
                  <h2 className="font-semibold text-lg text-zinc-900">Recent Submissions</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">{submissions.length} total submission{submissions.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-violet-400" />
                  </div>
                  <p className="text-zinc-700 font-medium mb-2">No submissions yet</p>
                  <p className="text-zinc-400 text-sm">Submit your first answer sheet to see it here</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {submissions.slice(0, 5).map((sub, i) => (
                    <motion.div 
                      key={sub._id} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link to={`/submission/${sub._id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gradient-to-r 
                          hover:from-violet-50/50 hover:to-transparent transition-all group"
                      >
                        <div className="min-w-0 mr-3 flex-1">
                          <p className="text-zinc-900 text-sm font-semibold group-hover:text-violet-600 
                            transition-colors truncate">
                            {sub.exam?.title || 'Untitled Exam'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-zinc-400 text-xs">{sub.exam?.subject}</span>
                            <span className="text-zinc-300">·</span>
                            <span className="text-zinc-400 text-xs flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {sub.evaluation && (
                            <div className="text-right">
                              <p className="font-mono text-sm font-bold text-zinc-900">
                                {sub.evaluation.finalMarks}
                                <span className="text-zinc-400 font-normal">/{sub.exam?.totalMarks}</span>
                              </p>
                              <p className={`text-xs font-semibold ${
                                sub.evaluation.isPassed ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {sub.evaluation.grade}
                              </p>
                            </div>
                          )}
                          <StatusBadge status={sub.status} size="sm" />
                          <ChevronRight size={14} className="text-zinc-300 group-hover:text-violet-500 
                            group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {submissions.length > 5 && (
                <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                    View all submissions <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Analytics Sidebar */}
          <div className="space-y-5">
            
            {/* Score Trend */}
            {scoreHistory.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-blue-600" />
                  <h3 className="font-semibold text-sm text-zinc-900">Score Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={scoreHistory}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#a1a1aa', fontSize: 10 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: '#a1a1aa', fontSize: 10 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip
                      contentStyle={{ 
                        background: '#fff', 
                        border: '1px solid #e4e4e7', 
                        borderRadius: 12, 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: 12 
                      }}
                      formatter={v => [`${v}%`, 'Score']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#2563eb" 
                      strokeWidth={2.5}
                      dot={{ fill: '#fff', stroke: '#2563eb', strokeWidth: 2, r: 4 }} 
                      activeDot={{ fill: '#2563eb', stroke: '#fff', strokeWidth: 2, r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Weak Topics */}
            {analytics?.weakTopics?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-red-200/60 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={16} className="text-red-500" />
                  <h3 className="font-semibold text-sm text-red-600">Areas to Improve</h3>
                </div>
                <div className="space-y-2.5">
                  {analytics.weakTopics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                      <span className="w-6 h-6 rounded-lg bg-red-50 border border-red-200 
                        text-red-600 flex items-center justify-center text-xs font-bold shrink-0
                        group-hover:bg-red-100 transition-colors">
                        {i + 1}
                      </span>
                      <span className="text-zinc-600 text-sm group-hover:text-zinc-900 transition-colors">
                        {topic}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Results */}
            {analytics?.recentResults?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Award size={16} className="text-amber-600" />
                  <h3 className="font-semibold text-sm text-zinc-900">Recent Results</h3>
                </div>
                <div className="space-y-3">
                  {analytics.recentResults.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 group">
                      <div className="min-w-0 flex-1">
                        <p className="text-zinc-700 text-sm font-medium truncate group-hover:text-zinc-900 transition-colors">
                          {r.examTitle}
                        </p>
                        <p className="text-zinc-400 text-xs">{r.subject}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-sm font-bold text-zinc-900">{r.percentage}%</p>
                        <p className={`text-xs font-semibold ${
                          r.isPassed ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {r.grade}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Getting Started CTA */}
            {classrooms.length === 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 
                  rounded-2xl p-6 text-white shadow-lg shadow-blue-500/25"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <GraduationCap size={24} className="text-blue-200 mb-3" />
                  <p className="font-semibold text-lg mb-2">Ready to get started?</p>
                  <p className="text-blue-100 text-sm mb-4">
                    Ask your teacher for a classroom code and begin your learning journey
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowJoin(true)} 
                    className="px-5 py-2.5 bg-white text-blue-600 rounded-xl text-sm font-semibold
                      hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Hash size={14} />
                    Enter Join Code
                  </motion.button>
                </div>
              </motion.div>
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