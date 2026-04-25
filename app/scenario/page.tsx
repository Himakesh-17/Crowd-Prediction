"use client";

import { useAppStore } from '@/lib/store';
import { BehaviorMode, EventPhase } from '@/types/graph';
import Link from 'next/link';

export default function ScenarioPage() {
  const { scenario, updateScenario, nodes } = useAppStore();

  const entryNodes = nodes.filter(n => n.type === 'entry');
  const exitNodes = nodes.filter(n => n.type === 'exit');

  const handleEntryDistChange = (nodeId: string, value: string) => {
    updateScenario({
      entry_distribution: {
        ...scenario.entry_distribution,
        [nodeId]: Number(value) / 100 // store as fraction 0-1
      }
    });
  };

  const handleExitPrefChange = (nodeId: string, value: string) => {
    updateScenario({
      exit_preference: {
        ...scenario.exit_preference,
        [nodeId]: Number(value) / 100 // store as fraction 0-1
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">Simulation Scenario</h1>
          <p className="text-slate-400 mt-2">Configure crowd variables to model potential risks.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
            Run Simulation
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Global Crowds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Total Expected Crowd</label>
                <input 
                  type="number" 
                  value={scenario.total_crowd}
                  onChange={(e) => updateScenario({ total_crowd: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Behavior Mode</label>
                <select 
                  value={scenario.behavior_mode}
                  onChange={(e) => updateScenario({ behavior_mode: e.target.value as BehaviorMode })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="normal">Normal (Orderly, relaxed pace)</option>
                  <option value="rushed">Rushed (Faster pace, minor pushing)</option>
                  <option value="panic">Panic (Disorder, very fast pace, ignoring rules)</option>
                </select>
                <p className="mt-2 text-xs text-slate-500">Panic mode increases flow pressure and limits effective capacity.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Event Phase</label>
                <div className="flex rounded-lg overflow-hidden border border-slate-800">
                  {(['entry', 'peak', 'exit'] as EventPhase[]).map(phase => (
                    <button
                      key={phase}
                      onClick={() => updateScenario({ event_phase: phase })}
                      className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                        scenario.event_phase === phase 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Gate Distributions</h3>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Entry Distribution (%)</h4>
              {entryNodes.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No entry nodes defined in venue.</p>
              ) : (
                entryNodes.map(node => (
                  <div key={node.id} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-white">{node.name}</span>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={(scenario.entry_distribution[node.id] || 0) * 100}
                      onChange={(e) => handleEntryDistChange(node.id, e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-white text-right"
                    />
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4 mt-8 pt-6 border-t border-slate-800">
              <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Exit Preference (%)</h4>
              {exitNodes.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No exit nodes defined in venue.</p>
              ) : (
                exitNodes.map(node => (
                  <div key={node.id} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-white">{node.name}</span>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={(scenario.exit_preference[node.id] || 0) * 100}
                      onChange={(e) => handleExitPrefChange(node.id, e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-white text-right"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
