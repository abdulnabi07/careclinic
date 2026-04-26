"use client";

import { useState } from 'react';
import { signup } from '../services/authService';

export default function WorkerManagement() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name);
      alert('Worker created successfully! Note: You have been logged in as the new worker due to Supabase Auth rules. Please logout and log back in as Admin if you need to continue administrative tasks.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      alert('Failed to create worker: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 md:p-6 mt-8 max-w-2xl">
      <h2 className="text-lg font-semibold text-white mb-1">Worker Management</h2>
      <p className="text-sm text-zinc-400 mb-6">Create a new worker account. Workers can add patients and view the patient list, but cannot see financial data.</p>
      
      <form onSubmit={handleCreateWorker} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">FULL NAME</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="John Doe"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="worker@hospital.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Minimum 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
        >
          {loading ? 'Creating...' : 'Create Worker'}
        </button>
      </form>
    </div>
  );
}
