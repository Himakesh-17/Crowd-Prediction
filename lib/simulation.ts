import { Node, Edge, Scenario, SimulationOutput, NodeMetrics, EdgeMetrics, EdgeType } from '../types/graph';
import { detectBottlenecks } from './bottleneck';

function getPathTypeFactor(type: EdgeType): number {
  switch (type) {
    case 'stairs': return 1.0;     // high risk
    case 'queue': return 0.8;
    case 'corridor': return 0.5;   // medium risk
    case 'ramp': return 0.5;
    case 'exit': return 0.3;
    case 'platform': return 0.2;
    case 'open-area': return 0.0;  // low risk
    default: return 0.5;
  }
}

function getBehaviorMultiplier(mode: string): number {
  if (mode === 'panic') return 1.5;
  if (mode === 'rushed') return 1.2;
  return 1.0;
}

function classifyRisk(score: number): 'SAFE' | 'WARNING' | 'DANGER' {
  if (score <= 0.4) return 'SAFE';
  if (score <= 0.7) return 'WARNING';
  return 'DANGER';
}

export function runSimulation(nodes: Node[], edges: Edge[], scenario: Scenario): SimulationOutput {
  const behaviorMult = getBehaviorMultiplier(scenario.behavior_mode);
  
  const bottleneckFactors = detectBottlenecks(nodes, edges);
  
  const nodeMetrics: Record<string, NodeMetrics> = {};
  const edgeMetrics: Record<string, EdgeMetrics> = {};

  const totalCrowd = scenario.total_crowd;
  const DURATION_MINS = 15; // Simulate peak phase over 15 mins

  // Evaluate initial influx per minute
  const externalInflux: Record<string, number> = {};
  nodes.forEach(n => externalInflux[n.id] = 0);
  Object.keys(scenario.entry_distribution).forEach(nodeId => {
    const percentage = scenario.entry_distribution[nodeId] || 0;
    externalInflux[nodeId] += (percentage * totalCrowd) / DURATION_MINS;
  });

  const outgoingFromNode: Record<string, Edge[]> = {};
  nodes.forEach(n => outgoingFromNode[n.id] = []);
  edges.forEach(e => {
      if (outgoingFromNode[e.from]) {
          outgoingFromNode[e.from].push(e);
      }
  });

  const peopleQueue: Record<string, number> = {};
  nodes.forEach(n => peopleQueue[n.id] = 0);

  const edgeFlowSum: Record<string, number> = {};
  edges.forEach(e => edgeFlowSum[e.id] = 0);
  
  const nodeOutfluxSum: Record<string, number> = {};
  nodes.forEach(n => nodeOutfluxSum[n.id] = 0);

  // Discrete time-step simulation (1 minute per step)
  for(let minute = 0; minute < DURATION_MINS; minute++) {
    const nextQueue: Record<string, number> = {};
    nodes.forEach(n => nextQueue[n.id] = 0);
    
    nodes.forEach(node => {
      // People combining at this node right now
      const totalPeopleToMove = peopleQueue[node.id] + externalInflux[node.id];
      
      const outgoing = outgoingFromNode[node.id];
      if (outgoing.length === 0) {
        // Exit node absorbs people
        nextQueue[node.id] += totalPeopleToMove;
        return;
      }
      
      const totalOutCapacity = outgoing.reduce((sum, e) => sum + (e.max_flow * behaviorMult), 0);
      
      let actualOutflux = totalPeopleToMove;
      if (totalPeopleToMove > totalOutCapacity) {
        actualOutflux = totalOutCapacity;
      }
      
      // Node tracks people trying to leave
      nodeOutfluxSum[node.id] += actualOutflux;
      
      // People who couldn't leave queue up
      nextQueue[node.id] += totalPeopleToMove - actualOutflux;
      
      outgoing.forEach(edge => {
        if (actualOutflux <= 0 || totalOutCapacity <= 0) return;
        
        const capacityShare = (edge.max_flow * behaviorMult) / totalOutCapacity;
        const assignedFlow = actualOutflux * capacityShare;
        
        edgeFlowSum[edge.id] += assignedFlow;
        nextQueue[edge.to] += assignedFlow;
      });
    });
    
    Object.assign(peopleQueue, nextQueue);
  }

  // Calculate Metrics for Edges
  edges.forEach(edge => {
    // Average flow per minute
    const current_flow = edgeFlowSum[edge.id] / DURATION_MINS;
    
    // Step 4
    let flow_ratio = current_flow / (edge.max_flow || 1);
    flow_ratio = Math.min(1.0, flow_ratio / behaviorMult); // ratio normalises with behavior

    const bFactor = bottleneckFactors[edge.id] || 0;
    // Step 5
    const pFactor = getPathTypeFactor(edge.type);
    
    // Step 6: Edge Risk Score
    const density_ratio = Math.min(1.0, flow_ratio); 

    const risk_score = 
      0.4 * density_ratio +
      0.3 * flow_ratio +
      0.2 * bFactor +
      0.1 * pFactor;

    edgeMetrics[edge.id] = {
      current_flow: Math.round(current_flow),
      flow_ratio,
      bottleneck_factor: bFactor,
      path_type_factor: pFactor,
      risk_score: Math.min(1.0, risk_score),
      risk_category: classifyRisk(Math.min(1.0, risk_score)),
      is_critical: bFactor > 0.5 || flow_ratio > 0.8 || risk_score > 0.7
    };
  });

  // Calculate Metrics for Nodes
  nodes.forEach(node => {
      // Node holds its lingering queue + transit representation
      const queueSize = peopleQueue[node.id];
      const avgOutflux = nodeOutfluxSum[node.id] / DURATION_MINS;
      
      // Add a realistic 0.5 minute transit presence if there's steady flow through
      // If it's a sink (exit), the queue size is the cumulative crowd that arrived correctly.
      let current_people = queueSize;
      if (outgoingFromNode[node.id].length > 0) {
         current_people += avgOutflux * 0.5;
      }
      
      let capacity = node.max_safe_capacity;
      // Step 4
      const density_ratio = Math.min(1.2, current_people / (capacity || 1));
      
      const risk_score = Math.min(1.0, density_ratio);
      
      nodeMetrics[node.id] = {
          current_people: Math.round(current_people),
          density_ratio,
          risk_score,
          risk_category: classifyRisk(risk_score)
      };
  });

  // Calculate global risk score
  const allRiskScores = [
    ...Object.values(nodeMetrics).map(m => m.risk_score),
    ...Object.values(edgeMetrics).map(m => m.risk_score)
  ];
  
  const global_risk_score = allRiskScores.length > 0 
    ? allRiskScores.reduce((a, b) => a + b, 0) / allRiskScores.length 
    : 0;

  return {
    node_metrics: nodeMetrics,
    edge_metrics: edgeMetrics,
    global_risk_score
  };
}
