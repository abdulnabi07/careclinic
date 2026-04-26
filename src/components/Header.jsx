"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getCurrentUser } from '../services/authService';

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        if (user.name) setUserName(user.name.split(' ')[0]);
        if (user.role === 'admin') setIsAdmin(true);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch {
      alert('Failed to logout');
    }
  };

  return (
    <nav className="border-b border-white/10 bg-zinc-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center gap-3">
          {/* Left — Logo/Name */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">CareConnect</span>
          </div>

          {/* Center/Right - Links */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/patients')}
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Patients
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => router.push('/admin/workers')}
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden md:block"
                >
                  Workers
                </button>
                <button
                  onClick={() => router.push('/settings')}
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Settings
                </button>
              </>
            )}
          </div>

          {/* Right — Greeting + Actions */}
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-sm text-zinc-400 hidden lg:block">
                Hi, {userName}
              </span>
            )}




            <button
              onClick={handleLogout}
              className="text-sm font-medium text-white bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-lg transition-colors border border-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
