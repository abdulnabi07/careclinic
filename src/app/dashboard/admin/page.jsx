"use client";
// Prevent static prerendering — this route requires Supabase Auth at runtime
export const dynamic = 'force-dynamic';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayRevenue, getMonthlyRevenue, getPatients, deletePatient } from '../../../services/patientService';
import { getWorkers, createWorker, deleteWorker } from '../../../services/userService';
import AddPatientForm from '../../../components/AddPatientForm';
import DashboardCards from '../../../components/DashboardCards';
import PatientCard, { playSuccessSound } from '../../../components/PatientCard';
import RecentPatients from '../../../components/RecentPatients';
import QuickAddButton from '../../../components/QuickAddButton';
import EmptyState from '../../../components/EmptyState';
import { useConfirmDialog } from '../../../components/ConfirmDialog';
import DateFilter, { filterPatientsByDate } from '../../../components/DateFilter';
import SearchInput from '../../../components/SearchInput';
import { SkeletonPatientGrid, SkeletonStatCard } from '../../../components/SkeletonCard';
import { useState, useMemo, memo, useCallback } from 'react';
import { toast } from 'sonner';

// Memoised worker row
const WorkerRow = memo(function WorkerRow({ w, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
        {w.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{w.name || 'Unnamed'}</p>
        <p className="text-xs text-zinc-500 truncate">{w.email}</p>
      </div>
      <span className="px-2 py-0.5 bg-violet-500/10 text-violet-300 border border-violet-500/15 rounded-md text-xs capitalize flex-shrink-0">{w.role}</span>
      <button
        onClick={() => onDelete(w.id)}
        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/15 text-red-400 flex items-center justify-center transition-all active:scale-90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  );
});

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [workerName, setWorkerName] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const { confirm, Dialog: ConfirmDeleteDialog } = useConfirmDialog();

  const { data: todayRev = 0, isLoading: revLoading } = useQuery({ queryKey: ['revenue', 'today'], queryFn: getTodayRevenue });
  const { data: monthlyRev = 0 } = useQuery({ queryKey: ['revenue', 'monthly'], queryFn: getMonthlyRevenue });
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => getPatients('admin')
  });
  const { data: workers = [] } = useQuery({ queryKey: ['workers'], queryFn: getWorkers });

  const today = new Date().toDateString();
  const todayPatients = patients.filter(p => new Date(p.created_at).toDateString() === today).length;
  const cardData = { todayRev, monthlyRev, totalPatients: patients.length, todayPatients };

  // Combined filter: date + search (debounced)
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

  const deletePatientMut = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      playSuccessSound();
      toast.success('Patient deleted');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
    },
    onError: (e) => toast.error('Failed to delete: ' + e.message)
  });

  const handleDeletePatient = useCallback(async (id) => {
    const ok = await confirm({ title: 'Delete Patient?', message: 'This cannot be undone.' });
    if (ok) deletePatientMut.mutate(id);
  }, [confirm, deletePatientMut]);

  const createWorkerMut = useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      playSuccessSound();
      toast.success('Worker created successfully');
      setWorkerName(''); setWorkerEmail(''); setWorkerPassword('');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (e) => toast.error('Error: ' + e.message)
  });

  const deleteWorkerMut = useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => {
      toast.success('Worker removed');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (e) => toast.error('Error removing worker: ' + e.message)
  });

  const handleDeleteWorker = useCallback(async (id) => {
    const ok = await confirm({ title: 'Remove Worker?', message: 'This will remove their access.' });
    if (ok) deleteWorkerMut.mutate(id);
  }, [confirm, deleteWorkerMut]);

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'add_patient', label: 'Add Patient' },
    { key: 'history', label: 'History' },
    { key: 'workers', label: 'Workers' },
  ];

  return (
    <>
      {ConfirmDeleteDialog}
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
            {revLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[0,1,2,3].map(i => <SkeletonStatCard key={i} />)}
              </div>
            ) : (
              <DashboardCards data={cardData} loading={false} />
            )}
            <RecentPatients patients={patients} loading={patientsLoading} onViewAll={() => setActiveTab('history')} />
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
                  className="w-full sm:w-56"
                />
              </div>
            </div>

            {patientsLoading ? (
              <SkeletonPatientGrid count={6} />
            ) : filteredPatients.length === 0 ? (
              <EmptyState
                title={search || dateFilter !== 'all' ? 'No results found' : 'No patients yet'}
                subtitle={search ? `No match for "${search}"` : 'Add your first patient to get started'}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPatients.map(p => (
                  <PatientCard key={p.id} patient={p} showAmount canEdit onDelete={handleDeletePatient} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* WORKERS */}
        {activeTab === 'workers' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2">
              <form onSubmit={e => { e.preventDefault(); createWorkerMut.mutate({ name: workerName, email: workerEmail, password: workerPassword }); }}
                className="bg-zinc-900/60 p-5 rounded-2xl border border-white/8 space-y-3">
                <h3 className="text-white font-semibold text-sm">Add New Worker</h3>
                {[
                  { v: workerName, s: setWorkerName, t: 'text', p: 'Full Name' },
                  { v: workerEmail, s: setWorkerEmail, t: 'email', p: 'Email Address' },
                  { v: workerPassword, s: setWorkerPassword, t: 'password', p: 'Password (min 6 chars)', min: 6 },
                ].map(f => (
                  <input key={f.p} required value={f.v} onChange={e => f.s(e.target.value)} type={f.t} placeholder={f.p} minLength={f.min}
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                ))}
                <button type="submit" disabled={createWorkerMut.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {createWorkerMut.isPending && <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />}
                  {createWorkerMut.isPending ? 'Creating…' : 'Create Worker'}
                </button>
              </form>
            </div>
            <div className="lg:col-span-3 bg-zinc-900/60 border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/8">
                <h3 className="text-white font-semibold text-sm">Workers ({workers.length})</h3>
              </div>
              {workers.length === 0
                ? <EmptyState title="No workers yet" subtitle="Create a worker account above" />
                : <div className="divide-y divide-white/5">{workers.map(w => <WorkerRow key={w.id} w={w} onDelete={handleDeleteWorker} />)}</div>
              }
            </div>
          </div>
        )}
      </div>
    </>
  );
}
