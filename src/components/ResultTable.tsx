import type { AlgorithmResult } from '@/types';
import { GanttChart } from './GanttChart';

interface ResultTableProps {
  result: AlgorithmResult;
}

export function ResultTable({ result }: ResultTableProps) {
  return (
    <div className="space-y-6">
      <GanttChart blocks={result.gantt} title={`${result.name} — Execution Timeline`} />

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-gray-300">
              <th className="px-4 py-3 text-left font-semibold">Process</th>
              <th className="px-4 py-3 text-right font-semibold">Arrival</th>
              <th className="px-4 py-3 text-right font-semibold">Burst</th>
              <th className="px-4 py-3 text-right font-semibold">Priority</th>
              <th className="px-4 py-3 text-right font-semibold">Completion</th>
              <th className="px-4 py-3 text-right font-semibold">Turnaround</th>
              <th className="px-4 py-3 text-right font-semibold">Waiting</th>
            </tr>
          </thead>
          <tbody>
            {result.results.map((r, i) => (
              <tr key={r.pid} className={i % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-900/20'}>
                <td className="px-4 py-3 font-medium text-white">{r.pid}</td>
                <td className="px-4 py-3 text-right text-gray-300">{r.arrivalTime}</td>
                <td className="px-4 py-3 text-right text-gray-300">{r.burstTime}</td>
                <td className="px-4 py-3 text-right text-gray-300">{r.priority}</td>
                <td className="px-4 py-3 text-right text-cyan-400 font-medium">{r.completionTime}</td>
                <td className="px-4 py-3 text-right text-amber-400 font-medium">{r.turnaroundTime}</td>
                <td className="px-4 py-3 text-right text-emerald-400 font-medium">{r.waitingTime}</td>
              </tr>
            ))}
            <tr className="bg-slate-800 border-t-2 border-slate-600">
              <td colSpan={4} className="px-4 py-3 font-bold text-white text-right">Average</td>
              <td className="px-4 py-3 text-right text-cyan-300 font-bold">{result.avgCompletion.toFixed(2)}</td>
              <td className="px-4 py-3 text-right text-amber-300 font-bold">{result.avgTurnaround.toFixed(2)}</td>
              <td className="px-4 py-3 text-right text-emerald-300 font-bold">{result.avgWaiting.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
