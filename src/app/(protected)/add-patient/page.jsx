"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import AddPatientForm from '../../../components/AddPatientForm';

export default function AddPatientPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
        } else {
          setAuthChecked(true);
        }
      } catch (err) {
        router.replace('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  if (!authChecked) {
    return <div className="p-8 text-zinc-500 animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Patient</h1>
          <p className="text-zinc-400 text-sm mt-1">Create a new patient record.</p>
        </div>
      </div>
      
      <div className="max-w-3xl">
        <AddPatientForm onSuccess={() => router.push('/patients')} />
      </div>
    </div>
  );
}
