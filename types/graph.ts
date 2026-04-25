export type NodeType = 'entry' | 'exit' | 'merge' | 'zone';
export type EdgeType = 'corridor' | 'stairs' | 'ramp' | 'exit' | 'queue' | 'platform' | 'open-area';
export type DirectionType = 'one-way' | 'two-way' | 'multi';
export type BehaviorMode = 'normal' | 'rushed' | 'panic';
export type EventPhase = 'entry' | 'peak' | 'exit';

export interface Node {
  id: string;
  name: string;
  type: NodeType;
  area: number;
  max_safe_capacity: number;
}

export interface Edge {
  id: string;
  name: string;
  from: string;
  to: string;
  length: number;
  width: number;
  type: EdgeType;
  direction: DirectionType;
  max_flow: number;
}

export interface Scenario {
  total_crowd: number;
  entry_distribution: Record<string, number>; // node_id -> percentage (0-1)
  exit_preference: Record<string, number>;    // node_id -> percentage (0-1)
  behavior_mode: BehaviorMode;
  event_phase: EventPhase;
}

export interface NodeMetrics {
  current_people: number;
  density_ratio: number;
  risk_score: number;
  risk_category: 'SAFE' | 'WARNING' | 'DANGER';
}

export interface EdgeMetrics {
  current_flow: number;
  flow_ratio: number;
  bottleneck_factor: number;
  path_type_factor: number;
  risk_score: number;
  risk_category: 'SAFE' | 'WARNING' | 'DANGER';
  is_critical: boolean;
}

export interface SimulationOutput {
  node_metrics: Record<string, NodeMetrics>;
  edge_metrics: Record<string, EdgeMetrics>;
  global_risk_score: number;
}

export interface AppState {
  venue_name: string;
  map_url: string;
  nodes: Node[];
  edges: Edge[];
  scenario: Scenario;
  simulation_output: SimulationOutput | null;
  setVenueName: (name: string) => void;
  setMapUrl: (url: string) => void;
  addNode: (node: Node) => void;
  updateNode: (index: number, node: Node) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  updateEdge: (index: number, edge: Edge) => void;
  deleteEdge: (id: string) => void;
  updateScenario: (partial: Partial<Scenario>) => void;
  setSimulationOutput: (output: SimulationOutput) => void;
}
