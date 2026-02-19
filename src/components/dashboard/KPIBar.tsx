import { KPI } from '@/data/warehouseData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const trendIcon = (trend: KPI['trend']) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
};

const statusColor: Record<string, string> = {
  green: 'text-status-green',
  yellow: 'text-status-amber',
  red: 'text-status-red',
};

const statusBorder: Record<string, string> = {
  green: 'border-status-green/30',
  yellow: 'border-status-amber/30',
  red: 'border-status-red/30',
};

export default function KPIBar({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={`rounded-lg border bg-card p-4 transition-all duration-500 ${statusBorder[kpi.status]}`}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-bold data-mono transition-all duration-300 ${statusColor[kpi.status]}`}>
              {kpi.value}
            </span>
            <span className="text-sm text-muted-foreground mb-0.5">{kpi.unit}</span>
          </div>
          <div className={`flex items-center gap-1 mt-1 text-xs ${statusColor[kpi.status]}`}>
            {trendIcon(kpi.trend)}
            <span className="capitalize">{kpi.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
