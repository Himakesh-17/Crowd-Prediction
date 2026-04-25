"use client";

import { useAppStore } from '@/lib/store';
import { runSimulation } from '@/lib/simulation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Play, AlertTriangle, ShieldCheck, Activity, BrainCircuit, RefreshCw, Map } from 'lucide-react';
import { ReactFlow, Background, Controls, Node as FlowNode, Edge as FlowEdge, MarkerType, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ReactMarkdown from 'react-markdown';

export default function DashboardPage() {
  const { nodes, edges, scenario, setSimulationOutput, simulation_output, map_url } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [flowEdges, setFlowEdges] = useState<FlowEdge[]>([]);

  useEffect(() => {
    // Generate initial React Flow elements when nodes/edges change or simulation output changes
    let initialX = 100;
    let initialY = 100;

    const newNodes: FlowNode[] = nodes.map((node, i) => {
      // Very basic grid layout
      const x = initialX + (i % 4) * 250;
      const y = initialY + Math.floor(i / 4) * 150;

      const metrics = simulation_output?.node_metrics[node.id];
      let bgClass = 'bg-slate-800 border-slate-600';
      
      if (metrics) {
        if (metrics.risk_category === 'SAFE') bgClass = 'bg-emerald-900 border-emerald-500';
        if (metrics.risk_category === 'WARNING') bgClass = 'bg-yellow-900 border-yellow-500';
        if (metrics.risk_category === 'DANGER') bgClass = 'bg-rose-900 border-rose-500';
      }

      return {
        id: node.id,
        position: { x, y },
        data: { 
          label: (
            <div style={{ color: 'white' }} className={`p-2 rounded font-medium text-xs ${bgClass} border-2 shadow-lg`}>
              <div className="font-bold border-b border-white/20 pb-1 mb-1">{node.name}</div>
              <div>Type: {node.type}</div>
              {metrics && (
                <>
                  <div>Density: {(metrics.density_ratio * 100).toFixed(0)}%</div>
                  <div>People: {metrics.current_people}</div>
                </>
              )}
            </div>
          ) 
        },
        type: 'default',
        style: { width: 140, padding: 0, background: 'transparent', border: 'none' }
      };
    });

    const newEdges: FlowEdge[] = edges.map(edge => {
      const metrics = simulation_output?.edge_metrics[edge.id];
      let stroke = '#64748b'; // slate-500
      let strokeWidth = 2;
      let isCritical = false;

      if (metrics) {
        if (metrics.risk_category === 'SAFE') stroke = '#34d399'; // emerald-400
        if (metrics.risk_category === 'WARNING') stroke = '#fbbf24'; // yellow-400
        if (metrics.risk_category === 'DANGER') {
          stroke = '#f43f5e'; // rose-500
          strokeWidth = 4;
        }
        isCritical = metrics.is_critical;
      }

      return {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        animated: metrics !== undefined && metrics.current_flow > 0,
        style: { stroke, strokeWidth },
        label: metrics ? `${edge.name} (${metrics.current_flow}/min)` : (edge.name || edge.type),
        labelStyle: { fill: '#ffffff', fontWeight: 700, fontSize: 13 },
        labelBgStyle: { fill: '#0f172a', rx: 4, stroke: '#334155' },
        labelBgPadding: [4, 4],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: stroke,
        },
      };
    });

    // Only update if not heavily modified or just keep it simple via effect
    setFlowNodes(newNodes);
    setFlowEdges(newEdges);
  }, [nodes, edges, simulation_output]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setFlowNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setFlowEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleRunSimulation = () => {
    setIsRunning(true);
    // Simulate slight delay for UX
    setTimeout(() => {
      const results = runSimulation(nodes, edges, scenario);
      setSimulationOutput(results);
      setIsRunning(false);
      setAiExplanation(''); // Reset AI on new sim
    }, 800);
  };

  const handleExplainAI = async () => {
    if (!simulation_output) return;
    setIsAiLoading(true);
    
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          scenario,
          simulation_output
        })
      });
      const data = await res.json();
      setAiExplanation(data.text);
    } catch (e) {
      setAiExplanation("Failed to connect to AI explanation engine.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-stretch h-full overflow-hidden bg-slate-950">
      
      {/* Top Bar Insights */}
      <div className="h-16 px-6 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-white">Dashboard</h2>
            {simulation_output && (
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                simulation_output.global_risk_score > 0.7 ? 'bg-rose-500/20 text-rose-500' :
                simulation_output.global_risk_score > 0.4 ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-emerald-500/20 text-emerald-500'
              }`}>
                Score: {simulation_output.global_risk_score.toFixed(2)}
              </span>
            )}
          </div>
          
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRunSimulation} 
            disabled={isRunning || nodes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition-all text-sm"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />} 
            Run Simulation
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        
        {/* Main Vis Area */}
        <div className="flex-1 relative border-r border-slate-800 bg-slate-950 h-[calc(100vh-8rem)]">
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 flex-col gap-2">
              <Map className="w-12 h-12 opacity-50" />
              <p>No graph nodes added. Build your venue first.</p>
            </div>
          ) : (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-left"
            >
              <Background color="#1e293b" gap={16} />
              <Controls className="bg-slate-800 fill-white text-white border-none rounded-lg overflow-hidden shadow-xl" />
            </ReactFlow>
          )}

          {map_url && (
            <div className="absolute bottom-4 left-4 p-2 bg-slate-900/80 backdrop-blur rounded border border-slate-800 pointer-events-none">
              <img src={map_url} alt="Map Reference" className="w-32 h-auto opacity-50 rounded" />
              <p className="text-[10px] text-center text-slate-400 mt-1 uppercase">Map Ref</p>
            </div>
          )}
        </div>

        {/* Side Panel: Results & AI */}
        <div className="w-96 flex flex-col bg-slate-900 h-[calc(100vh-8rem)] overflow-y-auto shrink-0">
          {!simulation_output ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-4">
              <Activity className="w-16 h-16 opacity-30 text-blue-500" />
              <p>Awaiting simulation run.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              
              {/* Bottleneck Summary */}
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500" /> Top Risks</h3>
                <div className="space-y-3">
                  {edges.filter(e => simulation_output.edge_metrics[e.id]?.is_critical).map(edge => {
                    const fromNode = nodes.find(n => n.id === edge.from)?.name;
                    const toNode = nodes.find(n => n.id === edge.to)?.name;
                    return (
                      <div key={edge.id} className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-rose-100">{fromNode} → {toNode}</p>
                          <p className="text-xs text-rose-300 mt-1">Flow exceeds capacity or narrow bottleneck detected.</p>
                        </div>
                      </div>
                    )
                  })}
                  {edges.filter(e => simulation_output.edge_metrics[e.id]?.is_critical).length === 0 && (
                    <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                      <ShieldCheck className="w-4 h-4" /> No critical paths identified.
                    </div>
                  )}
                </div>
              </div>

              {/* Node Summary Table */}
              <div>
                <h3 className="font-semibold text-white mb-3 text-sm border-b border-slate-800 pb-2">Location Density</h3>
                <div className="space-y-2">
                  {nodes.map(node => {
                    const m = simulation_output.node_metrics[node.id];
                    if(!m) return null;
                    return (
                      <div key={node.id} className="flex items-center justify-between text-sm bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="truncate w-32 text-slate-200" title={node.name}>{node.name}</span>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
                          <div 
                            className={`h-full ${m.risk_category === 'DANGER' ? 'bg-rose-500' : m.risk_category === 'WARNING' ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(100, m.density_ratio * 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold w-12 text-right ${m.risk_category === 'DANGER' ? 'text-rose-500' : m.risk_category === 'WARNING' ? 'text-yellow-500' : 'text-emerald-500'}`}>
                          {(m.density_ratio * 100).toFixed(0)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AI Gemini Integration */}
              <div className="pt-4 border-t border-slate-800">
                <button 
                  onClick={handleExplainAI}
                  disabled={isAiLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
                >
                  {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                  {isAiLoading ? "Analyzing Data..." : "Explain with AI"}
                </button>
                
                {aiExplanation && (
                  <div className="mt-4 p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-lg text-sm text-indigo-100 prose prose-invert prose-p:text-sm prose-p:leading-relaxed prose-headings:text-indigo-300">
                    <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
