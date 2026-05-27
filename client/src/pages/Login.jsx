import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md bg-zinc-900 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg tracking-wide text-zinc-900">EVALYZE</span>
          </Link>
          <h1 className="text-3xl font-medium tracking-wide text-zinc-900 mb-2">Welcome back</h1>
          <p className="text-zinc-500 font-normal text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={15} className="text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-normal">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                <input type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</>
                : <>Sign In <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6 font-normal">
          No account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Create one free</Link>
        </p>
      </motion.div>
    </div>
  );
}
