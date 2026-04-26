"use client";

import OfflineBanner from '../../components/OfflineBanner';
import Header from '../../components/Header';
import FloatingButton from '../../components/FloatingButton';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <OfflineBanner />
      
      <Header />

      {/* Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 pb-24">
        {children}
      </main>

      <FloatingButton />
    </div>
  );
}
