"use client";

import { useRef, useEffect, memo } from 'react';

function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const raw = e.target.value;
    // Debounce: wait 300ms after user stops typing before calling onChange
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(raw);
    }, 300);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
      />
    </div>
  );
}

export default memo(SearchInput);
