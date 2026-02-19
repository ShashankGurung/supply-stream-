import { useState } from 'react';
import { CostNode } from '@/data/warehouseData';
import { ChevronRight, ChevronDown, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function CostTreeNode({ node, depth = 0, highlightedIds, onSelect }: {
  node: CostNode; depth?: number; highlightedIds: Set<string>; onSelect?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const isHighlighted = highlightedIds.has(node.id);
  const changeColor = node.changePercent > 3 ? 'text-status-red' : node.changePercent < -1 ? 'text-status-green' : 'text-muted-foreground';

  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer transition-all duration-300 hover:bg-secondary/50 ${isHighlighted ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
            onClick={() => {
              if (hasChildren) setExpanded(!expanded);
              onSelect?.(node.id);
            }}
          >
            {hasChildren ? (
              expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : <div className="w-4" />}
            <DollarSign className={`h-3.5 w-3.5 shrink-0 ${isHighlighted ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium flex-1">{node.label}</span>
            <span className="text-sm data-mono font-semibold">${node.costPerOrder.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground data-mono w-24 text-right">${(node.weeklyImpact).toLocaleString()}/wk</span>
            <div className={`flex items-center gap-0.5 text-xs data-mono w-16 text-right ${changeColor}`}>
              {node.changePercent > 0 ? <TrendingUp className="h-3 w-3" /> : node.changePercent < 0 ? <TrendingDown className="h-3 w-3" /> : null}
              {node.changePercent > 0 ? '+' : ''}{node.changePercent.toFixed(1)}%
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="text-xs font-medium">{node.label}</p>
          <p className="text-xs">Cost/Order: ${node.costPerOrder.toFixed(2)} | Weekly: ${node.weeklyImpact.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Change: {node.changePercent > 0 ? '+' : ''}{node.changePercent.toFixed(1)}% vs last week</p>
          {node.linkedMetricIds.length > 0 && <p className="text-xs text-primary mt-1">Linked to: {node.linkedMetricIds.join(', ')}</p>}
        </TooltipContent>
      </Tooltip>
      {expanded && hasChildren && node.children!.map(child => (
        <CostTreeNode key={child.id} node={child} depth={depth + 1} highlightedIds={highlightedIds} onSelect={onSelect} />
      ))}
    </div>
  );
}

function collectLinkedCostIds(node: CostNode, metricId: string, result: Set<string>) {
  if (node.linkedMetricIds.includes(metricId)) result.add(node.id);
  node.children?.forEach(c => collectLinkedCostIds(c, metricId, result));
}

interface CostToServeProps {
  costTree: CostNode;
  selectedMetricId?: string;
}

export default function CostToServe({ costTree, selectedMetricId }: CostToServeProps) {
  const highlightedIds = new Set<string>();
  if (selectedMetricId) {
    collectLinkedCostIds(costTree, selectedMetricId, highlightedIds);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cost-to-Serve Analysis</h2>
        {selectedMetricId && highlightedIds.size > 0 && (
          <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
            Showing linked costs for: {selectedMetricId}
          </span>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4">
        {/* Summary */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Cost per Order</p>
            <p className="text-3xl font-bold data-mono">${costTree.costPerOrder.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Weekly Impact</p>
            <p className="text-xl font-semibold data-mono">${costTree.weeklyImpact.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">vs Last Week</p>
            <p className={`text-xl font-semibold data-mono ${costTree.changePercent > 0 ? 'text-status-red' : 'text-status-green'}`}>
              {costTree.changePercent > 0 ? '+' : ''}{costTree.changePercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Tree */}
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Cost Breakdown</h3>
        {costTree.children?.map(child => (
          <CostTreeNode key={child.id} node={child} highlightedIds={highlightedIds} />
        ))}
      </div>
    </div>
  );
}
