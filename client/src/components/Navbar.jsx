import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, LogOut, ChevronLeft, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ backTo, backLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-white border-b border-zinc-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4 min-w-0">
          {backTo && (
            <Link
              to={backTo}
              className="hidden sm:flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium shrink-0"
            >
              <ChevronLeft size={15} />{backLabel || 'Back'}
            </Link>
          )}
          <Link
            to={user?.role === 'teacher' ? '/teacher' : '/student'}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-semibold text-base tracking-wide text-zinc-900">EVALYZE</span>
          </Link>
        </div>

        {/* Right — desktop */}
        <div className="hidden sm:flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-zinc-700 font-medium">{user?.name}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 capitalize">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium"
          >
            <LogOut size={14} />Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="sm:hidden p-1" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X size={20} className="text-zinc-700" /> : <Menu size={20} className="text-zinc-700" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-zinc-100 bg-white px-4 py-4 space-y-3">
          {backTo && (
            <Link to={backTo} className="flex items-center gap-1 text-zinc-500 text-sm font-medium" onClick={() => setMobileOpen(false)}>
              <ChevronLeft size={15} />{backLabel || 'Back'}
            </Link>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-zinc-700">{user?.name}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 capitalize">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
            <LogOut size={14} />Sign out
          </button>
        </div>
      )}
    </motion.nav>
  );
}
