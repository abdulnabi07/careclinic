"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { getCurrentUser } from '../../../services/authService';
import DashboardCards from '../../../components/DashboardCards';

export default function DashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [role, setRole] = useState(null);

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

  if (!authChecked) {
    return <div className="p-3 text-zinc-500 text-sm">Loading...</div>;
  }



  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500 text-xs mt-0.5">Hospital analytics.</p>
      </div>
      
      <DashboardCards role={role} />
    </div>
  );
}
