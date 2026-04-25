"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { login, signup } from '../../services/authService';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      if (isLogin) return login(email, password);
      return signup(email, password, name);
    },
    onSuccess: (data) => {
      if (isLogin) {
        toast.success('Logged in successfully!');
        if (data?.role === 'admin') {
          router.replace('/dashboard/admin');
        } else {
          router.replace('/dashboard/worker');
        }
      } else {
        toast.success('Account created! Please sign in.');
        setIsLogin(true);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Authentication failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error('Please fill in all required fields');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/15 text-blue-400 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 5 9.04 7.96a2.1 2.1 0 0 0 0 2.97l.46.46a2.1 2.1 0 0 0 2.97 0l2.5-2.5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">CareConnect</h1>
            <p className="text-zinc-400 mt-1.5 text-sm">
              {isLogin ? 'Sign in to manage patient records' : 'Create a new account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (signup only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all text-sm"
                placeholder="admin@hospital.com"
                autoComplete="email"
              />
            </div>

            {/* Password with show/hide toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                {/* Eye icon toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    // Eye-off
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Eye
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2 text-sm"
            >
              {mutation.isPending ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
              ) : null}
              {mutation.isPending ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle login/signup */}
          {/* <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setShowPassword(false); }}
              className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              {isLogin ? (
                <span>Don't have an account? <span className="text-blue-400 font-medium">Sign Up</span></span>
              ) : (
                <span>Already have an account? <span className="text-blue-400 font-medium">Sign In</span></span>
              )}
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
