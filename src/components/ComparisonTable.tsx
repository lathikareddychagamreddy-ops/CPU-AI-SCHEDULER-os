import type { AlgorithmResult } from '@/types';
import { compareAlgorithmMetrics, compareAlgorithms } from '@/scheduling';

interface ComparisonTableProps {
  results: AlgorithmResult[];
  bestName: string;
}

export function ComparisonTable({ results, bestName }: ComparisonTableProps) {
  const sorted = [...results].sort(compareAlgorithms);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800 text-gray-300">
            <th className="px-6 py-4 text-left font-semibold">Algorithm</th>
            <th className="px-6 py-4 text-right font-semibold">Avg Waiting Time</th>
            <th className="px-6 py-4 text-right font-semibold">Avg Turnaround Time</th>
            <th className="px-6 py-4 text-right font-semibold">Avg Completion Time</th>
            <th className="px-6 py-4 text-center font-semibold">Rank</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const isBest = r.name === bestName;
            const rank = sorted.findIndex(candidate => compareAlgorithmMetrics(candidate, r) === 0) + 1;
            return (
              <tr
                key={r.name}
                className={`transition-colors ${
                  isBest
                    ? 'bg-amber-500/10 border-l-4 border-l-amber-500'
                    : i % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-900/20'
                }`}
              >
                <td className="px-6 py-4 font-medium text-white">
                  {isBest && <span className="mr-2">🏆</span>}
                  {r.name}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={isBest ? 'text-amber-400 font-bold' : 'text-gray-300'}>
                    {r.avgWaiting.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-300">{r.avgTurnaround.toFixed(2)}</td>
                <td className="px-6 py-4 text-right text-gray-300">{r.avgCompletion.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    isBest ? 'bg-amber-500/20 text-amber-400' :
                    i === 1 ? 'bg-slate-700 text-gray-300' :
                    i === 2 ? 'bg-orange-900/30 text-orange-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {rank}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
