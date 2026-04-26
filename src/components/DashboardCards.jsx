"use client";

import { useEffect, useState } from 'react';
import { getPatients } from '../services/patientService';

export default function DashboardCards({ role }) {
  const [stats, setStats] = useState({
    patientsToday: 0,
    patientsWeek: 0,
    patientsMonth: 0,
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const patients = await getPatients(role);
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let pToday = 0, pWeek = 0, pMonth = 0;
        let rToday = 0, rWeek = 0, rMonth = 0;

        patients.forEach(p => {
          const createdAt = new Date(p.created_at);
          const amount = Number(p.total_amount) || 0;

          if (createdAt >= startOfToday) {
            pToday++;
            rToday += amount;
          }
          if (createdAt >= startOfWeek) {
            pWeek++;
            rWeek += amount;
          }
          if (createdAt >= startOfMonth) {
            pMonth++;
            rMonth += amount;
          }
        });

        setStats({
          patientsToday: pToday,
          patientsWeek: pWeek,
          patientsMonth: pMonth,
          revenueToday: rToday,
          revenueWeek: rWeek,
          revenueMonth: rMonth,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [role]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 bg-zinc-900/50 rounded-xl border border-white/5"></div>
        ))}
      </div>
    );
  }

  const isAdmin = role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Patients</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Today" value={stats.patientsToday} />
          <StatCard title="Last 7 Days" value={stats.patientsWeek} />
          <StatCard title="This Month" value={stats.patientsMonth} />
        </div>
      </div>

      {isAdmin && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Revenue</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Today" value={`₹${stats.revenueToday.toLocaleString()}`} isRevenue />
            <StatCard title="Last 7 Days" value={`₹${stats.revenueWeek.toLocaleString()}`} isRevenue />
            <StatCard title="This Month" value={`₹${stats.revenueMonth.toLocaleString()}`} isRevenue />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, isRevenue = false }) {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm border border-white/[0.08] rounded-xl p-4 flex flex-col justify-center">
      <span className="text-zinc-500 text-xs font-medium mb-1">{title}</span>
      <span className={`text-2xl font-bold ${isRevenue ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
