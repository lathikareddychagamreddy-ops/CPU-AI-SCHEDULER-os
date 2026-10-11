import type { AlgorithmResult } from '@/types';
import { Target } from 'lucide-react';

interface WorkloadRecommendationCardProps {
  best: AlgorithmResult;
  isTie: boolean;
}

export function WorkloadRecommendationCard({ best, isTie }: WorkloadRecommendationCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Workload Recommendation</h3>
          <p className="text-xs text-gray-500">Selected from measured scheduling results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recommended Algorithm</p>
          <p className="text-2xl font-bold text-blue-400">{best.name}</p>
        </div>
        <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Average Waiting Time</p>
          <p className="text-2xl font-bold text-white">{best.avgWaiting.toFixed(2)}</p>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        {isTie
          ? `All algorithms tie on the measured results. ${best.name} is displayed as the single recommendation by the fixed tie-break order.`
          : `This recommendation is the algorithm with the lowest average waiting time for the current workload.`}
      </p>
    </div>
  );
}
