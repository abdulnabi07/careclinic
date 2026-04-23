"use client";

import { SkeletonCard } from './Loader';

const CARDS = [
  {
    key: 'todayRev',
    label: 'Today Revenue',
    color: 'emerald',
    prefix: '₹',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    )
  },
  {
    key: 'monthlyRev',
    label: 'Monthly Revenue',
    color: 'blue',
    prefix: '₹',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  },
  {
    key: 'totalPatients',
    label: 'Total Patients',
    color: 'violet',
    prefix: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    )
  },
  {
    key: 'todayPatients',
    label: "Today's Patients",
    color: 'amber',
    prefix: '',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  },
];

const COLORS = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/15',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/15',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/15',
};

const VALUE_COLORS = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  violet: 'text-violet-400',
  amber: 'text-amber-400',
};

export default function DashboardCards({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {CARDS.map(c => <SkeletonCard key={c.key} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {CARDS.map(card => (
        <div
          key={card.key}
          className="bg-zinc-900/50 backdrop-blur border border-white/8 rounded-2xl p-4 md:p-5 hover:border-white/15 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] group"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-500 text-xs font-medium">{card.label}</p>
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${COLORS[card.color]}`}>
              {card.icon}
            </div>
          </div>
          <p className={`text-2xl md:text-3xl font-bold ${VALUE_COLORS[card.color]}`}>
            {card.prefix}{(data?.[card.key] ?? 0).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
