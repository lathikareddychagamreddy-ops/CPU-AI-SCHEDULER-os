import type { AlgorithmResult } from '@/types';
import { Trophy, Clock, Target } from 'lucide-react';

interface WinnerCardsProps {
  best: AlgorithmResult;
  isTie: boolean;
}

export function WinnerCards({ best, isTie }: WinnerCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Best Algorithm */}
      <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              {isTie ? 'Selected Algorithm (Tie)' : 'Best Algorithm'}
            </span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{best.name}</p>
          <p className="text-sm text-gray-400">
            Avg Waiting: <span className="text-amber-300 font-semibold">{best.avgWaiting.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Lowest Waiting Time */}
      <div className="relative rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40 p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Lowest Waiting Time</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{best.avgWaiting.toFixed(2)}</p>
          <p className="text-sm text-gray-400">Lower is better</p>
        </div>
      </div>

      {/* Workload Recommendation */}
      <div className="relative rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/40 p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Recommended Algorithm</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{best.name}</p>
          <p className="text-sm text-gray-400">Chosen from measured waiting times</p>
        </div>
      </div>
    </div>
  );
}
