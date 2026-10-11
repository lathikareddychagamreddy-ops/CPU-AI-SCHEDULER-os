import { useState } from 'react';
import type { AlgorithmResult } from '@/types';
import { ResultTable } from './ResultTable';

interface DetailedResultsProps {
  fcfs: AlgorithmResult;
  sjf: AlgorithmResult;
  rr: AlgorithmResult;
  priority: AlgorithmResult;
  bestName: string;
}

const TABS = ['FCFS', 'SJF', 'Round Robin', 'Priority'] as const;
type Tab = typeof TABS[number];

export function DetailedResults({ fcfs, sjf, rr, priority, bestName }: DetailedResultsProps) {
  const [active, setActive] = useState<Tab>('FCFS');

  const map: Record<Tab, AlgorithmResult> = {
    FCFS: fcfs,
    SJF: sjf,
    'Round Robin': rr,
    Priority: priority,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-5 py-2.5 rounded-t-lg text-sm font-medium transition-all ${
              active === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-gray-200'
            }`}
          >
            {tab}
            {map[tab].name === bestName && (
              <span className="ml-2 text-amber-400">★</span>
            )}
          </button>
        ))}
      </div>
      <div className="pt-2">
        <ResultTable result={map[active]} />
      </div>
    </div>
  );
}
