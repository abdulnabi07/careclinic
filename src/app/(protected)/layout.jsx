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
      <main className="flex-1 w-full max-w-screen-md mx-auto px-3 pb-24 pt-3 md:pt-6">
        {children}
      </main>

      <FloatingButton />
    </div>
  );
}
