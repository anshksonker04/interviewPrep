import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, BookOpen, Bookmark, BarChart3,
  User as UserIcon, ShieldAlert, LogOut, Sun, Moon, Menu, X, Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { label: 'Dashboard',        path: '/',          icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Practice Quizzes', path: '/quizzes',   icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Bookmarks',        path: '/bookmarks', icon: <Bookmark className="w-4 h-4" /> },
    { label: 'Analytics',        path: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Profile',          path: '/profile',   icon: <UserIcon className="w-4 h-4" /> },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ label: 'Admin Panel', path: '/admin', icon: <ShieldAlert className="w-4 h-4" /> });
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-zinc-800/60 dark:border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/40 shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">PrepPortal</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5 font-medium">Technical Interviews</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest px-3 mb-2">
          Navigation
        </p>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path ||
            (link.path !== '/' && location.pathname.startsWith(link.path));
          const isAdmin = link.path === '/admin';
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-violet-600/15 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 dark:border-violet-500/15'
                  : isAdmin
                    ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/8 dark:hover:bg-amber-500/8'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
              )}
            >
              <span className={cn(isActive ? 'text-violet-600 dark:text-violet-400' : 'opacity-70')}>
                {link.icon}
              </span>
              {link.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-zinc-200/60 dark:border-white/[0.04] pt-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-violet-600/15 dark:bg-violet-500/10 border border-violet-500/20 dark:border-violet-500/15 flex items-center justify-center text-violet-700 dark:text-violet-400 text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate leading-none">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/8 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#080808] text-zinc-900 dark:text-zinc-100">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-zinc-200/70 dark:border-white/[0.04] bg-white dark:bg-[#0d0d0d] sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative z-10 w-60 h-full bg-white dark:bg-[#0d0d0d] border-r border-zinc-200 dark:border-white/[0.04] animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top bar */}
        <header className="h-14 shrink-0 sticky top-0 z-40 bg-white/80 dark:bg-[#080808]/90 backdrop-blur-xl border-b border-zinc-200/60 dark:border-white/[0.04] flex items-center px-5 gap-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-600">
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">
              {navLinks.find(l => l.path === location.pathname || (l.path !== '/' && location.pathname.startsWith(l.path)))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Role badge */}
            <span className={cn(
              'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border hidden sm:inline-flex',
              user?.role === 'admin'
                ? 'badge-amber'
                : 'badge-violet'
            )}>
              {user?.role === 'admin' ? 'Admin' : 'Student'}
            </span>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all border border-transparent hover:border-zinc-200 dark:hover:border-white/[0.08]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto animate-fade-in pb-20">
          {children}
        </main>
      </div>
    </div>
  );
};
