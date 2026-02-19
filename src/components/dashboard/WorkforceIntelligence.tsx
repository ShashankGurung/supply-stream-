import { WorkerData, HourlyProductivity } from '@/data/warehouseData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Users, AlertTriangle } from 'lucide-react';

function ZoneHeatmap({ workers }: { workers: WorkerData[] }) {
  const zones = ['A', 'B', 'C'] as const;
  const zoneData = zones.map(zone => {
    const zoneWorkers = workers.filter(w => w.zone === zone);
    const avgPicks = Math.round(zoneWorkers.reduce((s, w) => s + w.picksPerHour, 0) / (zoneWorkers.length || 1));
    const avgError = Number((zoneWorkers.reduce((s, w) => s + w.errorRate, 0) / (zoneWorkers.length || 1)).toFixed(1));
    const count = zoneWorkers.length;
    return { zone, avgPicks, avgError, count };
  });

  const maxPicks = Math.max(...zoneData.map(z => z.avgPicks));

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Zone Productivity</h3>
      <div className="grid grid-cols-3 gap-3">
        {zoneData.map(z => {
          const intensity = z.avgPicks / maxPicks;
          const bgClass = intensity > 0.85 ? 'bg-status-green/20 border-status-green/30' : intensity > 0.7 ? 'bg-status-amber/20 border-status-amber/30' : 'bg-status-red/20 border-status-red/30';
          return (
            <div key={z.zone} className={`rounded-lg border p-3 text-center transition-all duration-500 ${bgClass}`}>
              <p className="text-lg font-bold">Zone {z.zone}</p>
              <p className="text-2xl data-mono font-bold mt-1">{z.avgPicks}</p>
              <p className="text-xs text-muted-foreground">picks/hr</p>
              <p className="text-xs mt-1">Err: <span className={`data-mono ${z.avgError > 3 ? 'text-status-red' : 'text-status-green'}`}>{z.avgError}%</span></p>
              <p className="text-xs text-muted-foreground">{z.count} workers</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShiftComparison({ workers }: { workers: WorkerData[] }) {
  const shifts = ['A', 'B'] as const;
  const data = shifts.map(shift => {
    const sw = workers.filter(w => w.shift === shift);
    return {
      shift: `Shift ${shift}`,
      'Picks/Hr': Math.round(sw.reduce((s, w) => s + w.picksPerHour, 0) / (sw.length || 1)),
      'Error Rate': Number((sw.reduce((s, w) => s + w.errorRate, 0) / (sw.length || 1)).toFixed(1)),
    };
  });

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Shift Comparison</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="shift" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Picks/Hr" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Error Rate" fill="hsl(var(--status-amber))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function HourlyChart({ data }: { data: HourlyProductivity[] }) {
  const chartData = data.map(d => ({
    hour: `${d.hour}:00`,
    'Picks/Hr': d.picksPerHour,
    'Error %': d.errorRate,
  }));

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Hour-of-Day Performance</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="hour" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="Picks/Hr" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Error %" stroke="hsl(var(--status-red))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SuggestedReassignment({ workers }: { workers: WorkerData[] }) {
  const zones = ['A', 'B', 'C'] as const;
  const zoneLoads = zones.map(z => {
    const zw = workers.filter(w => w.zone === z);
    return { zone: z, avgLoad: zw.reduce((s, w) => s + w.picksPerHour, 0) / (zw.length || 1), count: zw.length };
  });
  
  const maxZone = zoneLoads.reduce((a, b) => a.avgLoad > b.avgLoad ? a : b);
  const minZone = zoneLoads.reduce((a, b) => a.avgLoad < b.avgLoad ? a : b);
  const imbalance = maxZone.avgLoad / (minZone.avgLoad || 1);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Suggested Reassignment</h3>
      </div>
      {imbalance > 1.15 ? (
        <div className="rounded-md border border-status-amber/30 bg-status-amber/5 p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-3.5 w-3.5 text-status-amber" />
            <span className="text-sm font-medium">Zone imbalance detected</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Move 1 picker from Zone {minZone.zone} ({Math.round(minZone.avgLoad)} picks/hr avg) to Zone {maxZone.zone} ({Math.round(maxZone.avgLoad)} picks/hr avg) to balance workload.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Zones are balanced. No reassignment needed.</p>
      )}
    </div>
  );
}

interface WorkforceIntelligenceProps {
  workers: WorkerData[];
  hourlyProductivity: HourlyProductivity[];
}

export default function WorkforceIntelligence({ workers, hourlyProductivity }: WorkforceIntelligenceProps) {
  const totalPicks = Math.round(workers.reduce((s, w) => s + w.picksPerHour, 0) / workers.length);
  const totalError = Number((workers.reduce((s, w) => s + w.errorRate, 0) / workers.length).toFixed(1));
  const overtimeWorkers = workers.filter(w => w.hoursWorked > 8).length;
  const efficiency = Math.min(100, Math.round((totalPicks / 50) * 100 * (1 - totalError / 100)));

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-semibold">Workforce Productivity Intelligence</h2>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground uppercase">Efficiency Score</p>
          <p className={`text-2xl font-bold data-mono ${efficiency > 80 ? 'text-status-green' : efficiency > 60 ? 'text-status-amber' : 'text-status-red'}`}>{efficiency}%</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground uppercase">Avg Picks/Hr</p>
          <p className="text-2xl font-bold data-mono">{totalPicks}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground uppercase">Avg Error Rate</p>
          <p className={`text-2xl font-bold data-mono ${totalError > 3 ? 'text-status-red' : 'text-status-green'}`}>{totalError}%</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground uppercase">In Overtime</p>
          <p className={`text-2xl font-bold data-mono ${overtimeWorkers > 3 ? 'text-status-amber' : 'text-foreground'}`}>{overtimeWorkers}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground uppercase">Active Workers</p>
          <p className="text-2xl font-bold data-mono">{workers.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ShiftComparison workers={workers} />
        <ZoneHeatmap workers={workers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <HourlyChart data={hourlyProductivity} />
        </div>
        <SuggestedReassignment workers={workers} />
      </div>
    </div>
  );
}
