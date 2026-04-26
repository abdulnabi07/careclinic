"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { getCurrentUser } from '../../../services/authService';
import { getPatients, deletePatient } from '../../../services/patientService';
import PatientCard, { playSuccessSound } from '../../../components/PatientCard';
import EmptyState from '../../../components/EmptyState';

export default function PatientsPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
          return;
        }
        const user = await getCurrentUser();
        if (user) {
          setRole(user.role);
          setAuthChecked(true);
        } else {
          router.replace('/login');
        }
      } catch (err) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);

  const fetchPatients = useCallback(async (searchTerm) => {
    if (!role) return;
    try {
      setIsLoading(true);
      const data = await getPatients(role, searchTerm);
      setPatients(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  // Initial load when auth is confirmed
  useEffect(() => {
    if (authChecked) {
      fetchPatients('');
    }
  }, [authChecked, fetchPatients]);

  // Debounced search — fires 300ms after the user stops typing
  useEffect(() => {
    if (!authChecked) return;
    const timer = setTimeout(() => {
      fetchPatients(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search, authChecked, fetchPatients]);

  const handleDeletePatient = async (id) => {
    try {
      await deletePatient(id);
      playSuccessSound();
      fetchPatients(search.trim());
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    }
  };

  if (!authChecked) {
    return <div className="p-3 text-zinc-500 text-sm">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Patients</h1>
        <p className="text-zinc-500 text-xs mt-0.5">View and search patient records.</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or mobile"
        className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-0.5"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-28 bg-zinc-900/50 rounded-lg border border-white/5" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          title={search ? `No results for "${search}"` : "No patients found"}
          subtitle={search ? "Try a different name or mobile number." : "Go to the dashboard to add a new patient."}
        />
      ) : (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
          {patients.map(p => (
            <PatientCard
              key={p.id}
              patient={p}
              showAmount={role === 'admin'}
              canEdit={role === 'admin'}
              onDelete={role === 'admin' ? handleDeletePatient : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
