"use client";

import { useEffect, useState, useCallback } from 'react';
import { getDashboardData } from '../services/patientService';
import { supabase } from '../lib/supabaseClient';

import { calculateReports } from '../utils/reportUtils';

export default function DashboardCards({ role }) {
  const [stats, setStats] = useState({
    patientsToday: 0,
    patientsWeek: 0,
    patientsMonth: 0,
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    localCount: 0,
    nonLocalCount: 0,
    cashCount: 0,
    cashlessCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Single fetch + in-memory filtering with IST boundaries and centralized logic
  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await getDashboardData();



      const report = calculateReports(data);

      // We still need to calculate local/nonLocal and cash/cashless overall counts
      // for the patient type/payment mode section (or use today's?).
      // The previous code calculated these across ALL fetched data (which was limited to 50 or filtered by time in the old version).
      // Let's preserve the existing logic of counting across the fetched `data` for those 4 metrics,
      // or just calculate them manually here for the whole set to avoid breaking the UI cards below.
      let localCount = 0, nonLocalCount = 0, cashCount = 0, cashlessCount = 0;
      data.forEach(p => {
        if (p.local_type === 'local') localCount++;
        else if (p.local_type === 'non_local') nonLocalCount++;

        if (p.payment_type === 'cash') cashCount++;
        else if (p.payment_type === 'cashless') cashlessCount++;
      });

      setStats({
        patientsToday: report.today.count,
        patientsWeek: report.week.count,
        patientsMonth: report.month.count,
        revenueToday: report.today.revenue,
        revenueWeek: report.week.revenue,
        revenueMonth: report.month.revenue,
        localCount,
        nonLocalCount,
        cashCount,
        cashlessCount,
      });
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time subscription — refetch on any patients table change
  useEffect(() => {
    const channel = supabase
      .channel("patients-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "patients" },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 bg-zinc-900/50 rounded-lg border border-white/5 animate-pulse"></div>
        ))}
      </div>
    );
  }

  const isAdmin = role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Patients</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard title="Today" value={stats.patientsToday} />
          <StatCard title="Last 7 Days" value={stats.patientsWeek} />
          <StatCard title="This Month" value={stats.patientsMonth} />
        </div>
      </div>

      {isAdmin && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Revenue</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard title="Today" value={`₹${stats.revenueToday.toLocaleString()}`} isRevenue />
            <StatCard title="Last 7 Days" value={`₹${stats.revenueWeek.toLocaleString()}`} isRevenue />
            <StatCard title="This Month" value={`₹${stats.revenueMonth.toLocaleString()}`} isRevenue />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Patient Type</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Local" value={stats.localCount} />
          <StatCard title="Non-Local" value={stats.nonLocalCount} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Payment Mode</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Cash" value={stats.cashCount} />
          <StatCard title="Cashless" value={stats.cashlessCount} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, isRevenue = false }) {
  return (
    <div className="p-3 border border-white/5 rounded-lg bg-zinc-900/60 flex flex-col gap-1">
      <span className="text-zinc-500 text-xs font-medium">{title}</span>
      <span className={`text-xl font-bold ${isRevenue ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
