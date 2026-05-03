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

/** Convert a UTC timestamp to IST date string (YYYY-MM-DD) */
function toISTDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });
}

export function filterPatientsByDate(patients, filter) {
  if (filter === 'all') return patients;

  const todayIST = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });

  if (filter === 'today') {
    return patients.filter(p => {
      if (!p.created_at) return false;
      return toISTDate(p.created_at) === todayIST;
    });
  }

  if (filter === 'week') {
    const [y, m, d] = todayIST.split('-').map(Number);
    const weekAgoDate = new Date(y, m - 1, d - 7);
    const weekStartIST = `${weekAgoDate.getFullYear()}-${String(weekAgoDate.getMonth() + 1).padStart(2, '0')}-${String(weekAgoDate.getDate()).padStart(2, '0')}`;
    return patients.filter(p => {
      if (!p.created_at) return false;
      const itemDate = toISTDate(p.created_at);
      return itemDate >= weekStartIST && itemDate <= todayIST;
    });
  }

  if (filter === 'month') {
    const monthIST = todayIST.slice(0, 7); // YYYY-MM
    return patients.filter(p => {
      if (!p.created_at) return false;
      const itemDate = toISTDate(p.created_at);
      return itemDate && itemDate.startsWith(monthIST);
    });
  }

  return patients;
}

export default memo(DateFilter);
