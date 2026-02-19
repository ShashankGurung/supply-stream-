import { IncidentType } from '@/data/warehouseData';
import { Zap, AlertTriangle, Bug, TrendingUp } from 'lucide-react';

const incidents: { type: Exclude<IncidentType, null>; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'surge', label: 'Order Surge', icon: <TrendingUp className="h-4 w-4" />, description: 'Simulate 60% increase in incoming orders' },
  { type: 'picking_slowdown', label: 'Picking Slowdown', icon: <AlertTriangle className="h-4 w-4" />, description: 'Simulate equipment failure in Zone B' },
  { type: 'error_spike', label: 'Error Spike', icon: <Bug className="h-4 w-4" />, description: 'Simulate quality control breakdown' },
];

interface IncidentSimulatorProps {
  onTrigger: (type: IncidentType) => void;
  activeIncident: IncidentType;
}

export default function IncidentSimulator({ onTrigger, activeIncident }: IncidentSimulatorProps) {
  return (
    <div className="flex items-center gap-2">
      {activeIncident && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-red/10 border border-status-red/30 text-xs text-status-red animate-pulse-glow">
          <Zap className="h-3.5 w-3.5" />
          <span className="font-medium capitalize">{activeIncident.replace('_', ' ')} Active</span>
        </div>
      )}
      <div className="relative group">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Zap className="h-4 w-4" />
          Simulate Incident
        </button>
        <div className="absolute right-0 top-full mt-1 w-64 rounded-lg border bg-card shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {incidents.map(inc => (
            <button
              key={inc.type}
              onClick={() => onTrigger(inc.type)}
              disabled={activeIncident === inc.type}
              className="w-full flex items-start gap-3 p-3 hover:bg-secondary/50 transition-colors first:rounded-t-lg last:rounded-b-lg disabled:opacity-50 text-left"
            >
              <div className="mt-0.5 text-primary">{inc.icon}</div>
              <div>
                <p className="text-sm font-medium">{inc.label}</p>
                <p className="text-xs text-muted-foreground">{inc.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
