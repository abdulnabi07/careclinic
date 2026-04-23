"use client";

import { memo } from 'react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

function DateFilter({ value, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-zinc-900/60 border border-white/8 rounded-xl">
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            value === f.key
              ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]'
              : 'text-zinc-500 hover:text-zinc-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function filterPatientsByDate(patients, filter) {
  if (filter === 'all') return patients;
  const now = new Date();
  return patients.filter(p => {
    const created = new Date(p.created_at);
    if (filter === 'today') {
      return created.toDateString() === now.toDateString();
    }
    if (filter === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }
    if (filter === 'month') {
      return (
        created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth()
      );
    }
    return true;
  });
}

export default memo(DateFilter);
