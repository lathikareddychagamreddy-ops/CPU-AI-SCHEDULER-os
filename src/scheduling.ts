import type { Process, ProcessResult, GanttBlock, AlgorithmResult } from './types';

export function runFCFS(processes: Process[]): AlgorithmResult {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const gantt: GanttBlock[] = [];
  const results: ProcessResult[] = [];
  let currentTime = 0;

  for (const p of sorted) {
    if (currentTime < p.arrivalTime) {
      gantt.push({ label: 'IDLE', start: currentTime, end: p.arrivalTime });
      currentTime = p.arrivalTime;
    }
    const start = currentTime;
    const completion = currentTime + p.burstTime;
    const turnaround = completion - p.arrivalTime;
    const waiting = turnaround - p.burstTime;
    gantt.push({ label: p.pid, start, end: completion });
    currentTime = completion;
    results.push({
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime: completion,
      turnaroundTime: turnaround,
      waitingTime: waiting,
    });
  }

  const order = [...processes].map(p => p.pid);
  results.sort((a, b) => order.indexOf(a.pid) - order.indexOf(b.pid));

  return finalize('FCFS', results, gantt);
}

export function runSJF(processes: Process[]): AlgorithmResult {
  const remaining = [...processes].map(p => ({ ...p }));
  const gantt: GanttBlock[] = [];
  const results: { id: string; result: ProcessResult }[] = [];
  let currentTime = 0;
  let completed = 0;
  const n = processes.length;
  const done = new Set<string>();

  while (completed < n) {
    const available = remaining.filter(p => !done.has(p.id) && p.arrivalTime <= currentTime);
    if (available.length === 0) {
      const next = remaining.filter(p => !done.has(p.id)).sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      if (!next) break;
      gantt.push({ label: 'IDLE', start: currentTime, end: next.arrivalTime });
      currentTime = next.arrivalTime;
      continue;
    }
    available.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
    const p = available[0];
    const start = currentTime;
    const completion = currentTime + p.burstTime;
    const turnaround = completion - p.arrivalTime;
    const waiting = turnaround - p.burstTime;
    gantt.push({ label: p.pid, start, end: completion });
    currentTime = completion;
    done.add(p.id);
    completed++;
    results.push({ id: p.id, result: {
        pid: p.pid,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
        completionTime: completion,
        turnaroundTime: turnaround,
        waitingTime: waiting,
      } });
  }

  const order = new Map(processes.map((p, index) => [p.id, index]));
  results.sort((a, b) => order.get(a.id)! - order.get(b.id)!);

  return finalize('SJF', results.map(entry => entry.result), gantt);
}

export function runRoundRobin(processes: Process[], quantum: number): AlgorithmResult {
  const remaining = new Map(processes.map(p => [p.id, p.burstTime]));
  const gantt: GanttBlock[] = [];
  const completionTimes = new Map<string, number>();
  let currentTime = 0;
  let completed = 0;
  const n = processes.length;
  let queue: Process[] = [];
  const arrived = new Set<string>();

  const sortedByArrival = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let arrivalIdx = 0;

  // Add initially arrived processes
  for (const p of sortedByArrival) {
    if (p.arrivalTime <= currentTime) {
      queue.push(p);
      arrived.add(p.id);
      arrivalIdx++;
    }
  }

  while (completed < n) {
    // Add newly arrived processes
    while (arrivalIdx < sortedByArrival.length && sortedByArrival[arrivalIdx].arrivalTime <= currentTime) {
      if (!arrived.has(sortedByArrival[arrivalIdx].id)) {
        queue.push(sortedByArrival[arrivalIdx]);
        arrived.add(sortedByArrival[arrivalIdx].id);
      }
      arrivalIdx++;
    }

    if (queue.length === 0) {
      // Find next arrival
      const nextRemaining = sortedByArrival.find(p => !arrived.has(p.id));
      if (!nextRemaining) break;
      gantt.push({ label: 'IDLE', start: currentTime, end: nextRemaining.arrivalTime });
      currentTime = nextRemaining.arrivalTime;
      continue;
    }

    const p = queue.shift()!;
    const rem = remaining.get(p.id)!;
    const exec = Math.min(quantum, rem);
    const start = currentTime;
    currentTime += exec;
    gantt.push({ label: p.pid, start, end: currentTime });
    const newRem = rem - exec;
    remaining.set(p.id, newRem);

    // Add processes that arrived during execution
    while (arrivalIdx < sortedByArrival.length && sortedByArrival[arrivalIdx].arrivalTime <= currentTime) {
      if (!arrived.has(sortedByArrival[arrivalIdx].id)) {
        queue.push(sortedByArrival[arrivalIdx]);
        arrived.add(sortedByArrival[arrivalIdx].id);
      }
      arrivalIdx++;
    }

    if (newRem === 0) {
      completionTimes.set(p.id, currentTime);
      completed++;
    } else {
      queue.push(p);
    }
  }

  const results: ProcessResult[] = processes.map(p => {
    const completion = completionTimes.get(p.id);
    if (completion === undefined) {
      throw new Error(`Round Robin did not complete process ${p.pid}.`);
    }
    const turnaround = completion - p.arrivalTime;
    const waiting = turnaround - p.burstTime;
    return {
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime: completion,
      turnaroundTime: turnaround,
      waitingTime: waiting,
    };
  });

  return finalize('Round Robin', results, gantt);
}

export function runPriority(processes: Process[]): AlgorithmResult {
  const remaining = [...processes].map(p => ({ ...p }));
  const gantt: GanttBlock[] = [];
  const results: { id: string; result: ProcessResult }[] = [];
  let currentTime = 0;
  let completed = 0;
  const n = processes.length;
  const done = new Set<string>();

  while (completed < n) {
    const available = remaining.filter(p => !done.has(p.id) && p.arrivalTime <= currentTime);
    if (available.length === 0) {
      const next = remaining.filter(p => !done.has(p.id)).sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      if (!next) break;
      gantt.push({ label: 'IDLE', start: currentTime, end: next.arrivalTime });
      currentTime = next.arrivalTime;
      continue;
    }
    // Lower priority number = higher priority
    available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const p = available[0];
    const start = currentTime;
    const completion = currentTime + p.burstTime;
    const turnaround = completion - p.arrivalTime;
    const waiting = turnaround - p.burstTime;
    gantt.push({ label: p.pid, start, end: completion });
    currentTime = completion;
    done.add(p.id);
    completed++;
    results.push({ id: p.id, result: {
        pid: p.pid,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
        completionTime: completion,
        turnaroundTime: turnaround,
        waitingTime: waiting,
      } });
  }

  const order = new Map(processes.map((p, index) => [p.id, index]));
  results.sort((a, b) => order.get(a.id)! - order.get(b.id)!);

  return finalize('Priority', results.map(entry => entry.result), gantt);
}

function finalize(name: string, results: ProcessResult[], gantt: GanttBlock[]): AlgorithmResult {
  // Merge consecutive same-label blocks
  const merged: GanttBlock[] = [];
  for (const block of gantt) {
    const last = merged[merged.length - 1];
    if (last && last.label === block.label) {
      last.end = block.end;
    } else {
      merged.push({ ...block });
    }
  }

  const n = results.length;
  const avgCompletion = results.reduce((s, r) => s + r.completionTime, 0) / n;
  const avgTurnaround = results.reduce((s, r) => s + r.turnaroundTime, 0) / n;
  const avgWaiting = results.reduce((s, r) => s + r.waitingTime, 0) / n;

  return {
    name,
    results,
    gantt: merged,
    avgCompletion,
    avgTurnaround,
    avgWaiting,
  };
}

export function runAll(processes: Process[], quantum: number): {
  fcfs: AlgorithmResult;
  sjf: AlgorithmResult;
  rr: AlgorithmResult;
  priority: AlgorithmResult;
} {
  return {
    fcfs: runFCFS(processes),
    sjf: runSJF(processes),
    rr: runRoundRobin(processes, quantum),
    priority: runPriority(processes),
  };
}

const ALGORITHM_TIE_BREAK_ORDER = ['FCFS', 'SJF', 'Round Robin', 'Priority'];

function compareMetric(a: number, b: number): number {
  const difference = a - b;
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b)) * 10;
  return Math.abs(difference) <= tolerance ? 0 : difference;
}

export function compareAlgorithmMetrics(a: AlgorithmResult, b: AlgorithmResult): number {
  return compareMetric(a.avgWaiting, b.avgWaiting)
    || compareMetric(a.avgTurnaround, b.avgTurnaround)
    || compareMetric(a.avgCompletion, b.avgCompletion);
}

export function compareAlgorithms(a: AlgorithmResult, b: AlgorithmResult): number {
  return compareAlgorithmMetrics(a, b)
    || ALGORITHM_TIE_BREAK_ORDER.indexOf(a.name) - ALGORITHM_TIE_BREAK_ORDER.indexOf(b.name);
}

export function findBest(results: AlgorithmResult[]): AlgorithmResult {
  return [...results].sort(compareAlgorithms)[0];
}

export function findBestAlgorithms(results: AlgorithmResult[]): AlgorithmResult[] {
  const best = findBest(results);
  return results.filter(result => compareAlgorithmMetrics(result, best) === 0);
}
