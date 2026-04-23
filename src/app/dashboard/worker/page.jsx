"use client";

import { useQuery } from '@tanstack/react-query';
import { getPatients } from '../../../services/patientService';
import AddPatientForm from '../../../components/AddPatientForm';
import PatientCard from '../../../components/PatientCard';
import QuickAddButton from '../../../components/QuickAddButton';
import EmptyState from '../../../components/EmptyState';
import DateFilter, { filterPatientsByDate } from '../../../components/DateFilter';
import SearchInput from '../../../components/SearchInput';
import { SkeletonPatientGrid } from '../../../components/SkeletonCard';
import { useState, useMemo } from 'react';

export default function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => getPatients('worker')
  });

  const filteredPatients = useMemo(() => {
    let list = filterPatientsByDate(patients, dateFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) || p.mobile?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [patients, search, dateFilter]);

  const today = new Date().toDateString();
  const todayCount = patients.filter(p => new Date(p.created_at).toDateString() === today).length;

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'add_patient', label: 'Add Patient' },
    { key: 'history', label: 'History' },
  ];

  return (
    <>
      <QuickAddButton onClick={() => setActiveTab('add_patient')} />

      <div className="space-y-5">
        {/* Tab Bar */}
        <div className="flex gap-1 p-1 bg-zinc-900/60 rounded-2xl overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-fit px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.35)]' : 'text-zinc-400 hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 border border-white/8 rounded-2xl p-4">
                <p className="text-zinc-500 text-xs mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-blue-400">{patients.length}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/8 rounded-2xl p-4">
                <p className="text-zinc-500 text-xs mb-1">Today</p>
                <p className="text-2xl font-bold text-emerald-400">{todayCount}</p>
              </div>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <h3 className="text-sm font-semibold text-white">Recent Patients</h3>
                {patients.length > 0 && (
                  <button onClick={() => setActiveTab('history')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    View All →
                  </button>
                )}
              </div>
              <div className="p-3 space-y-2">
                {isLoading ? (
                  <div className="py-6 flex justify-center">
                    <span className="animate-spin h-5 w-5 border-2 border-white/10 border-t-blue-400 rounded-full" />
                  </div>
                ) : patients.length === 0 ? (
                  <EmptyState title="No patients yet" subtitle="Add your first patient" />
                ) : (
                  patients.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                        {p.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{p.mobile}</p>
                      </div>
                      {p.services?.length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-300 rounded-md flex-shrink-0">
                          {p.services.length} svc
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADD PATIENT */}
        {activeTab === 'add_patient' && (
          <div className="max-w-3xl">
            <div className="mb-4">
              <h2 className="text-white font-semibold text-base">Add New Patient</h2>
              <p className="text-zinc-500 text-sm mt-1">Fill in the details and select services</p>
            </div>
            <AddPatientForm />
          </div>
        )}

        {/* HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-base">Patient History</h2>
                <p className="text-zinc-500 text-sm">{filteredPatients.length} records</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <DateFilter value={dateFilter} onChange={setDateFilter} />
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search name or mobile…"
                  className="w-full sm:w-52"
                />
              </div>
            </div>

            {isLoading ? (
              <SkeletonPatientGrid count={6} />
            ) : filteredPatients.length === 0 ? (
              <EmptyState
                title={search || dateFilter !== 'all' ? 'No results found' : 'No patients yet'}
                subtitle={search ? `No match for "${search}"` : 'Add your first patient below'}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPatients.map(p => (
                  <PatientCard key={p.id} patient={p} showAmount={false} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
