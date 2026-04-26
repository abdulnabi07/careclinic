"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { getCurrentUser } from '../../../services/authService';
import { getPatients } from '../../../services/patientService';

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
      const fetchAllPatients = async () => {
        try {
          const data = await getPatients(role);
          setPatients(data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAllPatients();
    }
  }, [authChecked, role]);

  const getReportData = (period) => {
    const now = new Date();
    let startDate;

    if (period === 'Today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'Week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    let count = 0;
    let revenue = 0;
    const filteredPatients = [];

    patients.forEach(p => {
      const createdAt = new Date(p.created_at);
      if (createdAt >= startDate) {
        count++;
        revenue += Number(p.total_amount) || 0;
        filteredPatients.push(p);
      }
    });

    return { count, revenue, filteredPatients, period };
  };

  const handleDownloadExcel = (period) => {
    const { filteredPatients, period: reportPeriod } = getReportData(period);
    
    // Lightweight CSV generation
    const headers = ['Date', 'Name', 'Age', 'Mobile', 'Area', 'Amount'];
    const rows = filteredPatients.map(p => [
      new Date(p.created_at).toLocaleDateString(),
      `"${p.name}"`,
      p.age,
      p.mobile,
      `"${p.area}"`,
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
    const { filteredPatients, period: reportPeriod, count, revenue } = getReportData(period);
    
    // Lightweight PDF Print generation
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Hospital Report - ${reportPeriod}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Hospital Report - ${reportPeriod}</h2>
          <p><strong>Total Patients:</strong> ${count}</p>
          <p><strong>Total Revenue:</strong> ₹${revenue}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Age</th>
                <th>Area</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPatients.map(p => `
                <tr>
                  <td>${new Date(p.created_at).toLocaleDateString()}</td>
                  <td>${p.name}</td>
                  <td>${p.age}</td>
                  <td>${p.area}</td>
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
    // setTimeout to allow rendering
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleWhatsAppShare = (period) => {
    const { count, revenue, period: reportPeriod } = getReportData(period);
    
    const message = `Hospital Report

Date: ${reportPeriod}

Total Patients: ${count}
Total Revenue: ₹${revenue}

Thank you.`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (!authChecked || loading) {
    return <div className="p-3 text-zinc-500 text-sm">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-3">
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
          <p className="text-zinc-500 text-xs">Reports and hospital configuration.</p>
        </div>
      </div>

      <div className="border border-white/5 rounded-lg p-4 bg-zinc-900/60">
        <h2 className="text-base font-semibold text-white mb-4">Reports</h2>
        
        <div className="flex flex-col gap-3">
          <ReportSection 
            title="Today Report" 
            period="Today" 
            onExcel={() => handleDownloadExcel('Today')}
            onPDF={() => handleDownloadPDF('Today')}
            onShare={() => handleWhatsAppShare('Today')}
          />
          <ReportSection 
            title="Weekly Report" 
            period="Week" 
            onExcel={() => handleDownloadExcel('Week')}
            onPDF={() => handleDownloadPDF('Week')}
            onShare={() => handleWhatsAppShare('Week')}
          />
          <ReportSection 
            title="Monthly Report" 
            period="Month" 
            onExcel={() => handleDownloadExcel('Month')}
            onPDF={() => handleDownloadPDF('Month')}
            onShare={() => handleWhatsAppShare('Month')}
          />
        </div>
      </div>
    </div>
  );
}

function ReportSection({ title, onExcel, onPDF, onShare }) {
  return (
    <div className="p-3 bg-zinc-950 border border-white/5 rounded-lg flex flex-col gap-3">
      <span className="text-sm font-medium text-zinc-200">{title}</span>
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
          className="flex-1 min-w-0 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg"
        >
          WhatsApp
        </button>
      </div>
    </div>
  );
}
