import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, User, Mail, Lock, Eye, EyeOff, AlertCircle, 
  GraduationCap, BookOpen, ArrowRight, CheckCircle, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('role'); // 'role' | 'details'
  const { register, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const dashboardPath = user.role === 'teacher' ? '/teacher' : '/student';
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleRoleSelect = (role) => {
    setForm(p => ({ ...p, role }));
    setError('');
    setStep('details');
  };

  const handleBack = () => {
    setStep('role');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) { 
      setError('Please select your role'); 
      setStep('role');
      return; 
    }
    
    // Basic validation
    if (!form.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!form.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(''); 
    setLoading(true);
    try {
      const registeredUser = await register(form);
      const dashboardPath = registeredUser.role === 'teacher' ? '/teacher' : '/student';
      navigate(dashboardPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setStep('details');
    } finally { 
      setLoading(false); 
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render registration form if already authenticated
  if (isAuthenticated && user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 flex items-center justify-center px-4 py-8 sm:py-12">
      <motion.div 
        initial={{ opacity: 0, y: 24 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="w-full max-w-md"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-6"
          >
            <Logo />
          </motion.div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            {step === 'role' ? 'Join GradeAssist' : 'Create your account'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {step === 'role' 
              ? 'Choose your role to get started' 
              : 'Fill in your details to continue'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
            step === 'role' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
              : 'bg-emerald-500 text-white'
          }`}>
            {step === 'details' ? <CheckCircle size={16} /> : '1'}
          </div>
          <div className={`w-12 h-0.5 rounded-full transition-all ${
            step === 'details' ? 'bg-blue-600' : 'bg-zinc-200'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
            step === 'details' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
              : 'bg-zinc-100 text-zinc-400 border-2 border-zinc-200'
          }`}>
            2
          </div>
        </div>

        {/* Main Card */}
        <motion.div 
          layout
          className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm"
        >
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6"
              >
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Role Selection */}
          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <label className="block text-sm font-medium text-zinc-700 mb-3">
                  I want to use GradeAssist as a...
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { 
                      value: 'teacher', 
                      label: 'Teacher', 
                      icon: BookOpen, 
                      desc: 'Create exams, manage classrooms & grade with AI',
                      features: ['AI-powered grading', 'Classroom management', 'Detailed analytics']
                    },
                    { 
                      value: 'student', 
                      label: 'Student', 
                      icon: GraduationCap, 
                      desc: 'Submit answer sheets & track your progress',
                      features: ['Easy submissions', 'Instant feedback', 'Performance tracking']
                    },
                  ].map(({ value, label, icon: Icon, desc, features }) => (
                    <motion.button 
                      key={value} 
                      type="button" 
                      onClick={() => handleRoleSelect(value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        form.role === value
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl ${
                          form.role === value ? 'bg-blue-100' : 'bg-zinc-100'
                        }`}>
                          <Icon size={22} className={form.role === value ? 'text-blue-600' : 'text-zinc-500'} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold text-base ${
                            form.role === value ? 'text-zinc-900' : 'text-zinc-700'
                          }`}>
                            {label}
                          </div>
                          <div className="text-zinc-500 text-sm mt-1">{desc}</div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {features.map((feature, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-zinc-100 text-zinc-600 rounded-lg">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Step 2: Registration Form */
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1 mb-4 transition-colors"
                >
                  ← Back to role selection
                </button>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Full name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 
                          focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                          transition-all text-sm"
                        placeholder="Dr. Jane Smith"
                        value={form.name} 
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                        required 
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="email" 
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 
                          focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                          transition-all text-sm"
                        placeholder="you@school.edu"
                        value={form.email} 
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type={showPass ? 'text' : 'password'} 
                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 
                          focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                          transition-all text-sm"
                        placeholder="Min. 6 characters"
                        value={form.password} 
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))} 
                        minLength={6} 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPass(!showPass)} 
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 
                          hover:text-zinc-600 transition-colors p-1"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-zinc-400 text-xs mt-1.5">
                      Must be at least 6 characters long
                    </p>
                  </div>

                  {/* Selected Role Badge */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                    {form.role === 'teacher' ? (
                      <BookOpen size={14} className="text-blue-600" />
                    ) : (
                      <GraduationCap size={14} className="text-blue-600" />
                    )}
                    <span className="text-sm text-blue-700 font-medium capitalize">
                      Registering as {form.role}
                    </span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 
                      disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all 
                      flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 
                      hover:shadow-blue-500/40 mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account 
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-sm mt-6">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}