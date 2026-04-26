"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getCurrentUser } from '../services/authService';

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="sticky top-0 z-50 bg-zinc-950 border-b border-white/10">
      <div className="w-full max-w-screen-md mx-auto px-3">
        <div className="flex justify-between h-12 items-center">
          {/* Left — Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">CareConnect</span>
          </div>

          {/* Right — Nav links + greeting + logout */}
          <div className="flex items-center gap-2">
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => router.push('/dashboard')} className="text-xs font-medium text-zinc-400 hover:text-white">Dashboard</button>
              <button onClick={() => router.push('/patients')} className="text-xs font-medium text-zinc-400 hover:text-white">Patients</button>
              {isAdmin && <button onClick={() => router.push('/admin/workers')} className="text-xs font-medium text-zinc-400 hover:text-white">Workers</button>}
              {isAdmin && <button onClick={() => router.push('/settings')} className="text-xs font-medium text-zinc-400 hover:text-white">Settings</button>}
            </div>

            {userName && (
              <span className="text-xs text-zinc-500 hidden md:block">Hi, {userName}</span>
            )}

            <button onClick={handleLogout} className="text-xs font-medium text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              Logout
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1.5 text-zinc-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-zinc-950 px-3 pb-3 pt-2 flex flex-col gap-1">
          {userName && <span className="text-xs text-zinc-500 py-1.5">Hi, {userName}</span>}
          <button onClick={() => { router.push('/dashboard'); setMenuOpen(false); }} className="text-left text-sm text-zinc-300 py-2 px-2 rounded-lg hover:bg-white/5">Dashboard</button>
          <button onClick={() => { router.push('/patients'); setMenuOpen(false); }} className="text-left text-sm text-zinc-300 py-2 px-2 rounded-lg hover:bg-white/5">Patients</button>
          {isAdmin && <button onClick={() => { router.push('/admin/workers'); setMenuOpen(false); }} className="text-left text-sm text-zinc-300 py-2 px-2 rounded-lg hover:bg-white/5">Workers</button>}
          {isAdmin && <button onClick={() => { router.push('/settings'); setMenuOpen(false); }} className="text-left text-sm text-zinc-300 py-2 px-2 rounded-lg hover:bg-white/5">Settings</button>}
        </div>
      )}
    </nav>
  );
}
