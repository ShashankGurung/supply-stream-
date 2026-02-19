import { useState } from 'react';
import { MetricNode, Bottleneck, Recommendation } from '@/data/warehouseData';
import { ChevronRight, ChevronDown, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const statusDot: Record<string, string> = {
  green: 'bg-status-green',
  yellow: 'bg-status-amber',
  red: 'bg-status-red',
};

const statusText: Record<string, string> = {
  green: 'text-status-green',
  yellow: 'text-status-amber',
  red: 'text-status-red',
};

function MetricTreeNode({ node, depth = 0, onSelect, selectedId }: {
  node: MetricNode; depth?: number; onSelect?: (id: string) => void; selectedId?: string;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const variance = ((node.current - node.target) / node.target * 100).toFixed(1);
  const isSelected = selectedId === node.id;

  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer transition-colors hover:bg-secondary/50 ${isSelected ? 'bg-secondary' : ''}`}
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
            onClick={() => {
              if (hasChildren) setExpanded(!expanded);
              onSelect?.(node.id);
            }}
          >
            {hasChildren ? (
              expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : <div className="w-4" />}
            <div className={`h-2 w-2 rounded-full shrink-0 ${statusDot[node.status]}`} />
            <span className="text-sm font-medium flex-1">{node.label}</span>
            <span className={`text-sm data-mono font-semibold ${statusText[node.status]}`}>
              {node.current}{node.unit}
            </span>
            <span className="text-xs text-muted-foreground data-mono w-16 text-right">
              /{node.target}{node.unit}
            </span>
            <span className={`text-xs data-mono w-14 text-right ${Number(variance) > 0 ? 'text-status-red' : 'text-status-green'}`}>
              {Number(variance) > 0 ? '+' : ''}{variance}%
            </span>
            <div className={`${statusText[node.status]}`}>
              {node.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : node.trend === 'down' ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="text-xs">{node.label}: {node.current}{node.unit} (target: {node.target}{node.unit})</p>
          <p className="text-xs text-muted-foreground">Variance: {variance}% | Status: {node.status}</p>
        </TooltipContent>
      </Tooltip>
      {expanded && hasChildren && node.children!.map(child => (
        <MetricTreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />
      ))}
    </div>
  );
}

function BottlenecksPanel({ bottlenecks }: { bottlenecks: Bottleneck[] }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-status-amber" />
        <h3 className="text-sm font-semibold">Top Bottlenecks</h3>
      </div>
      <div className="space-y-2">
        {bottlenecks.map((b, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-xs data-mono text-status-red font-bold mt-0.5">#{i + 1}</span>
            <div>
              <p className="font-medium">{b.stage}</p>
              <p className="text-xs text-muted-foreground">{b.description}</p>
              <p className="text-xs data-mono text-status-amber">Impact: {b.impact}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Recommended Actions</h3>
      </div>
      <div className="space-y-2">
        {recommendations.map((r, i) => (
          <div key={i} className={`rounded-md border px-3 py-2 text-sm ${r.severity === 'red' ? 'border-status-red/30 bg-status-red/5' : r.severity === 'yellow' ? 'border-status-amber/30 bg-status-amber/5' : 'border-status-green/30 bg-status-green/5'}`}>
            <p className="font-medium">{r.action}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{r.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface OperationsCenterProps {
  metrics: MetricNode;
  bottlenecks: Bottleneck[];
  recommendations: Recommendation[];
  onMetricSelect?: (id: string) => void;
  selectedMetricId?: string;
}

export default function OperationsCenter({ metrics, bottlenecks, recommendations, onMetricSelect, selectedMetricId }: OperationsCenterProps) {
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Operations Command Center</h2>
        <div className="flex gap-1 rounded-md border bg-secondary/50 p-0.5">
          <button onClick={() => setViewMode('tree')} className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === 'tree' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Tree View</button>
          <button onClick={() => setViewMode('flat')} className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === 'flat' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Flat View</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Delivery Timeliness Metrics</h3>
          {viewMode === 'tree' ? (
            <MetricTreeNode node={metrics} onSelect={onMetricSelect} selectedId={selectedMetricId} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[metrics, ...(metrics.children || [])].map(node => (
                <div key={node.id} className={`rounded-md border p-3 cursor-pointer transition-colors hover:bg-secondary/50 ${selectedMetricId === node.id ? 'bg-secondary' : ''}`} onClick={() => onMetricSelect?.(node.id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-2 w-2 rounded-full ${statusDot[node.status]}`} />
                    <span className="text-xs font-medium">{node.label}</span>
                  </div>
                  <span className={`text-xl data-mono font-bold ${statusText[node.status]}`}>{node.current}{node.unit}</span>
                  <span className="text-xs text-muted-foreground ml-1">/ {node.target}{node.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <BottlenecksPanel bottlenecks={bottlenecks} />
          <RecommendationsPanel recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
}
