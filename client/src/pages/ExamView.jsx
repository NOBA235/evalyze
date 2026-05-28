import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCheck, BarChart3, RefreshCw, X, ChevronRight, FileText } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import { examAPI, submissionAPI, evaluationAPI, analyticsAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AnalyticsPanel = ({ examId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    analyticsAPI.exam(examId).then(r => setData(r.data.analytics)).finally(() => setLoading(false));
  }, [examId]);

  const GRADE_COLORS = { 'A+': '#059669', A: '#2563eb', 'B+': '#7c3aed', B: '#6d28d9', C: '#d97706', D: '#ea580c', F: '#dc2626' };
  const gradeData = data ? Object.entries(data.gradeDistribution || {}).filter(([, v]) => v > 0).map(([g, count]) => ({ grade: g, count })) : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 sticky top-0 bg-white">
          <h2 className="font-medium text-xl tracking-wide text-zinc-900 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" />Exam Analytics</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
        </div>
        {loading ? <div className="p-12 flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          : !data ? <div className="p-12 text-center text-zinc-500 font-normal">No evaluated submissions yet</div>
          : (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Average',   val: `${data.average}%`,  color: 'text-blue-600' },
                  { label: 'Highest',   val: `${data.highest}%`,  color: 'text-emerald-600' },
                  { label: 'Lowest',    val: `${data.lowest}%`,   color: 'text-red-600' },
                  { label: 'Pass Rate', val: `${data.passRate}%`, color: 'text-indigo-600' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="border border-zinc-100 rounded-xl p-4 text-center bg-zinc-50">
                    <p className="text-zinc-500 text-xs mb-1 font-medium">{label}</p>
                    <p className={`font-semibold text-2xl ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
              {gradeData.length > 0 && (
                <div>
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">Grade Distribution</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={gradeData}>
                      <XAxis dataKey="grade" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontFamily: 'Inter', fontSize: 12 }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {gradeData.map(entry => <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade] || '#2563eb'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div>
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">Student Scores</p>
                <div className="space-y-2">
                  {data.students?.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-zinc-600 text-xs font-normal w-28 truncate">{s.name}</span>
                      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.percentage}%` }} transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${s.percentage >= 70 ? 'bg-emerald-500' : s.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
                      </div>
                      <span className="text-xs font-mono text-zinc-500 w-10 text-right">{s.percentage}%</span>
                      <span className={`text-xs font-semibold w-6 ${s.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>{s.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </motion.div>
    </motion.div>
  );
};

export default function ExamView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState({});
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [polling, setPolling] = useState(false);
  const isTeacher = user?.role === 'teacher';

  const fetchData = useCallback(async () => {
    try {
      const [examRes, subRes] = await Promise.all([
        examAPI.get(id),
        isTeacher ? submissionAPI.getByExam(id) : submissionAPI.getMy(),
      ]);
      setExam(examRes.data.exam);
      const subs = isTeacher ? subRes.data.submissions : subRes.data.submissions.filter(s => (s.exam?._id || s.exam) === id);
      setSubmissions(subs);
    } catch (err) { console.error(err); }
  }, [id, isTeacher]);

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, [fetchData]);

  useEffect(() => {
    const hasEval = submissions.some(s => s.status === 'evaluating');
    if (hasEval && !polling) {
      setPolling(true);
      const iv = setInterval(() => fetchData(), 3000);
      return () => { clearInterval(iv); setPolling(false); };
    }
  }, [submissions, polling, fetchData]);

  const handleEvaluate = async (submissionId) => {
    setEvaluating(p => ({ ...p, [submissionId]: true }));
    try { await evaluationAPI.trigger(submissionId); await fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setEvaluating(p => ({ ...p, [submissionId]: false })); }
  };

  const handleBatchEvaluate = async () => {
    const ids = submissions.filter(s => s.status === 'submitted').map(s => s._id);
    if (!ids.length) return;
    await evaluationAPI.batch(ids).catch(() => {});
    await fetchData();
  };

  const handleApprove = async (submissionId) => {
    await evaluationAPI.approve(submissionId).catch(() => {});
    await fetchData();
  };

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" /></div>;

  const evaluatedCount = submissions.filter(s => ['ai_checked','teacher_approved'].includes(s.status)).length;
  const approvedCount  = submissions.filter(s => s.status === 'teacher_approved').length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Exam header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${exam?.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{exam?.status}</span>
                <span className="text-zinc-400 text-sm">{exam?.subject}</span>
              </div>
              <h1 className="font-semibold text-xl sm:text-2xl tracking-wide text-zinc-900">{exam?.title}</h1>
              {exam?.instructions && <p className="text-zinc-500 text-sm mt-2 font-normal max-w-xl">{exam.instructions}</p>}
              <div className="flex items-center gap-4 mt-3 text-zinc-400 text-xs flex-wrap">
                <span>{exam?.totalMarks} total marks</span>
                {exam?.deadline && <span>Due {new Date(exam.deadline).toLocaleDateString()}</span>}
                <span>{exam?.duration} min</span>
              </div>
            </div>
            {isTeacher && submissions.length > 0 && (
              <div className="flex gap-2 flex-wrap shrink-0">
                <button onClick={() => setShowAnalytics(true)} className="btn-ghost text-xs py-2.5 px-4 flex items-center gap-1.5">
                  <BarChart3 size={14} />Analytics
                </button>
                <button onClick={handleBatchEvaluate} className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5">
                  <Zap size={14} />Evaluate All
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        {isTeacher && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Submissions', val: submissions.length,                                               color: 'text-zinc-900' },
              { label: 'Evaluated',   val: evaluatedCount,                                                  color: 'text-blue-600' },
              { label: 'Approved',    val: approvedCount,                                                   color: 'text-emerald-600' },
              { label: 'Pending',     val: submissions.filter(s => s.status === 'submitted').length,         color: 'text-amber-600' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-zinc-400 text-xs mb-1 font-medium">{label}</p>
                <p className={`font-semibold text-2xl ${color}`}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Submissions table */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 tracking-wide">{isTeacher ? 'Submissions' : 'My Submission'}</h2>
            {polling && (
              <span className="flex items-center gap-2 text-amber-600 text-xs font-medium">
                <RefreshCw size={12} className="animate-spin" />Evaluating…
              </span>
            )}
          </div>

          {submissions.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={28} className="text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-400 font-normal text-sm">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    {[isTeacher && 'Student', 'Submitted', 'Status', 'Marks', isTeacher && 'Action'].filter(Boolean).map(h => (
                      <th key={h} className="text-left px-4 sm:px-5 py-3 text-zinc-500 font-semibold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, i) => (
                    <motion.tr key={sub._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                      {isTeacher && <td className="px-4 sm:px-5 py-3.5 text-zinc-800 text-sm font-medium">{sub.student?.name}</td>}
                      <td className="px-4 sm:px-5 py-3.5 text-zinc-500 text-xs">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                      <td className="px-4 sm:px-5 py-3.5"><StatusBadge status={sub.status} /></td>
                      <td className="px-4 sm:px-5 py-3.5">
                        {sub.evaluation
                          ? <span className="font-mono text-sm font-semibold text-zinc-900">{sub.evaluation.finalMarks}<span className="text-zinc-400">/{exam?.totalMarks}</span> <span className={`text-xs font-semibold ${sub.evaluation.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>{sub.evaluation.grade}</span></span>
                          : <span className="text-zinc-300 text-sm">—</span>}
                      </td>
                      {isTeacher && (
                        <td className="px-4 sm:px-5 py-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {sub.status === 'submitted' && (
                              <button onClick={() => handleEvaluate(sub._id)} disabled={evaluating[sub._id]}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50">
                                {evaluating[sub._id] ? <RefreshCw size={11} className="animate-spin" /> : <Zap size={11} />}
                                {evaluating[sub._id] ? 'Starting…' : 'Evaluate'}
                              </button>
                            )}
                            {sub.status === 'ai_checked' && (
                              <button onClick={() => handleApprove(sub._id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors">
                                <CheckCheck size={11} />Approve
                              </button>
                            )}
                            <Link to={`/submission/${sub._id}`}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-100 transition-colors">
                              View <ChevronRight size={11} />
                            </Link>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showAnalytics && <AnalyticsPanel examId={id} onClose={() => setShowAnalytics(false)} />}
      </AnimatePresence>
    </div>
  );
}
