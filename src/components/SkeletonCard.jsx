"use client";

import { memo } from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-zinc-700/50 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-zinc-700/50 rounded w-2/3" />
          <div className="h-2.5 bg-zinc-800/60 rounded w-1/2" />
        </div>
      </div>
      <div className="h-2.5 bg-zinc-800/50 rounded w-full" />
      <div className="flex gap-1.5">
        <div className="h-5 w-12 bg-zinc-800/60 rounded-lg" />
        <div className="h-5 w-16 bg-zinc-800/60 rounded-lg" />
      </div>
      <div className="h-px bg-zinc-800/50 rounded" />
      <div className="h-2.5 bg-zinc-800/40 rounded w-1/3" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 bg-zinc-700/50 rounded w-24" />
        <div className="w-8 h-8 rounded-lg bg-zinc-700/50" />
      </div>
      <div className="h-8 bg-zinc-700/40 rounded w-1/2" />
    </div>
  );
}

export function SkeletonPatientGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default memo(SkeletonCard);
