// Warehouse Decision Intelligence - Data Types & Mock Data

export type Status = 'green' | 'yellow' | 'red';
export type Trend = 'up' | 'down' | 'flat';
export type Shift = 'A' | 'B';
export type Zone = 'A' | 'B' | 'C';
export type IncidentType = 'surge' | 'picking_slowdown' | 'error_spike' | null;

export interface KPI {
  label: string;
  value: number;
  unit: string;
  trend: Trend;
  status: Status;
}

export interface MetricNode {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  status: Status;
  trend: Trend;
  children?: MetricNode[];
}

export interface CostNode {
  id: string;
  label: string;
  costPerOrder: number;
  weeklyImpact: number;
  changePercent: number;
  linkedMetricIds: string[];
  children?: CostNode[];
}

export interface WorkerData {
  id: string;
  zone: Zone;
  shift: Shift;
  picksPerHour: number;
  errorRate: number;
  hoursWorked: number;
}

export interface ProcessStage {
  id: string;
  label: string;
  queueSize: number;
  avgCycleTime: number;
  utilization: number;
  errorRate: number;
}

export interface Bottleneck {
  stage: string;
  impact: number;
  description: string;
}

export interface Recommendation {
  severity: Status;
  action: string;
  reason: string;
}

export interface HourlyProductivity {
  hour: number;
  picksPerHour: number;
  errorRate: number;
}

export interface WarehouseState {
  kpis: KPI[];
  deliveryMetrics: MetricNode;
  costTree: CostNode;
  workers: WorkerData[];
  stages: ProcessStage[];
  bottlenecks: Bottleneck[];
  recommendations: Recommendation[];
  hourlyProductivity: HourlyProductivity[];
}

// --- Helpers ---
function rand(min: number, max: number, decimals = 1): number {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function jitter(base: number, pct: number, decimals = 1): number {
  const delta = base * (pct / 100);
  return Number((base + (Math.random() - 0.5) * 2 * delta).toFixed(decimals));
}

function getStatus(current: number, target: number, higherIsBetter: boolean): Status {
  const ratio = higherIsBetter ? current / target : target / current;
  if (ratio >= 0.95) return 'green';
  if (ratio >= 0.85) return 'yellow';
  return 'red';
}

function getTrend(): Trend {
  const r = Math.random();
  if (r < 0.33) return 'up';
  if (r < 0.66) return 'down';
  return 'flat';
}

// --- Generators ---
function generateKPIs(): KPI[] {
  return [
    { label: 'On-Time Delivery', value: rand(89, 97), unit: '%', trend: getTrend(), status: 'green' },
    { label: 'Order Accuracy', value: rand(96, 99.5), unit: '%', trend: getTrend(), status: 'green' },
    { label: 'Orders in Queue', value: Math.round(rand(45, 120, 0)), unit: '', trend: getTrend(), status: 'yellow' },
    { label: 'Avg Cycle Time', value: rand(12, 28), unit: 'min', trend: getTrend(), status: 'green' },
    { label: 'SLA Risk Score', value: Math.round(rand(8, 45, 0)), unit: '/100', trend: getTrend(), status: 'green' },
  ];
}

function generateDeliveryMetrics(): MetricNode {
  return {
    id: 'delivery', label: 'Delivery Timeliness', current: rand(18, 26), target: 20, unit: 'min', status: 'yellow', trend: 'up',
    children: [
      { id: 'inbound', label: 'Inbound Processing', current: rand(3, 6), target: 4, unit: 'min', status: 'green', trend: 'flat' },
      { id: 'putaway', label: 'Putaway Time', current: rand(2.5, 5), target: 3, unit: 'min', status: 'yellow', trend: 'up' },
      { id: 'picking', label: 'Picking Time', current: rand(4, 9), target: 5, unit: 'min', status: 'red', trend: 'up' },
      { id: 'packing', label: 'Packing Time', current: rand(3, 6), target: 4, unit: 'min', status: 'yellow', trend: 'flat' },
      { id: 'dispatch', label: 'Dispatch Time', current: rand(2, 4), target: 3, unit: 'min', status: 'green', trend: 'down' },
    ],
  };
}

function generateCostTree(): CostNode {
  return {
    id: 'total', label: 'Cost per Order', costPerOrder: rand(4.2, 5.8), weeklyImpact: rand(28000, 42000, 0), changePercent: rand(-5, 8),
    linkedMetricIds: ['delivery'],
    children: [
      {
        id: 'labor', label: 'Labor Cost', costPerOrder: rand(1.8, 2.6), weeklyImpact: rand(12000, 18000, 0), changePercent: rand(-3, 6),
        linkedMetricIds: ['picking', 'packing'],
        children: [
          { id: 'pick_labor', label: 'Picking Labor', costPerOrder: rand(0.8, 1.2), weeklyImpact: rand(5000, 8500, 0), changePercent: rand(-2, 8), linkedMetricIds: ['picking'] },
          { id: 'pack_labor', label: 'Packing Labor', costPerOrder: rand(0.5, 0.9), weeklyImpact: rand(3500, 6000, 0), changePercent: rand(-3, 5), linkedMetricIds: ['packing'] },
          { id: 'rework_labor', label: 'Rework Labor', costPerOrder: rand(0.2, 0.5), weeklyImpact: rand(1500, 3500, 0), changePercent: rand(-1, 12), linkedMetricIds: [] },
        ],
      },
      { id: 'holding', label: 'Inventory Holding', costPerOrder: rand(0.6, 1.1), weeklyImpact: rand(4000, 7500, 0), changePercent: rand(-4, 3), linkedMetricIds: ['putaway'] },
      {
        id: 'transport', label: 'Transportation', costPerOrder: rand(0.9, 1.5), weeklyImpact: rand(6000, 10000, 0), changePercent: rand(-2, 5),
        linkedMetricIds: ['dispatch'],
        children: [
          { id: 'expedited', label: 'Expedited Shipping', costPerOrder: rand(0.4, 0.8), weeklyImpact: rand(2800, 5500, 0), changePercent: rand(0, 10), linkedMetricIds: ['dispatch'] },
          { id: 'failed_delivery', label: 'Failed Delivery', costPerOrder: rand(0.3, 0.6), weeklyImpact: rand(2000, 4000, 0), changePercent: rand(-3, 7), linkedMetricIds: [] },
        ],
      },
      {
        id: 'returns', label: 'Return Cost', costPerOrder: rand(0.4, 0.8), weeklyImpact: rand(2800, 5500, 0), changePercent: rand(-2, 9),
        linkedMetricIds: [],
        children: [
          { id: 'reverse_logistics', label: 'Reverse Logistics', costPerOrder: rand(0.2, 0.4), weeklyImpact: rand(1400, 2800, 0), changePercent: rand(-1, 6), linkedMetricIds: [] },
          { id: 'refund', label: 'Refund Processing', costPerOrder: rand(0.1, 0.3), weeklyImpact: rand(700, 2100, 0), changePercent: rand(-3, 5), linkedMetricIds: [] },
        ],
      },
    ],
  };
}

function generateWorkers(): WorkerData[] {
  const workers: WorkerData[] = [];
  const zones: Zone[] = ['A', 'B', 'C'];
  const shifts: Shift[] = ['A', 'B'];
  for (let i = 100; i < 118; i++) {
    const shift = shifts[i % 2];
    const zone = zones[i % 3];
    const hoursWorked = rand(2, 10);
    const fatigueMultiplier = hoursWorked > 6 ? 0.75 : 1;
    workers.push({
      id: `Picker #${i + 1}`,
      zone,
      shift,
      picksPerHour: Math.round(rand(30, 55) * fatigueMultiplier),
      errorRate: Number((rand(1, 4) * (hoursWorked > 6 ? 1.8 : 1)).toFixed(1)),
      hoursWorked,
    });
  }
  return workers;
}

function generateStages(): ProcessStage[] {
  return [
    { id: 'inbound_dock', label: 'Inbound Dock', queueSize: Math.round(rand(5, 25, 0)), avgCycleTime: rand(3, 6), utilization: rand(55, 90), errorRate: rand(0.5, 2) },
    { id: 'storage', label: 'Storage', queueSize: Math.round(rand(10, 40, 0)), avgCycleTime: rand(2, 5), utilization: rand(60, 85), errorRate: rand(0.3, 1.5) },
    { id: 'picking_stage', label: 'Picking', queueSize: Math.round(rand(15, 50, 0)), avgCycleTime: rand(4, 9), utilization: rand(70, 98), errorRate: rand(1, 4) },
    { id: 'packing_stage', label: 'Packing', queueSize: Math.round(rand(8, 35, 0)), avgCycleTime: rand(3, 7), utilization: rand(65, 92), errorRate: rand(0.8, 3) },
    { id: 'dispatch_stage', label: 'Dispatch', queueSize: Math.round(rand(3, 20, 0)), avgCycleTime: rand(2, 5), utilization: rand(50, 80), errorRate: rand(0.2, 1) },
  ];
}

function generateHourlyProductivity(): HourlyProductivity[] {
  return Array.from({ length: 12 }, (_, i) => {
    const hour = i + 6; // 6AM to 6PM
    const fatigueFactor = i > 6 ? Math.max(0.6, 1 - (i - 6) * 0.06) : 1;
    const shiftEndSpike = i >= 10 ? 1.5 : 1;
    return {
      hour,
      picksPerHour: Math.round(rand(38, 52) * fatigueFactor),
      errorRate: Number((rand(1.2, 2.5) * shiftEndSpike).toFixed(1)),
    };
  });
}

function calculateBottlenecks(metrics: MetricNode): Bottleneck[] {
  if (!metrics.children) return [];
  return metrics.children
    .map(c => ({
      stage: c.label,
      impact: Number((Math.abs(c.current - c.target) / c.target * 100).toFixed(1)),
      description: `${c.label} running ${c.current > c.target ? 'above' : 'at'} target: ${c.current}${c.unit} vs ${c.target}${c.unit}`,
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);
}

function generateRecommendations(metrics: MetricNode, workers: WorkerData[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const picking = metrics.children?.find(c => c.id === 'picking');
  const packing = metrics.children?.find(c => c.id === 'packing');
  
  if (picking && picking.current > picking.target * 1.2) {
    recs.push({ severity: 'red', action: 'Add 2 additional pickers to Zone B', reason: `Picking time ${picking.current}min exceeds target ${picking.target}min by ${((picking.current / picking.target - 1) * 100).toFixed(0)}%` });
  }
  if (packing && packing.current > packing.target * 1.1) {
    recs.push({ severity: 'yellow', action: 'Reallocate 1 worker from putaway to packing', reason: `Packing queue exceeding optimal threshold` });
  }
  
  const zoneB = workers.filter(w => w.zone === 'B');
  const zoneA = workers.filter(w => w.zone === 'A');
  const avgBLoad = zoneB.reduce((s, w) => s + w.picksPerHour, 0) / (zoneB.length || 1);
  const avgALoad = zoneA.reduce((s, w) => s + w.picksPerHour, 0) / (zoneA.length || 1);
  if (avgBLoad > avgALoad * 1.2) {
    recs.push({ severity: 'yellow', action: 'Move 1 picker from Zone A to Zone B', reason: `Zone B workload ${Math.round(avgBLoad)} picks/hr vs Zone A ${Math.round(avgALoad)} picks/hr` });
  }
  
  if (recs.length === 0) {
    recs.push({ severity: 'green', action: 'Operations running within normal parameters', reason: 'All metrics within target thresholds' });
  }
  return recs;
}

// --- State Generation ---
export function generateInitialState(): WarehouseState {
  const metrics = generateDeliveryMetrics();
  const workers = generateWorkers();
  return {
    kpis: generateKPIs(),
    deliveryMetrics: metrics,
    costTree: generateCostTree(),
    workers,
    stages: generateStages(),
    bottlenecks: calculateBottlenecks(metrics),
    recommendations: generateRecommendations(metrics, workers),
    hourlyProductivity: generateHourlyProductivity(),
  };
}

// --- Simulation Update ---
export function simulateUpdate(prev: WarehouseState, incident: IncidentType): WarehouseState {
  const kpis = prev.kpis.map(k => {
    let value = jitter(k.value, 3);
    if (incident === 'surge' && k.label === 'Orders in Queue') value = Math.round(value * 1.6);
    if (incident === 'picking_slowdown' && k.label === 'Avg Cycle Time') value = jitter(value * 1.3, 2);
    if (incident === 'error_spike' && k.label === 'Order Accuracy') value = Math.max(88, value - rand(2, 5));
    
    const trend: Trend = value > k.value ? 'up' : value < k.value ? 'down' : 'flat';
    let status: Status = 'green';
    if (k.label.includes('%') || k.label === 'On-Time Delivery' || k.label === 'Order Accuracy') {
      status = value > 95 ? 'green' : value > 90 ? 'yellow' : 'red';
    } else if (k.label === 'SLA Risk Score') {
      status = value < 20 ? 'green' : value < 40 ? 'yellow' : 'red';
    } else if (k.label === 'Orders in Queue') {
      status = value < 60 ? 'green' : value < 90 ? 'yellow' : 'red';
    }
    return { ...k, value, trend, status };
  });

  const updateMetricNode = (node: MetricNode): MetricNode => {
    let current = jitter(node.current, 5);
    if (incident === 'picking_slowdown' && node.id === 'picking') current = jitter(node.current * 1.4, 3);
    const status = getStatus(node.target, current, false); // lower is better for time
    return {
      ...node,
      current,
      status,
      trend: current > node.current ? 'up' : current < node.current ? 'down' : 'flat',
      children: node.children?.map(updateMetricNode),
    };
  };

  const deliveryMetrics = updateMetricNode(prev.deliveryMetrics);

  const updateCostNode = (node: CostNode): CostNode => {
    const costPerOrder = jitter(node.costPerOrder, 4, 2);
    const weeklyImpact = Math.round(jitter(node.weeklyImpact, 3, 0));
    return {
      ...node,
      costPerOrder,
      weeklyImpact,
      changePercent: Number(((costPerOrder - node.costPerOrder) / node.costPerOrder * 100).toFixed(1)),
      children: node.children?.map(updateCostNode),
    };
  };

  const costTree = updateCostNode(prev.costTree);

  const workers = prev.workers.map(w => {
    const hoursWorked = Math.min(12, w.hoursWorked + rand(0, 0.5));
    const fatigue = hoursWorked > 6 ? 0.8 : 1;
    let picksPerHour = Math.round(jitter(w.picksPerHour, 5) * fatigue);
    let errorRate = Number(jitter(w.errorRate, 8).toFixed(1));
    if (incident === 'picking_slowdown' && w.zone === 'B') picksPerHour = Math.round(picksPerHour * 0.7);
    if (incident === 'error_spike') errorRate = Number((errorRate * 1.8).toFixed(1));
    return { ...w, picksPerHour, errorRate, hoursWorked };
  });

  const stages = prev.stages.map(s => {
    let queueSize = Math.max(0, Math.round(jitter(s.queueSize, 10, 0)));
    let utilization = Math.min(100, jitter(s.utilization, 5));
    let errorRate = Math.max(0, jitter(s.errorRate, 8));
    if (incident === 'surge') { queueSize = Math.round(queueSize * 1.5); utilization = Math.min(100, utilization * 1.2); }
    if (incident === 'picking_slowdown' && s.id === 'picking_stage') { queueSize *= 2; utilization = 98; }
    if (incident === 'error_spike') errorRate = Number((errorRate * 2).toFixed(1));
    return { ...s, queueSize, utilization, errorRate, avgCycleTime: jitter(s.avgCycleTime, 5) };
  });

  const bottlenecks = calculateBottlenecks(deliveryMetrics);
  const recommendations = generateRecommendations(deliveryMetrics, workers);

  return { kpis, deliveryMetrics, costTree, workers, stages, bottlenecks, recommendations, hourlyProductivity: generateHourlyProductivity() };
}
