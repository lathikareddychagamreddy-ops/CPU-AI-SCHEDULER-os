import type { GanttBlock } from '@/types';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#eab308', '#a855f7', '#f43f5e', '#22c55e', '#6366f1',
];

const IDLE_COLOR = '#374151';

interface GanttChartProps {
  blocks: GanttBlock[];
  title: string;
}

export function GanttChart({ blocks, title }: GanttChartProps) {
  if (blocks.length === 0) {
    return <div className="text-gray-400 text-sm py-4">No data</div>;
  }

  const total = blocks[blocks.length - 1].end;
  const minBlockWidth = 60;

  const colorMap = new Map<string, string>();
  let colorIdx = 0;
  for (const b of blocks) {
    if (b.label !== 'IDLE' && !colorMap.has(b.label)) {
      colorMap.set(b.label, COLORS[colorIdx % COLORS.length]);
      colorIdx++;
    }
  }

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold text-gray-300 mb-3">{title}</h4>
      <div className="overflow-x-auto pb-2">
        <div className="flex items-stretch gap-0.5 min-w-fit">
          {blocks.map((block, i) => {
            const duration = block.end - block.start;
            const width = Math.max(minBlockWidth, duration * 20);
            const isIdle = block.label === 'IDLE';
            const color = isIdle ? IDLE_COLOR : colorMap.get(block.label)!;
            return (
              <div
                key={i}
                className="flex flex-col items-center justify-center rounded-md text-white text-xs font-medium shadow-md transition-transform hover:scale-105"
                style={{
                  width: `${width}px`,
                  minWidth: `${minBlockWidth}px`,
                  height: '56px',
                  backgroundColor: color,
                  borderLeft: '2px solid rgba(0,0,0,0.2)',
                }}
                title={`${block.label}: ${block.start} → ${block.end} (${duration}ms)`}
              >
                <span className="text-sm font-bold">{block.label}</span>
                <span className="text-[10px] opacity-80">{duration}ms</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-0.5 mt-1 min-w-fit">
          {blocks.map((block, i) => {
            const duration = block.end - block.start;
            const width = Math.max(minBlockWidth, duration * 20);
            return (
              <div key={i} className="flex justify-between text-[10px] text-gray-500" style={{ width: `${width}px`, minWidth: `${minBlockWidth}px` }}>
                <span>{block.start}</span>
                {i === blocks.length - 1 && <span>{block.end}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
