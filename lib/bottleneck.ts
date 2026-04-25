import { Edge, Node } from '../types/graph';

export function detectBottlenecks(nodes: Node[], edges: Edge[]): Record<string, number> {
  // Returns Edge ID -> bottleneck_factor (0.0 to 1.0)
  const bottleneckFactors: Record<string, number> = {};

  // Find incoming and outgoing edges for each node
  const incomingToNode: Record<string, Edge[]> = {};
  const outgoingFromNode: Record<string, Edge[]> = {};

  nodes.forEach(node => {
    incomingToNode[node.id] = [];
    outgoingFromNode[node.id] = [];
  });

  edges.forEach(edge => {
    if (incomingToNode[edge.to]) {
      incomingToNode[edge.to].push(edge);
    }
    if (outgoingFromNode[edge.from]) {
      outgoingFromNode[edge.from].push(edge);
    }
  });

  // Analyze each node for bottlenecks
  nodes.forEach(node => {
    const incoming = incomingToNode[node.id] || [];
    const outgoing = outgoingFromNode[node.id] || [];
    
    const totalIncomingCapacity = incoming.reduce((sum, e) => sum + e.max_flow, 0);
    const totalOutgoingCapacity = outgoing.reduce((sum, e) => sum + e.max_flow, 0);

    const isMergePoint = incoming.length > outgoing.length && outgoing.length > 0;
    const isNarrowing = totalIncomingCapacity > totalOutgoingCapacity && outgoing.length > 0;

    // Distribute bottleneck factor to outgoing edges (since they restrict the flow)
    if (isMergePoint || isNarrowing) {
      let bFactor = 0;
      if (totalOutgoingCapacity > 0) {
        bFactor = Math.min(1.0, (totalIncomingCapacity - totalOutgoingCapacity) / totalIncomingCapacity);
      }
      
      // Ensure there's a minimum bottleneck factor if it's purely a structural merge count
      if (isMergePoint && bFactor < 0.2) bFactor = 0.3;

      outgoing.forEach(outEdge => {
        bottleneckFactors[outEdge.id] = bFactor;
      });
      // also weakly apply to incoming edges backing up
      incoming.forEach(inEdge => {
        bottleneckFactors[inEdge.id] = Math.max(bottleneckFactors[inEdge.id] || 0, bFactor * 0.5);
      });
    }
  });

  // Ensure all edges have at least 0
  edges.forEach(edge => {
    if (bottleneckFactors[edge.id] === undefined) {
      bottleneckFactors[edge.id] = 0;
    }
  });

  return bottleneckFactors;
}
