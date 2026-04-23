"use client";

import { format } from 'date-fns';
import PatientCard from './PatientCard';
import EmptyState from './EmptyState';
import { Loader } from './Loader';

export default function RecentPatients({ patients, loading, onViewAll }) {
  const recent = patients.slice(0, 5);

  return (
    <div className="bg-zinc-900/40 backdrop-blur border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <h3 className="text-sm font-semibold text-white">Recent Patients</h3>
        {patients.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            View All →
          </button>
        )}
      </div>

      <div className="p-3">
        {loading ? (
          <div className="py-8"><Loader /></div>
        ) : recent.length === 0 ? (
          <EmptyState title="No patients yet" subtitle="Add your first patient to get started" />
        ) : (
          <div className="space-y-2">
            {recent.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                  {p.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{p.mobile}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-zinc-500">{format(new Date(p.created_at), 'dd MMM')}</p>
                  {p.services?.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-300 rounded-md">
                      {p.services.length} service{p.services.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
