import { useState, useEffect } from 'react';
import { ProcessStage } from '@/data/warehouseData';

const stageIcons: Record<string, string> = {
  inbound_dock: '📦',
  storage: '🏗️',
  picking_stage: '🖐️',
  packing_stage: '📋',
  dispatch_stage: '🚚',
};

function StageNode({ stage }: { stage: ProcessStage }) {
  const isOverloaded = stage.utilization > 90;
  const isWarning = stage.utilization > 75;
  const borderClass = isOverloaded ? 'border-status-red/60 shadow-[0_0_12px_hsl(var(--status-red)/0.2)]' : isWarning ? 'border-status-amber/40' : 'border-border';

  return (
    <div className={`relative rounded-lg border-2 bg-card p-3 min-w-[140px] transition-all duration-500 ${borderClass}`}>
      {isOverloaded && (
        <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-status-red animate-pulse-glow" />
      )}
      <div className="text-center">
        <span className="text-2xl">{stageIcons[stage.id] || '⚙️'}</span>
        <p className="text-sm font-semibold mt-1">{stage.label}</p>
      </div>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Queue</span>
          <span className={`data-mono font-medium ${stage.queueSize > 30 ? 'text-status-red' : 'text-foreground'}`}>{stage.queueSize}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cycle</span>
          <span className="data-mono font-medium">{stage.avgCycleTime}m</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Util</span>
          <span className={`data-mono font-medium ${isOverloaded ? 'text-status-red' : isWarning ? 'text-status-amber' : 'text-status-green'}`}>{stage.utilization.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Errors</span>
          <span className={`data-mono font-medium ${stage.errorRate > 2 ? 'text-status-red' : 'text-foreground'}`}>{stage.errorRate.toFixed(1)}%</span>
        </div>
      </div>
      {/* Utilization bar */}
      <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isOverloaded ? 'bg-status-red' : isWarning ? 'bg-status-amber' : 'bg-status-green'}`}
          style={{ width: `${Math.min(100, stage.utilization)}%` }}
        />
      </div>
    </div>
  );
}

function FlowDots() {
  const [dots, setDots] = useState<{ id: number; position: number }[]>([]);
  const nextId = useState({ current: 0 })[0];

  useEffect(() => {
    const interval = setInterval(() => {
      nextId.current++;
      setDots(prev => {
        const updated = prev
          .map(d => ({ ...d, position: d.position + 2 }))
          .filter(d => d.position < 105);
        return [...updated, { id: nextId.current, position: 0 }];
      });
    }, 300);
    return () => clearInterval(interval);
  }, [nextId]);

  return (
    <>
      {dots.map(dot => (
        <div
          key={dot.id}
          className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]"
          style={{
            left: `${dot.position}%`,
            opacity: dot.position < 5 || dot.position > 95 ? 0.3 : 0.9,
            transition: 'left 0.3s linear, opacity 0.3s',
          }}
        />
      ))}
    </>
  );
}

interface DigitalTwinProps {
  stages: ProcessStage[];
}

export default function DigitalTwin({ stages }: DigitalTwinProps) {
  const [timeView, setTimeView] = useState<'today' | 'yesterday' | 'compare'>('today');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Warehouse Digital Twin</h2>
        <div className="flex gap-1 rounded-md border bg-secondary/50 p-0.5">
          {(['today', 'yesterday', 'compare'] as const).map(v => (
            <button key={v} onClick={() => setTimeView(v)} className={`px-3 py-1 text-xs rounded capitalize transition-colors ${timeView === v ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
              {v === 'compare' ? 'Compare Shifts' : v}
            </button>
          ))}
        </div>
      </div>

      {/* Flow diagram */}
      <div className="rounded-lg border bg-card p-6 overflow-x-auto">
        <div className="flex items-center gap-0 min-w-[700px]">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center">
              <StageNode stage={stage} />
              {i < stages.length - 1 && (
                <div className="relative w-16 h-8 mx-1">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-primary" />
                  <FlowDots />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stage summary table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/30">
              <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-wider">Stage</th>
              <th className="text-right p-3 text-xs text-muted-foreground uppercase tracking-wider">Queue</th>
              <th className="text-right p-3 text-xs text-muted-foreground uppercase tracking-wider">Cycle Time</th>
              <th className="text-right p-3 text-xs text-muted-foreground uppercase tracking-wider">Utilization</th>
              <th className="text-right p-3 text-xs text-muted-foreground uppercase tracking-wider">Error Rate</th>
              <th className="text-right p-3 text-xs text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {stages.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="p-3 font-medium">{stageIcons[s.id]} {s.label}</td>
                <td className="p-3 text-right data-mono">{s.queueSize}</td>
                <td className="p-3 text-right data-mono">{s.avgCycleTime}m</td>
                <td className="p-3 text-right data-mono">{s.utilization.toFixed(0)}%</td>
                <td className="p-3 text-right data-mono">{s.errorRate.toFixed(1)}%</td>
                <td className="p-3 text-right">
                  <span className={`inline-flex h-2.5 w-2.5 rounded-full ${s.utilization > 90 ? 'bg-status-red animate-pulse-glow' : s.utilization > 75 ? 'bg-status-amber' : 'bg-status-green'}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
