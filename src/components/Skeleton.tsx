export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-slate-700/40" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-slate-700/40 rounded w-3/4" />
        <div className="h-3 bg-slate-700/40 rounded w-1/2" />
        <div className="h-3 bg-slate-700/40 rounded w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
