"use client";

import { useState, useEffect } from 'react';
import { signup } from '../services/authService';
import { supabase } from '../lib/supabaseClient';

export default function WorkerManagement() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState([]);

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('role', 'worker').order('created_at', { ascending: false });
      if (data) setWorkers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name);
      setName('');
      setEmail('');
      setPassword('');
      // Force reload or redirect to login so the user knows they are now logged in as the new worker
      window.location.href = '/dashboard';
    } catch (err) {
      alert('Failed to create worker: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-screen-md mx-auto flex flex-col gap-6">
      {/* Create worker form */}
      <div className="bg-zinc-900/60 border border-white/[0.08] rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-1">Add New Worker</h2>
        <p className="text-sm text-zinc-400 mb-5">Workers can add patients and view records, but cannot see financial data.</p>

        <form onSubmit={handleCreateWorker} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">FULL NAME</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="worker@hospital.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors pr-10"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Creating...' : 'Create Worker'}
          </button>
        </form>
      </div>

      {/* Workers list */}
      <div className="bg-zinc-900/60 border border-white/[0.08] rounded-2xl p-5">
        <h3 className="text-base font-semibold text-white mb-4">
          Workers <span className="text-zinc-500 font-normal text-sm">({workers.length})</span>
        </h3>
        <div className="flex flex-col gap-2">
          {workers.map(worker => (
            <div key={worker.id} className="p-3 bg-zinc-950 border border-white/5 rounded-xl">
              <p className="text-sm font-medium text-white">{worker.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{worker.email || 'Email not in profile'}</p>
            </div>
          ))}
          {workers.length === 0 && (
            <p className="text-sm text-zinc-500">No workers found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

