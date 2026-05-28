import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronLeft, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo';

export default function Navbar({ backTo, backLabel }) {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Never show authenticated UI on the public landing page, even if a user
  // happens to be logged in. This prevents the user's name leaking into the
  // landing page navbar.
  const isLandingPage = location.pathname === '/';

  // Show authenticated UI only when: properly authenticated AND not on landing
  const showAuthenticatedUI = isAuthenticated && user && !loading && !isLandingPage;

  // Safer logo target - default to '/' if not properly authenticated
  const logoTargetUrl = showAuthenticatedUI
    ? (user.role === 'teacher' ? '/teacher' : '/student')
    : '/';

  // Loading state - show minimal navbar
  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center shrink-0">
            <Logo />
          </Link>
        </div>
      </nav>
    );
  }

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
          {showAuthenticatedUI && backTo && (
            <Link
              to={backTo}
              className="hidden sm:flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium shrink-0"
            >
              <ChevronLeft size={15} />
              {backLabel || 'Back'}
            </Link>
          )}
          <Link to={logoTargetUrl} className="flex items-center shrink-0">
            <Logo />
          </Link>
        </div>

        {/* MIDDLE: Guest landing links - ONLY when NOT authenticated */}
        {!showAuthenticatedUI && (
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-zinc-900 transition-colors">Workflow</a>
            <a href="#testimonials" className="hover:text-zinc-900 transition-colors">Testimonials</a>
          </div>
        )}

        {/* RIGHT: Desktop auth */}
        <div className="hidden sm:flex items-center gap-5">
          {showAuthenticatedUI ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-semibold text-blue-700">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-sm text-zinc-700 font-medium">
                  {user?.name || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-red-600 transition-colors text-sm font-medium"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ?
            <X size={20} className="text-zinc-700" /> :
            <Menu size={20} className="text-zinc-700" />
          }
        </button>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden border-t border-zinc-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              {showAuthenticatedUI ? (
                <div className="space-y-4">
                  {backTo && (
                    <Link
                      to={backTo}
                      className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <ChevronLeft size={16} />
                      {backLabel || 'Back'}
                    </Link>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-semibold text-blue-700">
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-zinc-900 block">
                        {user?.name || 'User'}
                      </span>
                      <span className="text-xs text-zinc-500 capitalize">
                        {user?.role || 'student'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium w-full px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <a
                    href="#features"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#workflow"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    Workflow
                  </a>
                  <a
                    href="#testimonials"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    Testimonials
                  </a>

                  <div className="border-t border-zinc-100 pt-3 mt-2 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}