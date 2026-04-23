export function Loader({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <div className="flex items-center justify-center">
      <span className={`animate-spin rounded-full border-2 border-white/20 border-t-blue-400 ${sizes[size]}`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/10 border-t-blue-500" />
      <p className="text-zinc-500 text-sm">Loading...</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 animate-pulse space-y-3">
      <div className="h-3 bg-zinc-700/50 rounded w-1/3" />
      <div className="h-8 bg-zinc-700/50 rounded w-1/2" />
    </div>
  );
}
