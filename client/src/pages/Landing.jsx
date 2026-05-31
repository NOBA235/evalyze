import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion'; // Added AnimatePresence for sequencing
import {
  Zap, Brain, BarChart3, Shield, TrendingUp, FileText,
  ArrowRight, Star, Check, MessageCircle, Layout, Rocket, Clock,
  Upload, Sparkles, FileCheck, AlertCircle // Added new icons for the workflow
} from 'lucide-react';
import Logo from '../components/Logo';

// --- Animation Constants ---
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };

// Animation for the workflow cards on the right side
const workflowCardVariants = {
  initial: { opacity: 0, x: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.3 }
  }
};

// Floating animation for the entire right-side container - subtle and continuous
const floatingContainer = {
  animate: {
    y: [-0, -10, 0],
    transition: {
      duration: 5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    }
  }
};

// Reusable FadeUp component 
const FadeUp = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } } }}
      className={className}>
      {children}
    </motion.div>
  );
};

// --- Workflow Animation Component ---
const AnimatedWorkflow = () => {
  // Simulates a 3-step cycle using a counter that loops
  const [step, setStep] = React.useState(0);
  
  // Cycles through steps 0, 1, 2 automatically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 1800); // Change step every 1.8 seconds
    return () => clearInterval(interval);
  }, []);

  // Data for each step of the workflow
  const steps = [
    {
      key: 'upload',
      icon: Upload,
      title: "Upload Answer Sheets",
      detail: "physics_midterm.pdf",
      progress: 85,
      accentColor: "bg-blue-500",
      bgGlow: "shadow-blue-500/20"
    },
    {
      key: 'ai-evaluate',
      icon: Sparkles,
      title: "AI Evaluating...",
      detail: "Checking concepts, logic & accuracy",
      progress: 100, // Indeterminate progress shown differently
      accentColor: "bg-indigo-500",
      bgGlow: "shadow-indigo-500/20"
    },
    {
      key: 'results',
      icon: FileCheck,
      title: "Evaluation Complete",
      detail: "Score: 82/100 · Feedback ready",
      progress: null, 
      accentColor: "bg-emerald-500",
      bgGlow: "shadow-emerald-500/20",
      stats: [
        { label: "Weak Topics", value: "2 detected" },
        { label: "Avg. Time Saved", value: "3.5 hrs" }
      ]
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="relative w-full max-w-md mx-auto lg:ml-auto">
      {/* Background decorative blobs for premium feel */}
      <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl opacity-70 -z-10"></div>
      
      {/* Main floating container */}
      <motion.div
        variants={floatingContainer}
        animate="animate"
        className="relative z-10"
      >
        {/* Glassmorphism card wrapper */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/80 shadow-2xl rounded-2xl p-6 overflow-hidden">
          
          {/* Header of the UI card */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30 p-1.5">
  <svg 
    viewBox="0 0 120 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
   <path
      d="M 90 60 C 90 32, 68 15, 45 22 C 20 30, 10 60, 25 82 C 40 104, 75 104, 90 82"
      stroke="white"
      strokeWidth="14"
      strokeLinecap="round"
    />
    <circle cx="42" cy="53" r="5" fill="white" />
    <circle cx="60" cy="53" r="5" fill="white" />
    <path d="M 43 65 Q 51 74 59 65" stroke="white" strokeWidth="5" strokeLinecap="round" />
  </svg>
</div>
            <div>
              <div className="text-sm font-semibold text-zinc-800">Evalyze AI Grading</div>
              <div className="text-xs text-zinc-500 font-medium">Exam: Physics Mid-Term</div>
            </div>
          </div>

          {/* Step indicator dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                className={`h-1.5 rounded-full transition-all duration-700 ${
                  dot === step ? 'w-8 bg-blue-600' : 'w-1.5 bg-zinc-200'
                }`}
                layout
              />
            ))}
          </div>

          {/* Animated workflow card using AnimatePresence for enter/exit animations */}
          <div className="relative min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.key}
                variants={workflowCardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                {/* Inner card with subtle gradient border */}
                <div className={`rounded-xl border border-white/60 bg-white/90 p-5 shadow-xl ${currentStep.bgGlow} transition-shadow duration-700`}>
                  
                  {/* Icon and Title */}
                  <div className="flex items-start gap-3 mb-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-10 h-10 rounded-xl ${currentStep.accentColor} bg-opacity-10 flex items-center justify-center flex-shrink-0`}
                    >
                      <currentStep.icon size={20} className="text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                    </motion.div>
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-800">{currentStep.title}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">{currentStep.detail}</p>
                    </div>
                  </div>

                  {/* Conditional content based on step */}
                  {/* Step 1: Upload Progress Bar */}
                  {currentStep.key === 'upload' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-500 font-medium">
                        <span>Uploading PDF...</span>
                        <span>{currentStep.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${currentStep.accentColor} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${currentStep.progress}%` }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                      </div>
                      <p className="text-xs text-zinc-400">42 answer sheets detected</p>
                    </div>
                  )}

                  {/* Step 2: AI Evaluation - Pulsing loader */}
                  {currentStep.key === 'ai-evaluate' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-indigo-500"
                        />
                        Analyzing responses...
                      </div>
                      <div className="space-y-2">
                        {['Semantic understanding', 'Step-wise marking', 'Generating feedback'].map((task, i) => (
                          <motion.div
                            key={task}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="flex items-center gap-2 text-xs text-zinc-600"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles size={10} className="text-indigo-400" />
                            </motion.div>
                            {task}...
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Results with stats */}
                  {currentStep.key === 'results' && currentStep.stats && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500">Overall Score</span>
                        <span className="text-lg font-bold text-emerald-600">82/100</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {currentStep.stats.map((stat) => (
                          <div key={stat.label} className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                            <div className="text-xs text-emerald-700 font-semibold">{stat.value}</div>
                            <div className="text-xs text-emerald-600 opacity-80">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1">
                        <Check size={12} className="text-emerald-500" />
                        Teacher review pending
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Bottom decorative gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
        </div>
      </motion.div>
    </div>
  );
};

const features = [
  { icon: Brain,      title: 'Semantic AI Grading',    desc: 'Understands meaning and context — not keyword matching. Rewards conceptually correct answers even when worded differently.', accent: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Zap,        title: 'Instant Evaluation',     desc: 'Evaluate an entire classroom in under a minute. AI processes handwritten and typed answer sheets simultaneously.', accent: 'text-indigo-600', bg: 'bg-indigo-50' },
  { icon: FileText,   title: 'Detailed Feedback',      desc: 'Per-question breakdowns with specific, human-like feedback. Students know exactly where they went wrong and why.', accent: 'text-violet-600', bg: 'bg-violet-50' },
  { icon: BarChart3,  title: 'Classroom Analytics',    desc: 'Grade distributions, weak topic identification, pass/fail rates — all generated automatically after every evaluation.', accent: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Shield,     title: 'Teacher Override',       desc: 'AI suggests marks and feedback. You verify, edit, and approve. You stay in full control of every final grade.', accent: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: TrendingUp, title: 'Student Progress',       desc: 'Every student sees their weak areas, improvement suggestions, and performance trends across exams over time.', accent: 'text-rose-600', bg: 'bg-rose-50' },
];

const workflow = [
  { step: '01', icon: Layout,        title: 'Create Classroom & Exam',  desc: 'Set up a classroom, paste your model answer key, and generate a join code for students.' },
  { step: '02', icon: MessageCircle, title: 'Students Submit',          desc: 'Students join with the code and upload photos or PDFs of their handwritten or typed answer sheets.' },
  { step: '03', icon: Zap,           title: 'AI Evaluates Everything',  desc: 'One click triggers Gemini Vision to read, compare, grade, and generate feedback for every submission.' },
  { step: '04', icon: Check,         title: 'Review & Approve',         desc: 'Review AI results, override any mark, add private notes, and publish final grades to students.' },
];

const testimonials = [
  { name: 'Dr. Tain Aier',  role: 'Physics Professor, Kohima Science College',          quote: 'Evalyze cut my grading time from 6 hours to 20 minutes per exam. The feedback quality is remarkably human-like.', stars: 5 },
  { name: 'Prof. Raj Mehta', role: 'Chemistry Teacher, Kohima Science', quote: 'It correctly awarded partial marks for an answer that used different terminology than my key. The semantic understanding is real.', stars: 5 },
];

const stats = [
  { value: '10×',  label: 'Faster grading' },
  { value: '98%',  label: 'Accuracy rate'  },
  { value: '100+',  label: 'Sheets evaluated' },
  { value: '4+', label: 'Teachers using'  },
];

export default function Landing() {
  return (
    <div className="bg-blue-700 overflow-x-hidden">

      {/* ── HERO: Two-Column Modern Layout ── */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 bg-gradient-to-br from-blue-200 via-white to-blue-50/30 overflow-hidden">
        
        {/* --- Background Decorative Gradients (Soft blurred circles) --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top-right gradient blob */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl opacity-60"></div>
          {/* Bottom-left gradient blob */}
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl opacity-50"></div>
          {/* Center subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-100/40 via-white/10 to-purple-100/40 rounded-full blur-3xl opacity-40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two-column grid: Left text, Right animation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* --- LEFT COLUMN: Headline, Description, CTAs --- */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center lg:text-left"
            >
              <motion.h1 variants={fadeUp} className="heading-xl text-zinc-900 mb-6 max-w-2xl">
                AI Assistant{" "}
                <span 
                  style={{ 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    backgroundImage: 'linear-gradient(to right, #22d3ee, #8b5cf6)'
                  }}
                >
                  For Educators
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg md:text-xl text-zinc-600 font-normal max-w-xl mb-10 leading-relaxed">
                Automate grading, feedback generation, and classroom performance analysis. Stop spending hours on answer sheets.
                Evalyze evaluates thousands of answer sheets in minute.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register" className="btn-primary flex items-center gap-2 group px-10 py-4">
                  Start Free Today
                  <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
                    <ArrowRight size={15} />
                  </motion.div>
                </Link>
                <Link to="/login" className="btn-ghost px-10 py-4">Sign In</Link>
              </motion.div>

              {/* Trust text */}
              <motion.p variants={fadeUp} className="text-xs text-zinc-500 font-medium mt-4">
                Free to use · No credit card required
              </motion.p>
            
              <motion.div variants={fadeUp} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg lg:max-w-none">
                {stats.map(({ value, label }) => (
                  <div key={label} className="border border-zinc-200/70 rounded-xl p-3 bg-white/80 backdrop-blur-sm text-center hover:shadow-md transition-shadow">
                    <div className="font-semibold text-2xl text-zinc-900 tracking-wide">{value}</div>
                    <div className="text-zinc-500 text-xs mt-0.5 font-medium">{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* --- RIGHT COLUMN: Animated Workflow UI --- */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <AnimatedWorkflow />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Dashboard preview ── */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-10">
            <p className="section-label mb-3">The dashboard</p>
            <h2 className="heading-lg text-zinc-900">Everything in one place</h2>
          </FadeUp>
          <FadeUp>
            <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-xl">
              {/* Fake browser bar */}
              <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-2.5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                <span className="ml-4 text-zinc-400 text-xs font-mono">evalyze.app — Teacher Dashboard</span>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Submissions',  val: '47', sub: '+12 today',          color: 'text-blue-600' },
                    { label: 'AI Evaluated', val: '39', sub: '83% complete',        color: 'text-indigo-600' },
                    { label: 'Avg Score',    val: '72%', sub: '↑ 4% vs last exam', color: 'text-emerald-600' },
                  ].map(({ label, val, sub, color }) => (
                    <div key={label} className="border border-zinc-100 rounded-xl p-3 sm:p-4 bg-zinc-50">
                      <div className="text-zinc-500 text-xs mb-1">{label}</div>
                      <div className={`font-semibold text-xl sm:text-2xl ${color}`}>{val}</div>
                      <div className="text-zinc-400 text-xs mt-0.5">{sub}</div>
                    </div>
                  ))}
                </div>
                <div className="border border-zinc-100 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50">
                        {['Student', 'Exam', 'Status', 'Marks', 'Action'].map(h => (
                          <th key={h} className="text-left px-3 sm:px-4 py-2.5 text-zinc-500 font-semibold tracking-wide uppercase text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Arjun Sharma', exam: 'Physics Mid-Term', status: 'AI Checked',       statusCls: 'text-indigo-700 bg-indigo-50',   marks: '78/100' },
                        { name: 'Priya Patel',  exam: 'Physics Mid-Term', status: 'Approved',          statusCls: 'text-emerald-700 bg-emerald-50', marks: '91/100' },
                        { name: 'Rohan Das',    exam: 'Physics Mid-Term', status: 'Evaluating…',       statusCls: 'text-amber-700 bg-amber-50',     marks: '—' },
                        { name: 'Sneha Iyer',   exam: 'Physics Mid-Term', status: 'Submitted',         statusCls: 'text-blue-700 bg-blue-50',       marks: '—' },
                      ].map(row => (
                        <tr key={row.name} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                          <td className="px-3 sm:px-4 py-3 text-zinc-800 font-medium">{row.name}</td>
                          <td className="px-3 sm:px-4 py-3 text-zinc-500 hidden sm:table-cell">{row.exam}</td>
                          <td className="px-3 sm:px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.statusCls}`}>{row.status}</span></td>
                          <td className="px-3 sm:px-4 py-3 font-mono text-zinc-700">{row.marks}</td>
                          <td className="px-3 sm:px-4 py-3"><button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Review →</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
{/* ─── Features Section with Custom Illustrations ─── */}
<section id="features" className="bg-white py-16 md:py-24 overflow-hidden">
  <div className="max-w-6xl mx-auto px-4 sm:px-6">
    <FadeUp className="text-center mb-12">
      <p className="section-label mb-3">Capabilities</p>
      <h2 className="heading-lg text-zinc-900 mb-4">Everything a teacher needs</h2>
      <p className="text-zinc-600 max-w-lg mx-auto font-normal">Built specifically for academic evaluation — not a generic AI chatbot.</p>
    </FadeUp>

    {/* Feature Illustrations SVG Component */}
    <div className="hidden">
      {/* Semantic AI Grading Illustration */}
      <svg id="illustration-semantic" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Brain/Neural Network Pattern */}
        <circle cx="100" cy="60" r="45" stroke="#DBEAFE" strokeWidth="2" fill="none" />
        <circle cx="100" cy="60" r="30" stroke="#BFDBFE" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        {/* Neural nodes */}
        <circle cx="70" cy="40" r="4" fill="#3B82F6" opacity="0.8" />
        <circle cx="130" cy="40" r="4" fill="#3B82F6" opacity="0.8" />
        <circle cx="100" cy="80" r="4" fill="#3B82F6" opacity="0.8" />
        <circle cx="55" cy="65" r="3" fill="#60A5FA" opacity="0.6" />
        <circle cx="145" cy="65" r="3" fill="#60A5FA" opacity="0.6" />
        <circle cx="100" cy="30" r="3" fill="#93C5FD" opacity="0.5" />
        {/* Connections */}
        <line x1="70" y1="40" x2="100" y2="80" stroke="#BFDBFE" strokeWidth="1.5" />
        <line x1="130" y1="40" x2="100" y2="80" stroke="#BFDBFE" strokeWidth="1.5" />
        <line x1="70" y1="40" x2="130" y2="40" stroke="#BFDBFE" strokeWidth="1" />
        <line x1="55" y1="65" x2="70" y2="40" stroke="#DBEAFE" strokeWidth="1" />
        <line x1="145" y1="65" x2="130" y2="40" stroke="#DBEAFE" strokeWidth="1" />
        {/* Central processing indicator */}
        <circle cx="100" cy="60" r="8" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
        <path d="M97 60h6M100 57v6" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* Instant Evaluation Illustration */}
      <svg id="illustration-instant" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Lightning bolt with speed lines */}
        <path d="M105 25L85 60H100L90 95L120 58H105L115 25H105Z" fill="#4F46E5" opacity="0.9" />
        <path d="M105 25L85 60H100L90 95L120 58H105L115 25H105Z" fill="url(#instantGradient)" />
        {/* Speed lines */}
        <path d="M60 35L75 35" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M55 45L80 45" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M125 65L150 65" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M120 75L145 75" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        {/* Clock indicator */}
        <circle cx="70" cy="85" r="15" stroke="#C7D2FE" strokeWidth="1.5" fill="#EEF2FF" />
        <path d="M70 78v7l4 4" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" />
        <defs>
          <linearGradient id="instantGradient" x1="85" y1="25" x2="120" y2="95">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Detailed Feedback Illustration */}
      <svg id="illustration-feedback" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Document with feedback marks */}
        <rect x="40" y="20" width="120" height="85" rx="4" stroke="#C4B5FD" strokeWidth="1.5" fill="#F5F3FF" />
        {/* Text lines */}
        <rect x="55" y="35" width="90" height="4" rx="2" fill="#DDD6FE" />
        <rect x="55" y="45" width="75" height="4" rx="2" fill="#DDD6FE" />
        <rect x="55" y="55" width="85" height="4" rx="2" fill="#DDD6FE" />
        <rect x="55" y="65" width="65" height="4" rx="2" fill="#DDD6FE" />
        {/* Feedback annotations */}
        <circle cx="140" cy="37" r="8" fill="#7C3AED" opacity="0.15" />
        <path d="M136 37l8 0M140 33l0 8" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        <path d="M125 62l20 8" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
        {/* Checkmark */}
        <circle cx="145" cy="75" r="10" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="1.5" />
        <path d="M140 75l3 3l5-6" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Analytics Illustration */}
      <svg id="illustration-analytics" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bar chart */}
        <rect x="45" y="55" width="12" height="40" rx="2" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="1" />
        <rect x="65" y="35" width="12" height="60" rx="2" fill="#A7F3D0" stroke="#34D399" strokeWidth="1" />
        <rect x="85" y="45" width="12" height="50" rx="2" fill="#6EE7B7" stroke="#10B981" strokeWidth="1" />
        <rect x="105" y="25" width="12" height="70" rx="2" fill="#34D399" stroke="#059669" strokeWidth="1" />
        <rect x="125" y="40" width="12" height="55" rx="2" fill="#6EE7B7" stroke="#10B981" strokeWidth="1" />
        {/* Trend line */}
        <path d="M51 50L71 30L91 40L111 20L131 35" stroke="#059669" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="51" cy="50" r="2" fill="#059669" />
        <circle cx="71" cy="30" r="2" fill="#059669" />
        <circle cx="91" cy="40" r="2" fill="#059669" />
        <circle cx="111" cy="20" r="2" fill="#059669" />
        <circle cx="131" cy="35" r="2" fill="#059669" />
        {/* Bottom axis */}
        <line x1="40" y1="95" x2="145" y2="95" stroke="#D1D5DB" strokeWidth="1" />
      </svg>

      {/* Teacher Control Illustration */}
      <svg id="illustration-control" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield with checkmark */}
        <path d="M100 25L60 40V65C60 82 77 95 100 100C123 95 140 82 140 65V40L100 25Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
        <path d="M85 60l10 10l20-25" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Control sliders */}
        <rect x="50" y="105" width="20" height="4" rx="2" fill="#FDE68A" />
        <circle cx="60" cy="107" r="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
        <rect x="80" y="105" width="20" height="4" rx="2" fill="#FDE68A" />
        <circle cx="95" cy="107" r="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
        <rect x="110" y="105" width="20" height="4" rx="2" fill="#FDE68A" />
        <circle cx="125" cy="107" r="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
      </svg>

      {/* Student Progress Illustration */}
      <svg id="illustration-progress" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Growth curve */}
        <path d="M30 90Q60 90 75 70Q95 40 115 45Q135 50 145 30Q155 10 170 25" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Data points */}
        <circle cx="30" cy="90" r="3" fill="#FDA4AF" />
        <circle cx="75" cy="70" r="3" fill="#FB7185" />
        <circle cx="115" cy="45" r="3" fill="#F43F5E" />
        <circle cx="170" cy="25" r="3" fill="#E11D48" />
        {/* Upward arrow */}
        <path d="M170 40l0 15M162.5 32.5l7.5 7.5l7.5-7.5" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Person icon */}
        <circle cx="35" cy="30" r="8" fill="#FFE4E6" stroke="#FDA4AF" strokeWidth="1.5" />
        <path d="M22 48Q35 38 48 48" stroke="#FDA4AF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>

    {/* Feature Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {[
        {
          icon: Brain,
          title: 'Semantic AI Grading',
          desc: 'Understands meaning and context — not keyword matching. Rewards conceptually correct answers even when worded differently.',
          accent: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          illustration: 'illustration-semantic',
          gradientFrom: 'from-blue-50',
          gradientTo: 'to-blue-100/50'
        },
        {
          icon: Zap,
          title: 'Instant Evaluation',
          desc: 'Evaluate an entire classroom in under a minute. AI processes handwritten and typed answer sheets simultaneously.',
          accent: 'text-indigo-600',
          bg: 'bg-indigo-50',
          border: 'border-indigo-100',
          illustration: 'illustration-instant',
          gradientFrom: 'from-indigo-50',
          gradientTo: 'to-indigo-100/50'
        },
        {
          icon: FileText,
          title: 'Detailed Feedback',
          desc: 'Per-question breakdowns with specific, human-like feedback. Students know exactly where they went wrong and why.',
          accent: 'text-violet-600',
          bg: 'bg-violet-50',
          border: 'border-violet-100',
          illustration: 'illustration-feedback',
          gradientFrom: 'from-violet-50',
          gradientTo: 'to-violet-100/50'
        },
        {
          icon: BarChart3,
          title: 'Classroom Analytics',
          desc: 'Grade distributions, weak topic identification, pass/fail rates — all generated automatically after every evaluation.',
          accent: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          illustration: 'illustration-analytics',
          gradientFrom: 'from-emerald-50',
          gradientTo: 'to-emerald-100/50'
        },
        {
          icon: Shield,
          title: 'Teacher Override',
          desc: 'AI suggests marks and feedback. You verify, edit, and approve. You stay in full control of every final grade.',
          accent: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          illustration: 'illustration-control',
          gradientFrom: 'from-amber-50',
          gradientTo: 'to-amber-100/50'
        },
        {
          icon: TrendingUp,
          title: 'Student Progress',
          desc: 'Every student sees their weak areas, improvement suggestions, and performance trends across exams over time.',
          accent: 'text-rose-600',
          bg: 'bg-rose-50',
          border: 'border-rose-100',
          illustration: 'illustration-progress',
          gradientFrom: 'from-rose-50',
          gradientTo: 'to-rose-100/50'
        }
      ].map(({ icon: Icon, title, desc, accent, bg, border, illustration, gradientFrom, gradientTo }, index) => (
        <FadeUp key={title} delay={index * 0.1}>
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            className={`relative group bg-white border ${border} rounded-2xl p-6 
              hover:shadow-xl transition-all duration-300 overflow-hidden`}
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 
                group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} className={accent} />
              </div>
              
              {/* Illustration */}
              <div className="mb-4 h-32 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 120">
                  <use href={`#${illustration}`} />
                </svg>
              </div>
              
              {/* Content */}
              <h3 className="font-semibold text-zinc-900 mb-2 tracking-wide group-hover:text-zinc-800">
                {title}
              </h3>
              <p className="text-zinc-600 text-sm leading-relaxed font-normal group-hover:text-zinc-700">
                {desc}
              </p>
            </div>
            
            {/* Decorative corner gradient */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/50 to-transparent 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-3xl" />
          </motion.div>
        </FadeUp>
      ))}
    </div>
  </div>
</section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-12">
            <p className="section-label mb-3">Don't just trust us</p>
            <h2 className="heading-lg text-zinc-900">What educators are saying</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map(({ name, role, quote, stars }, i) => (
              <FadeUp key={name} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4 }} className="card h-full hover:shadow-xl">
                  <div className="flex gap-1 mb-4">
                    {Array(stars).fill(0).map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-zinc-700 font-normal leading-relaxed mb-4 italic">"{quote}"</p>
                  <div className="pt-4 border-t border-zinc-100">
                    <p className="font-semibold text-zinc-900 text-sm">{name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{role}</p>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-20 md:py-28 bg-zinc-900 text-white text-center overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <FadeUp>
            <h2 className="heading-lg text-white mb-6">Ready to transform grading?</h2>
            <p className="text-zinc-400 font-normal mb-8 text-lg">
              Join educators saving 30+ hours per term with AI-powered evaluation.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-zinc-900 px-10 py-4 text-sm tracking-wider font-semibold hover:bg-zinc-100 transition-all group">
              Start for Free
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
                <ArrowRight size={15} />
              </motion.div>
            </Link>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500 font-medium">
              <span>No credit card</span><span>·</span>
              <span>Free forever</span><span>·</span>
              <span>AI by Google Gemini</span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-zinc-950 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
       <div className="flex items-center gap-2">
  <Logo />
</div>
<p className="text-zinc-600 text-xs text-center">© 2025 Evalyze. MIT License. Built for the Devpost AI Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}