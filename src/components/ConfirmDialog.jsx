"use client";

import { useState } from 'react';

export default function ConfirmDialog({ title = "Are you sure?", message = "This action cannot be undone.", onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">{title}</h3>
            <p className="text-zinc-400 text-sm mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-300 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to use the confirm dialog
export function useConfirmDialog() {
  const [state, setState] = useState({ open: false, resolve: null, title: '', message: '' });

  const confirm = ({ title, message }) =>
    new Promise(resolve => {
      setState({ open: true, resolve, title, message });
    });

  const handleConfirm = () => {
    state.resolve(true);
    setState(s => ({ ...s, open: false }));
  };

  const handleCancel = () => {
    state.resolve(false);
    setState(s => ({ ...s, open: false }));
  };

  const Dialog = state.open ? (
    <ConfirmDialog
      title={state.title}
      message={state.message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, Dialog };
}
