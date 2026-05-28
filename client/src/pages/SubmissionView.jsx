import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Edit3, Save, X, Brain, AlertTriangle, Lightbulb, Target, BarChart3, Zap, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import { submissionAPI, evaluationAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const GradeRing = ({ percentage, grade }) => {
  const r = 38, circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage >= 70 ? '#059669' : percentage >= 40 ? '#d97706' : '#dc2626';
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f4f4f5" strokeWidth="6" />
        <motion.circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <div className="text-center z-10">
        <div className="font-semibold text-zinc-900 text-lg leading-none">{grade}</div>
        <div className="text-zinc-400 text-xs mt-0.5">{percentage}%</div>
      </div>
    </div>
  );
};

const Tags = ({ items, color = 'blue' }) => {
  const cls = { blue: 'bg-blue-50 text-blue-700 border-blue-200', red: 'bg-red-50 text-red-700 border-red-200', green: 'bg-emerald-50 text-emerald-700 border-emerald-200', amber: 'bg-amber-50 text-amber-700 border-amber-200' };
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium border ${cls[color] || cls.blue}`}>{item}</span>)}
    </div>
  );
};

const QuestionCard = ({ q, index }) => {
  const cfg = { correct: { border: 'border-emerald-200 bg-emerald-50/30', badge: 'bg-emerald-50 text-emerald-700' }, partial: { border: 'border-amber-200 bg-amber-50/30', badge: 'bg-amber-50 text-amber-700' }, incorrect: { border: 'border-red-200 bg-red-50/30', badge: 'bg-red-50 text-red-700' } };
  const c = cfg[q.status] || cfg.incorrect;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={`border-2 rounded-2xl p-5 ${c.border}`}>
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-900 text-sm">Q{q.questionNumber}</span>
          {q.questionText && <span className="text-zinc-500 text-xs">{q.questionText}</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${c.badge}`}>{q.status}</span>
          <span className="font-mono text-sm font-bold text-zinc-900">{q.marksAwarded}<span className="text-zinc-400">/{q.maxMarks}</span></span>
        </div>
      </div>
      {q.studentAnswer && (
        <div className="mb-3">
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Student Answer</p>
          <p className="text-zinc-700 text-sm font-normal leading-relaxed bg-white border border-zinc-200 rounded-xl p-3">{q.studentAnswer}</p>
        </div>
      )}
      {q.feedback && (
        <div className="pt-3 border-t border-zinc-200/50">
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">AI Feedback</p>
          <p className="text-zinc-600 text-sm font-normal leading-relaxed">{q.feedback}</p>
        </div>
      )}
    </motion.div>
  );
};

const OverrideModal = ({ evaluation, exam, onClose, onSave }) => {
  const [marks, setMarks] = useState(evaluation?.teacherMarks ?? evaluation?.aiMarks ?? 0);
  const [feedback, setFeedback] = useState(evaluation?.teacherFeedback || evaluation?.aiFeedback || '');
  const [comments, setComments] = useState(evaluation?.teacherComments || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await evaluationAPI.override(evaluation.submission, { teacherMarks: Number(marks), teacherFeedback: feedback, teacherComments: comments });
      onSave(data.evaluation); onClose();
    } catch { alert('Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="bg-white border border-zinc-200 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-medium text-xl tracking-wide text-zinc-900 flex items-center gap-2"><Edit3 size={18} className="text-blue-600" />Override Evaluation</h2>
            <p className="text-zinc-500 text-xs mt-1 font-normal">Adjust AI-generated marks and feedback</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="label">Marks <span className="text-zinc-400 normal-case tracking-normal font-normal">/ {exam?.totalMarks}</span></label>
            <div className="flex items-center gap-3">
              <input type="number" className="input-field w-28" min={0} max={exam?.totalMarks} value={marks} onChange={e => setMarks(e.target.value)} />
              <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min((marks / exam?.totalMarks) * 100, 100)}%` }} />
              </div>
              <span className="text-blue-600 font-semibold font-mono text-sm w-12 text-right">{Math.round((marks / exam?.totalMarks) * 100)}%</span>
            </div>
          </div>
          <div>
            <label className="label">Feedback for Student</label>
            <textarea className="input-field resize-none" rows={4} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Write feedback visible to the student…" />
          </div>
          <div>
            <label className="label">Internal Notes <span className="text-zinc-400 normal-case tracking-normal font-normal">(private)</span></label>
            <textarea className="input-field resize-none" rows={2} value={comments} onChange={e => setComments(e.target.value)} placeholder="Private notes, not shown to student…" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 py-3">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 py-3 flex justify-center items-center gap-2 disabled:opacity-50">
            {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : <><Save size={14} />Save Override</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function SubmissionView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOverride, setShowOverride] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const isTeacher = user?.role === 'teacher';

  const fetchData = async () => {
    const { data } = await submissionAPI.get(id);
    setSubmission(data.submission); setEvaluation(data.evaluation); setExam(data.submission?.exam);
  };

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, [id]);
  useEffect(() => {
    if (submission?.status === 'evaluating') {
      const iv = setInterval(fetchData, 3000);
      return () => clearInterval(iv);
    }
  }, [submission?.status]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try { await evaluationAPI.trigger(id); await fetchData(); }
    catch { alert('Failed to start evaluation'); }
    finally { setEvaluating(false); }
  };

  const handleApprove = async () => {
    await evaluationAPI.approve(id); await fetchData();
  };

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <StatusBadge status={submission?.status} />
                {evaluation?.isOverridden && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-violet-50 text-violet-700 border border-violet-200">Teacher Override</span>}
              </div>
              <h1 className="font-semibold text-xl tracking-wide text-zinc-900">{exam?.title}</h1>
              <p className="text-zinc-500 text-sm font-normal">{exam?.subject} · Submitted {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '—'}</p>
              {isTeacher && <p className="text-blue-600 text-sm font-medium mt-1">Student: {submission?.student?.name}</p>}
            </div>
            {isTeacher && (
              <div className="flex flex-wrap gap-2 shrink-0">
                {submission?.status === 'submitted' && (
                  <button onClick={handleEvaluate} disabled={evaluating} className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 disabled:opacity-50">
                    {evaluating ? <><RefreshCw size={13} className="animate-spin" />Starting…</> : <><Zap size={13} />Evaluate</>}
                  </button>
                )}
                {evaluation && submission?.status !== 'teacher_approved' && (
                  <button onClick={() => setShowOverride(true)} className="btn-ghost text-xs py-2.5 px-4 flex items-center gap-1.5">
                    <Edit3 size={13} />Override
                  </button>
                )}
                {submission?.status === 'ai_checked' && (
                  <button onClick={handleApprove} className="flex items-center gap-1.5 px-4 py-2.5 rounded-none border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors">
                    <CheckCheck size={13} />Approve
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Evaluating state */}
        {submission?.status === 'evaluating' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-zinc-200 rounded-2xl p-10 mb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-2 border-zinc-200 rounded-full" />
              <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <Brain size={22} className="absolute inset-0 m-auto text-blue-600" />
            </div>
            <h3 className="font-medium text-zinc-900 text-lg tracking-wide mb-2">AI is Evaluating</h3>
            <p className="text-zinc-500 text-sm font-normal">Extracting answers · comparing with key · generating feedback…</p>
            <p className="text-zinc-400 text-xs mt-2">Usually takes 15–30 seconds</p>
          </motion.div>
        )}

        {/* Results */}
        {evaluation && (
          <div className="space-y-5">
            {/* Score overview */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <GradeRing percentage={evaluation.percentage} grade={evaluation.grade} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-4xl text-zinc-900">{evaluation.finalMarks}</span>
                    <span className="text-zinc-500 font-normal">/ {exam?.totalMarks} marks</span>
                    {evaluation.isOverridden && <span className="text-violet-600 text-xs font-semibold">(teacher adjusted)</span>}
                  </div>
                  <p className={`text-sm font-semibold mb-3 ${evaluation.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {evaluation.isPassed ? '✓ Passed' : '✗ Failed'}
                  </p>
                  <p className="text-zinc-600 text-sm font-normal leading-relaxed">{evaluation.finalFeedback || evaluation.aiFeedback}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  {[
                    { label: 'AI Marks',    val: evaluation.aiMarks,    color: 'text-blue-600' },
                    { label: 'Final Marks', val: evaluation.finalMarks, color: evaluation.isOverridden ? 'text-violet-600' : 'text-emerald-600' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="border border-zinc-100 rounded-xl p-3 text-center bg-zinc-50">
                      <p className="text-zinc-400 text-xs mb-1">{label}</p>
                      <p className={`font-semibold text-xl ${color}`}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Topic tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {evaluation.weakTopics?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-white border border-zinc-200 rounded-2xl p-5">
                  <h3 className="font-semibold text-red-600 text-sm mb-3 flex items-center gap-2"><AlertTriangle size={14} />Weak Areas</h3>
                  <Tags items={evaluation.weakTopics} color="red" />
                </motion.div>
              )}
              {evaluation.strongTopics?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                  className="bg-white border border-zinc-200 rounded-2xl p-5">
                  <h3 className="font-semibold text-emerald-600 text-sm mb-3 flex items-center gap-2"><Target size={14} />Strong Areas</h3>
                  <Tags items={evaluation.strongTopics} color="green" />
                </motion.div>
              )}
            </div>

            {/* Missed concepts */}
            {evaluation.missedConcepts?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white border border-amber-200 rounded-2xl p-5">
                <h3 className="font-semibold text-amber-700 text-sm mb-3 flex items-center gap-2"><Brain size={14} />Missed Concepts</h3>
                <ul className="space-y-2">{evaluation.missedConcepts.map((c, i) => <li key={i} className="flex items-start gap-2 text-zinc-600 text-sm font-normal"><span className="text-amber-500 mt-0.5">•</span>{c}</li>)}</ul>
              </motion.div>
            )}

            {/* Suggestions */}
            {evaluation.improvementSuggestions?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="bg-white border border-blue-200 rounded-2xl p-5">
                <h3 className="font-semibold text-blue-700 text-sm mb-3 flex items-center gap-2"><Lightbulb size={14} />Improvement Suggestions</h3>
                <ol className="space-y-2">{evaluation.improvementSuggestions.map((s, i) => <li key={i} className="flex items-start gap-2 text-zinc-600 text-sm font-normal"><span className="text-blue-500 font-mono text-xs mt-0.5 w-5 shrink-0">{String(i + 1).padStart(2, '0')}.</span>{s}</li>)}</ol>
              </motion.div>
            )}

            {/* Question breakdown */}
            {evaluation.aiQuestionBreakdown?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="font-semibold text-zinc-900 tracking-wide mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-blue-600" />Question Breakdown</h2>
                <div className="space-y-3">{evaluation.aiQuestionBreakdown.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}</div>
              </motion.div>
            )}

            {/* Extracted text for teacher */}
            {isTeacher && evaluation.extractedAnswerText && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
                <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Extracted Answer Text (OCR)</h3>
                <pre className="text-zinc-500 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">{evaluation.extractedAnswerText}</pre>
              </motion.div>
            )}

            {/* Teacher comments */}
            {isTeacher && evaluation.teacherComments && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
                <h3 className="font-semibold text-violet-700 text-sm mb-2">Your Internal Notes</h3>
                <p className="text-zinc-600 text-sm font-normal">{evaluation.teacherComments}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Not evaluated yet */}
        {!evaluation && submission?.status === 'submitted' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-zinc-200 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-4">
              <Brain size={28} className="text-zinc-400" />
            </div>
            <h3 className="font-medium text-zinc-900 text-lg tracking-wide mb-2">Not Evaluated Yet</h3>
            <p className="text-zinc-500 text-sm font-normal mb-6">{isTeacher ? 'Click Evaluate to start AI evaluation' : 'Your teacher will evaluate this submission soon'}</p>
            {isTeacher && (
              <button onClick={handleEvaluate} disabled={evaluating} className="btn-primary flex items-center gap-2 mx-auto disabled:opacity-50">
                {evaluating ? <><RefreshCw size={14} className="animate-spin" />Starting…</> : <><Zap size={14} />Start Evaluation</>}
              </button>
            )}
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showOverride && <OverrideModal evaluation={evaluation} exam={exam} onClose={() => setShowOverride(false)} onSave={setEvaluation} />}
      </AnimatePresence>
    </div>
  );
}
