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

/** Same logic as calculateReports — single source of truth */
const getIST = (d) =>
  new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export function filterPatientsByDate(patients, filter) {
  if (filter === 'all') return patients;

  const now = new Date();

  if (filter === 'today') {
    const todayIST = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata"
    });
    return patients.filter(p => p.created_at && getIST(p.created_at) === todayIST);
  }

  if (filter === 'week') {
    return patients.filter(p => {
      if (!p.created_at) return false;
      const diff = (now - new Date(p.created_at)) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < 7;
    });
  }

  if (filter === 'month') {
    return patients.filter(p => {
      if (!p.created_at) return false;
      const dDate = new Date(p.created_at);
      return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
    });
  }

  return patients;
}

export default memo(DateFilter);
