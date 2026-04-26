"use client";

import { useRouter } from 'next/navigation';

export default function FloatingButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/add-patient')}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-full flex items-center justify-center shadow-2xl transition-all border border-blue-400/20 z-50"
      aria-label="Add Patient"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
