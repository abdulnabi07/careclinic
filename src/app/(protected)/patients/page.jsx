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

  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    if (!role) return;
    try {
      setIsLoading(true);
      const data = await getPatients(role);
      setPatients(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (authChecked) {
      fetchPatients();
    }
  }, [authChecked, fetchPatients]);

  const handleDeletePatient = async (id) => {
    try {
      await deletePatient(id);
      playSuccessSound();
      alert('Patient deleted');
      fetchPatients();
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    }
  };

  if (!authChecked) {
    return <div className="p-8 text-zinc-500 animate-pulse">Loading patients...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Patients</h1>
        <p className="text-zinc-400 text-sm mt-1">View all patient records.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-32 bg-zinc-900/50 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState title="No patients found" subtitle="Go to the dashboard to add a new patient." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {patients.map(p => (
            <PatientCard key={p.id} patient={p} showAmount={role === 'admin'} canEdit={role === 'admin'} onDelete={role === 'admin' ? handleDeletePatient : null} />
          ))}
        </div>
      )}
    </div>
  );
}
