interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const sizeClass =
    size === 'sm' ? 'text-xs px-2 py-0.5' :
    size === 'lg' ? 'text-base px-3 py-1.5' :
    'text-sm px-2.5 py-1';

  const colorClass =
    score >= 80 ? 'from-emerald-500 to-green-600' :
    score >= 60 ? 'from-blue-500 to-cyan-600' :
    score >= 40 ? 'from-amber-500 to-orange-600' :
    'from-slate-500 to-slate-600';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${colorClass} font-bold text-white ${sizeClass} shadow-lg`}
    >
      {score}% Match
    </span>
  );
}
