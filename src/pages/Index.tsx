import { useState } from 'react';
import { useWarehouseSimulation } from '@/hooks/useWarehouseSimulation';
import KPIBar from '@/components/dashboard/KPIBar';
import OperationsCenter from '@/components/dashboard/OperationsCenter';
import CostToServe from '@/components/dashboard/CostToServe';
import WorkforceIntelligence from '@/components/dashboard/WorkforceIntelligence';
import DigitalTwin from '@/components/dashboard/DigitalTwin';
import IncidentSimulator from '@/components/dashboard/IncidentSimulator';
import { Activity, DollarSign, Users, Boxes, Sun, Moon, Pause, Play } from 'lucide-react';

const tabs = [
  { id: 'operations', label: 'Operations', icon: Activity },
  { id: 'cost', label: 'Cost-to-Serve', icon: DollarSign },
  { id: 'workforce', label: 'Workforce', icon: Users },
  { id: 'twin', label: 'Digital Twin', icon: Boxes },
] as const;

type TabId = typeof tabs[number]['id'];

export default function Index() {
  const { state, activeIncident, triggerIncident, isPaused, setIsPaused } = useWarehouseSimulation();
  const [activeTab, setActiveTab] = useState<TabId>('operations');
  const [selectedMetricId, setSelectedMetricId] = useState<string | undefined>();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
    return true;
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Boxes className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Warehouse Decision Intelligence</h1>
              <p className="text-xs text-muted-foreground">Real-time Supply Chain Control Tower</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-status-green animate-pulse" />
              Live
            </div>
            <button onClick={() => setIsPaused(!isPaused)} className="p-2 rounded-md hover:bg-secondary transition-colors" title={isPaused ? 'Resume' : 'Pause'}>
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-secondary transition-colors">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <IncidentSimulator onTrigger={triggerIncident} activeIncident={activeIncident} />
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-4 max-w-[1600px] mx-auto space-y-4">
        {/* KPI Bar */}
        <KPIBar kpis={state.kpis} />

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'operations' && (
          <OperationsCenter
            metrics={state.deliveryMetrics}
            bottlenecks={state.bottlenecks}
            recommendations={state.recommendations}
            onMetricSelect={setSelectedMetricId}
            selectedMetricId={selectedMetricId}
          />
        )}
        {activeTab === 'cost' && (
          <CostToServe costTree={state.costTree} selectedMetricId={selectedMetricId} />
        )}
        {activeTab === 'workforce' && (
          <WorkforceIntelligence workers={state.workers} hourlyProductivity={state.hourlyProductivity} />
        )}
        {activeTab === 'twin' && (
          <DigitalTwin stages={state.stages} />
        )}
      </main>
    </div>
  );
}
