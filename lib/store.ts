import { create } from 'zustand';
import { AppState, Node, Edge, Scenario, SimulationOutput } from '../types/graph';

export const useAppStore = create<AppState>((set) => ({
  venue_name: '',
  map_url: '',
  nodes: [],
  edges: [],
  scenario: {
    total_crowd: 1000,
    entry_distribution: {},
    exit_preference: {},
    behavior_mode: 'normal',
    event_phase: 'entry',
  },
  simulation_output: null,

  setVenueName: (name) => set({ venue_name: name }),
  setMapUrl: (url) => set({ map_url: url }),

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (index, node) => set((state) => {
    const newNodes = [...state.nodes];
    newNodes[index] = node;
    return { nodes: newNodes };
  }),
  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== id),
    edges: state.edges.filter(e => e.from !== id && e.to !== id) // Cascade delete
  })),

  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  updateEdge: (index, edge) => set((state) => {
    const newEdges = [...state.edges];
    newEdges[index] = edge;
    return { edges: newEdges };
  }),
  deleteEdge: (id) => set((state) => ({
    edges: state.edges.filter(e => e.id !== id)
  })),

  updateScenario: (partial) => set((state) => ({
    scenario: { ...state.scenario, ...partial }
  })),

  setSimulationOutput: (output) => set({ simulation_output: output })
}));
