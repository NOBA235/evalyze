import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ChevronLeft, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo';

export default function Navbar({ backTo, backLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const logoTargetUrl = user
    ? (user.role === 'teacher' ? '/teacher' : '/student')
    : '/';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-white border-b border-zinc-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* LEFT: Back nav + Logo */}
        <div className="flex items-center gap-4 min-w-0">
          {user && backTo && (
            <Link
              to={backTo}
              className="hidden sm:flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium shrink-0"
            >
              <ChevronLeft size={15} />{backLabel || 'Back'}
            </Link>
          )}
          <Link to={logoTargetUrl} className="flex items-center shrink-0">
            <Logo />
          </Link>
        </div>

        {/* MIDDLE: Guest landing links */}
        {!user && (
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-zinc-900 transition-colors">Workflow</a>
            <a href="#testimonials" className="hover:text-zinc-900 transition-colors">Testimonials</a>
          </div>
        )}

        {/* RIGHT: Desktop auth */}
        <div className="hidden sm:flex items-center gap-5">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-zinc-700 font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium"
              >
                <LogOut size={14} />Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                Sign in
              </Link>
             
              <Link to="/register" className="bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-1 focus:outline-none"
          onClick={() => setMobileOpen(o => !o)}
        >
          {mobileOpen ? <X size={20} className="text-zinc-700" /> : <Menu size={20} className="text-zinc-700" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-zinc-100 bg-white px-4 py-4 space-y-4">
          {user ? (
            <div className="space-y-3">
              {backTo && (
                <Link to={backTo} className="flex items-center gap-1 text-zinc-500 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  <ChevronLeft size={15} />{backLabel || 'Back'}
                </Link>
              )}
             
              <div className="flex items-center gap-2 pt-2">
                <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-700">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-zinc-700">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-500 text-sm font-medium pt-2 w-full text-left">
                <LogOut size={14} />Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 font-medium text-sm text-zinc-600">
              <a href="#features" onClick={() => setMobileOpen(false)} className="py-1">Features</a>
              <a href="#workflow" onClick={() => setMobileOpen(false)} className="py-1">Workflow</a>
              <a href="#testimonials" onClick={() => setMobileOpen(false)} className="py-1">Testimonials</a>
              <div className="border-t border-zinc-100 pt-3 flex flex-col gap-2.5">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-center py-2 rounded-md hover:bg-zinc-50">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="bg-zinc-900 text-white text-center py-2 rounded-md font-medium">
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.nav>
  );
}