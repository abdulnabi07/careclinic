"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { getCurrentUser } from '../../../services/authService';
import { getDashboardData } from '../../../services/patientService';
import { calculateReports } from '../../../utils/reportUtils';
import { trackEvent } from '../../../utils/trackEvent';

export default function SettingsPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [role, setRole] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
          return;
        }
        
        const user = await getCurrentUser();
        if (user && user.role === 'admin') {
          setRole(user.role);
          setAuthChecked(true);
        } else {
          router.replace('/dashboard');
        }
      } catch (err) {
        router.replace('/dashboard');
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (authChecked) {
      const fetchData = async () => {
        try {
          // Use getDashboardData() — same unlimited fetch as Dashboard
          // getPatients() has .limit(50) which causes report undercounting
          const data = await getDashboardData();
          setPatients(data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [authChecked]);



  // --- Report helpers — reuses calculateReports (single source of truth) ---
  const getReportData = (period) => {
    const reports = calculateReports(patients);
    const now = new Date();

    const periodMap = { Today: 'today', Week: 'week', Month: 'month' };
    const reportKey = periodMap[period];
    const r = reports[reportKey];

    let rangeLabel;
    if (period === 'Today') {
      rangeLabel = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
    } else if (period === 'Week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 6);
      const weekStartLabel = weekAgo.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' });
      const todayLabel = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
      rangeLabel = `${weekStartLabel} – ${todayLabel}`;
    } else if (period === 'Month') {
      rangeLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
    }

    return {
      totalCount: r.count,
      reviewCount: r.review || 0,
      consultationCount: r.consultation || 0,
      totalRevenue: r.revenue,
      cashRevenue: r.cash,
      cashlessRevenue: r.online,
      filteredPatients: r.patients,
      rangeLabel,
      period
    };
  };

  const generateReportText = (period) => {
    const r = getReportData(period);
    return `Reema Hospital Final Report

Date: ${r.rangeLabel}

Patients:
Total: ${r.totalCount}
Review: ${r.reviewCount}
New Consultation: ${r.consultationCount}

Revenue:
Total: ₹${r.totalRevenue.toLocaleString()}
Cash: ₹${r.cashRevenue.toLocaleString()}
Online: ₹${r.cashlessRevenue.toLocaleString()}`;
  };

  const handleDownloadExcel = (period) => {
    trackEvent('report_downloaded');
    const { filteredPatients, period: reportPeriod } = getReportData(period);
    
    // Lightweight CSV generation
    const headers = ['Date', 'Name', 'Age', 'Mobile', 'Area', 'Type', 'Payment', 'Amount'];
    const rows = filteredPatients.map(p => [
      new Date(p.created_at).toLocaleDateString(),
      `"${p.name}"`,
      p.age,
      p.mobile,
      `"${p.area}"`,
      p.local_type || '',
      p.payment_type || '',
      p.total_amount
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hospital_Report_${reportPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = (period) => {
    trackEvent('report_downloaded');
    const r = getReportData(period);
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Reema Hospital Report - ${r.period}</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #1a1a1a; }
            h2 { margin-bottom: 4px; }
            .subtitle { color: #666; font-size: 14px; margin-bottom: 20px; }
            .stats { display: flex; gap: 32px; margin-bottom: 24px; flex-wrap: wrap; }
            .stat-group { min-width: 180px; }
            .stat-group h3 { font-size: 13px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
            .stat-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
            .stat-row .label { color: #555; }
            .stat-row .value { font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: 600; }
          </style>
        </head>
        <body>
          <h2>Reema Hospital – Final Report</h2>
          <p class="subtitle">${r.rangeLabel}</p>

          <div class="stats">
            <div class="stat-group">
              <h3>Patients</h3>
              <div class="stat-row"><span class="label">Total</span><span class="value">${r.totalCount}</span></div>
              <div class="stat-row"><span class="label">Review</span><span class="value">${r.reviewCount}</span></div>
              <div class="stat-row"><span class="label">New Consultation</span><span class="value">${r.consultationCount}</span></div>
            </div>
            <div class="stat-group">
              <h3>Revenue</h3>
              <div class="stat-row"><span class="label">Total</span><span class="value">₹${r.totalRevenue.toLocaleString()}</span></div>
              <div class="stat-row"><span class="label">Cash</span><span class="value">₹${r.cashRevenue.toLocaleString()}</span></div>
              <div class="stat-row"><span class="label">Online</span><span class="value">₹${r.cashlessRevenue.toLocaleString()}</span></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Age</th>
                <th>Area</th>
                <th>Type</th>
                <th>Payment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${r.filteredPatients.map(p => `
                <tr>
                  <td>${new Date(p.created_at).toLocaleDateString()}</td>
                  <td>${p.name}</td>
                  <td>${p.age}</td>
                  <td>${p.area}</td>
                  <td>${p.local_type === 'local' ? 'Local' : p.local_type === 'non_local' ? 'Non-Local' : '—'}</td>
                  <td>${p.payment_type === 'cash' ? 'Cash' : p.payment_type === 'cashless' ? 'Cashless' : '—'}</td>
                  <td>₹${p.total_amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleWhatsAppShare = (period) => {
    trackEvent('whatsapp_shared');
    const text = generateReportText(period);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!authChecked || loading) {
    return <div className="p-3 text-zinc-500 text-sm">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-zinc-500 text-xs">Reports, templates and hospital configuration.</p>
        </div>
      </div>

      {/* WhatsApp Templates link */}
      <button
        onClick={() => router.push('/settings/templates')}
        className="border border-white/5 rounded-lg p-4 bg-zinc-900/60 flex items-center justify-between w-full text-left"
      >
        <div>
          <h2 className="text-base font-semibold text-white">WhatsApp Templates</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Create, edit and manage message templates.</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Final Reports */}
      <div className="border border-white/5 rounded-lg p-4 bg-zinc-900/60">
        <h2 className="text-base font-semibold text-white mb-4">Final Reports</h2>
        
        <div className="flex flex-col gap-3">
          <ReportSection 
            title="Today Report"
            data={getReportData('Today')}
            onExcel={() => handleDownloadExcel('Today')}
            onPDF={() => handleDownloadPDF('Today')}
            onShare={() => handleWhatsAppShare('Today')}
          />
          <ReportSection 
            title="Weekly Report"
            data={getReportData('Week')}
            onExcel={() => handleDownloadExcel('Week')}
            onPDF={() => handleDownloadPDF('Week')}
            onShare={() => handleWhatsAppShare('Week')}
          />
          <ReportSection 
            title="Monthly Report"
            data={getReportData('Month')}
            onExcel={() => handleDownloadExcel('Month')}
            onPDF={() => handleDownloadPDF('Month')}
            onShare={() => handleWhatsAppShare('Month')}
          />
        </div>
      </div>
    </div>
  );
}

function ReportSection({ title, data, onExcel, onPDF, onShare }) {
  return (
    <div className="p-3 bg-zinc-950 border border-white/5 rounded-lg flex flex-col gap-3">
      <span className="text-sm font-medium text-zinc-200">{title}</span>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>Total Patients</span>
          <span className="text-white font-semibold">{data.totalCount}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Total Revenue</span>
          <span className="text-emerald-400 font-semibold">₹{data.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Review</span>
          <span className="text-white font-semibold">{data.reviewCount}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Cash</span>
          <span className="text-white font-semibold">₹{data.cashRevenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Consultation</span>
          <span className="text-white font-semibold">{data.consultationCount}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Online</span>
          <span className="text-white font-semibold">₹{data.cashlessRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={onExcel}
          className="flex-1 min-w-0 px-3 py-2 text-xs font-medium bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/20"
        >
          Excel
        </button>
        <button 
          onClick={onPDF}
          className="flex-1 min-w-0 px-3 py-2 text-xs font-medium bg-rose-600/20 text-rose-400 rounded-lg border border-rose-500/20"
        >
          PDF
        </button>
        <button 
          onClick={onShare}
          className="flex-1 min-w-0 px-3 py-2 text-xs font-medium bg-green-600 text-white rounded-lg"
        >
          WhatsApp
        </button>
      </div>
    </div>
  );
}
