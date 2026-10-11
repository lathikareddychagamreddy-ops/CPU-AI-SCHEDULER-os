import type { Process } from '@/types';
import { Plus, Trash2, Eraser, Rocket, Sparkles } from 'lucide-react';

interface ProcessInputProps {
  processes: Process[];
  quantum: number;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onChange: (id: string, field: keyof Process, value: string) => void;
  onQuantumChange: (value: number) => void;
  onAnalyze: () => void;
  onLoadExample: () => void;
  error: string | null;
}

export function ProcessInput({
  processes, quantum, onAdd, onRemove, onClear, onChange, onQuantumChange, onAnalyze, onLoadExample, error,
}: ProcessInputProps) {
  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Workload Input</h2>
          <p className="text-sm text-gray-500 mt-0.5">Enter your process data — the example workload is designed for Round Robin to win</p>
        </div>
        <button
          onClick={onLoadExample}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-700 text-gray-300 hover:bg-slate-600 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Load Example
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-gray-300">
              <th className="px-4 py-3 text-left font-semibold">Process ID</th>
              <th className="px-4 py-3 text-right font-semibold">Arrival Time</th>
              <th className="px-4 py-3 text-right font-semibold">Burst Time</th>
              <th className="px-4 py-3 text-right font-semibold">Priority</th>
              <th className="px-4 py-3 text-center font-semibold w-16"></th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr key={p.id} className="bg-slate-900/30 hover:bg-slate-900/50 transition-colors">
                <td className="px-4 py-2">
                  <span className="font-bold text-white">{p.pid}</span>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={p.arrivalTime}
                    onChange={(e) => onChange(p.id, 'arrivalTime', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-right text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={1}
                    value={p.burstTime}
                    onChange={(e) => onChange(p.id, 'burstTime', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-right text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={p.priority}
                    onChange={(e) => onChange(p.id, 'priority', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-right text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => onRemove(p.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg p-1.5 transition-colors"
                    title="Remove process"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {processes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No processes yet. Click "Add Process" to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Time Quantum */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-gray-300">Time Quantum:</label>
        <input
          type="number"
          min={1}
          value={quantum}
          onChange={(e) => onQuantumChange(Number(e.target.value))}
          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-right text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
        />
        <span className="text-xs text-gray-500">(for Round Robin)</span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-700 text-gray-200 hover:bg-slate-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Process
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-700 text-gray-400 hover:bg-slate-600 hover:text-gray-200 transition-colors"
        >
          <Eraser className="w-4 h-4" />
          Clear All
        </button>
        <button
          onClick={onAnalyze}
          disabled={processes.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Rocket className="w-4 h-4" />
          Analyze Workload
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
