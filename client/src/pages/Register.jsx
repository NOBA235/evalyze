import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User, Mail, Lock, Eye, EyeOff, AlertCircle, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo';
export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) { setError('Please select your role'); return; }
    setError(''); setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">

        <div className="text-center mb-8">
         {/* Logo */}
<div className="text-center mb-8">
  <div className="flex justify-center mb-4 scale-75">
    <Logo />
  </div>
</div>
<h1 className="text-3xl font-medium tracking-wide text-zinc-900 mb-2">Create account</h1>
 <p className="text-zinc-500 font-normal text-sm">Join thousands of educators</p>
 </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={15} className="text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-normal">{error}</p>
            </motion.div>
          )}

          {/* Role selector */}
          <div className="mb-6">
            <label className="label">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'teacher', label: 'Teacher',  icon: BookOpen,      desc: 'Create & grade exams' },
                { value: 'student', label: 'Student',  icon: GraduationCap, desc: 'Submit & view results' },
              ].map(({ value, label, icon: Icon, desc }) => (
                <button key={value} type="button" onClick={() => setForm(p => ({ ...p, role: value }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.role === value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}>
                  <Icon size={18} className={form.role === value ? 'text-blue-600' : 'text-zinc-400'} />
                  <div className={`font-semibold text-sm mt-2 ${form.role === value ? 'text-zinc-900' : 'text-zinc-600'}`}>{label}</div>
                  <div className="text-zinc-400 text-xs mt-0.5 font-normal">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="text" className="input-field pl-10" placeholder="Dr. Jane Smith"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="email" className="input-field pl-10" placeholder="you@school.edu"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} minLength={6} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating…</>
                : <>Create Account <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6 font-normal">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
