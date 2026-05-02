"use client";

import { memo } from 'react';
import { getTodayRangeIST } from '../utils/dateFilter';
import { parseDateSafe } from '../utils/dateUtils';

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
  const { start, end } = getTodayRangeIST();
  return patients.filter(p => {
    if (filter === 'today') {
      const created = parseDateSafe(p.created_at);
      return created >= start && created <= end;
    }
    const created = parseDateSafe(p.created_at);
    if (filter === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo.getTime();
    }
    if (filter === 'month') {
      const createdDate = new Date(created);
      return (
        createdDate.getFullYear() === now.getFullYear() &&
        createdDate.getMonth() === now.getMonth()
      );
    }
    return true;
  });
}

export default memo(DateFilter);
