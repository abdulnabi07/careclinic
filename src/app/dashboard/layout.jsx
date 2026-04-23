"use client";

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { logout } from '../../services/authService';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import OfflineBanner from '../../components/OfflineBanner';
import { PageLoader } from '../../components/Loader';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Role enforcement
    if (user.role === 'worker' && pathname.includes('/admin')) {
      toast.error('Unauthorized — workers cannot access admin area.');
      router.push('/dashboard/worker');
    } else if (pathname === '/dashboard') {
      router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/worker');
    }
  }, [user, loading, pathname, router]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      toast.error('Failed to logout');
    }
  }, [router]);

  if (loading) return <PageLoader />;
  if (!user) return <PageLoader />;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <OfflineBanner />

      {/* Sticky Navbar */}
      <nav className="border-b border-white/8 bg-zinc-900/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-14 items-center gap-3">
            {/* Left — Logo + Role badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">CareConnect</span>
              <span className="hidden sm:inline px-2 py-0.5 bg-zinc-800 rounded-md text-xs text-zinc-400 border border-zinc-700/60 capitalize">
                {user.role}
              </span>
            </div>

            {/* Right — Greeting + Theme + Logout */}
            <div className="flex items-center gap-2">
              {user.name && (
                <span className="text-zinc-300 text-xs font-medium hidden sm:block">
                  Hi, <span className="text-white font-semibold">{user.name.split(' ')[0]}</span>
                </span>
              )}
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/8 transition-all border border-white/8 active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 pb-24">
        {children}
      </main>
    </div>
  );
}
