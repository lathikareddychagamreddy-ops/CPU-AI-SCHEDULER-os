import { useState, useMemo } from 'react';
import { Cpu, Zap } from 'lucide-react';
import type { Process, AlgorithmResult } from '@/types';
import { runAll, findBest, findBestAlgorithms } from '@/scheduling';
import { ProcessInput } from '@/components/ProcessInput';
import { ComparisonTable } from '@/components/ComparisonTable';
import { WinnerCards } from '@/components/WinnerCards';
import { DetailedResults } from '@/components/DetailedResults';
import { WorkloadRecommendationCard } from '@/components/WorkloadRecommendationCard';

let processCounter = 0;
function makeProcess(pid: string, arrival: number, burst: number, priority: number): Process {
  processCounter++;
  return { id: `proc-${processCounter}-${Date.now()}`, pid, arrivalTime: arrival, burstTime: burst, priority };
}

function makeExampleProcesses(): Process[] {
  return [
    makeProcess('P1', 0, 9, 2),
    makeProcess('P2', 4, 2, 3),
    makeProcess('P3', 3, 1, 1),
  ];
}

export default function App() {
  const [processes, setProcesses] = useState<Process[]>(makeExampleProcesses);
  const [quantum, setQuantum] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    fcfs: AlgorithmResult;
    sjf: AlgorithmResult;
    rr: AlgorithmResult;
    priority: AlgorithmResult;
    best: AlgorithmResult;
    tiedBest: AlgorithmResult[];
  } | null>(null);

  const allResults = useMemo(() => {
    if (!results) return [];
    return [results.fcfs, results.sjf, results.rr, results.priority];
  }, [results]);

  function handleAdd() {
    const usedPids = new Set(processes.map(process => process.pid));
    let num = 1;
    while (usedPids.has(`P${num}`)) num++;
    setProcesses([...processes, makeProcess(`P${num}`, 0, 1, 1)]);
  }

  function handleRemove(id: string) {
    setProcesses(processes.filter(p => p.id !== id));
  }

  function handleClear() {
    setProcesses([]);
    setResults(null);
    setError(null);
  }

  function handleChange(id: string, field: keyof Process, value: string) {
    const numVal = Number(value);
    setProcesses(processes.map(p =>
      p.id === id ? { ...p, [field]: field === 'pid' ? value : (value === '' ? 0 : numVal) } : p
    ));
  }

  function handleQuantumChange(value: number) {
    setQuantum(value < 1 ? 1 : value);
  }

  function handleLoadExample() {
    setProcesses(makeExampleProcesses());
    setQuantum(2);
    setResults(null);
    setError(null);
  }

  function handleAnalyze() {
    if (processes.length === 0) {
      setError('Please add at least one process.');
      return;
    }
    for (const p of processes) {
      if (p.burstTime < 1) {
        setError(`${p.pid} has an invalid burst time. Burst time must be at least 1.`);
        return;
      }
      if (p.arrivalTime < 0) {
        setError(`${p.pid} has an invalid arrival time. Arrival time cannot be negative.`);
        return;
      }
    }
    if (quantum < 1) {
      setError('Time quantum must be at least 1.');
      return;
    }

    setError(null);

    const { fcfs, sjf, rr, priority } = runAll(processes, quantum);
    const all = [fcfs, sjf, rr, priority];
    const incompleteResult = all.find(result => result.results.length !== processes.length);
    if (incompleteResult) {
      setError(`${incompleteResult.name} analyzed ${incompleteResult.results.length} of ${processes.length} processes. Please review the process IDs and try again.`);
      return;
    }
    const best = findBest(all);
    const tiedBest = findBestAlgorithms(all);

    setResults({ fcfs, sjf, rr, priority, best, tiedBest });

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">CPU Scheduling Analyzer</h1>
              <p className="text-xs text-gray-500">Auto-compares FCFS, SJF, Round Robin & Priority</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Measured Results</span>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center py-6">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-3">
            Intelligent CPU Scheduling Analyzer
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Enter your workload once. The system automatically runs all four scheduling algorithms,
            and compares their measured waiting times to identify the best result.
          </p>
        </div>

        {/* Input */}
        <ProcessInput
          processes={processes}
          quantum={quantum}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onClear={handleClear}
          onChange={handleChange}
          onQuantumChange={handleQuantumChange}
          onAnalyze={handleAnalyze}
          onLoadExample={handleLoadExample}
          error={error}
        />

        {/* Results */}
        {results && (
          <div id="results-section" className="space-y-8 pt-4">
            {/* Step 10: Winner cards */}
            <WinnerCards best={results.best} isTie={results.tiedBest.length > 1} />

            {/* Comparison table */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">
                Algorithm Performance Comparison ({processes.length} processes, all four algorithms)
              </h3>
              <ComparisonTable results={allResults} bestName={results.best.name} />
            </div>

            {/* Best algorithm highlight */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 p-6 text-center">
              <p className="text-sm text-amber-400 uppercase tracking-wider font-semibold mb-2">Best Scheduling Algorithm</p>
              <p className="text-4xl font-bold text-white mb-2">{results.best.name}</p>
              <div className="flex justify-center gap-6 text-sm text-gray-400">
                <span>Avg Waiting: <strong className="text-amber-300">{results.best.avgWaiting.toFixed(2)}</strong></span>
                <span>Avg Turnaround: <strong className="text-amber-300">{results.best.avgTurnaround.toFixed(2)}</strong></span>
              </div>
              <p className="text-sm text-gray-400 mt-3 italic">
                {results.tiedBest.length > 1
                  ? `${results.best.name} is shown as the single recommendation, but all ${results.tiedBest.length} algorithms tie on the measured results.`
                  : `${results.best.name} has the lowest average waiting time for this workload.`}
              </p>
            </div>

            <WorkloadRecommendationCard best={results.best} isTie={results.tiedBest.length > 1} />

            {/* Detailed results with tabs */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">Detailed Results & Gantt Charts</h3>
              <div className="rounded-2xl bg-slate-800/30 border border-slate-700 p-6">
                <DetailedResults
                  fcfs={results.fcfs}
                  sjf={results.sjf}
                  rr={results.rr}
                  priority={results.priority}
                  bestName={results.best.name}
                />
              </div>
            </div>
          </div>
        )}

        {!results && (
          <div className="text-center py-12 text-gray-600">
            <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Enter your workload above and click "Analyze Workload" to see the results.</p>
          </div>
        )}
      </main>

      <footer className="relative border-t border-slate-800 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-gray-600">
          CPU Scheduling Analyzer — Automatically evaluates FCFS, SJF, Round Robin & Priority scheduling algorithms
        </div>
      </footer>
    </div>
  );
}
