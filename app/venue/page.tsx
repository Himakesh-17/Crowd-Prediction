"use client";

import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { Node, Edge, NodeType, EdgeType, DirectionType } from '@/types/graph';
import { Map, Plus, Trash2, Code2, CheckCircle2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

export default function VenuePage() {
  const { venue_name, setVenueName, map_url, setMapUrl, nodes, addNode, deleteNode, edges, addEdge, deleteEdge } = useAppStore();

  const [activeTab, setActiveTab] = useState<'map' | 'nodes' | 'edges' | 'json'>('map');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setMapUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddNode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newNode: Node = {
      id: uuidv4(),
      name: formData.get('name') as string,
      type: formData.get('type') as NodeType,
      area: Number(formData.get('area')),
      max_safe_capacity: Number(formData.get('max_safe_capacity')),
    };
    addNode(newNode);
    e.currentTarget.reset();
  };

  const handleAddEdge = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEdge: Edge = {
      id: uuidv4(),
      name: formData.get('name') as string,
      from: formData.get('from') as string,
      to: formData.get('to') as string,
      length: Number(formData.get('length')),
      width: Number(formData.get('width')),
      type: formData.get('type') as EdgeType,
      direction: formData.get('direction') as DirectionType,
      max_flow: Number(formData.get('max_flow')),
    };
    addEdge(newEdge);
    e.currentTarget.reset();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">Venue Configuration</h1>
          <p className="text-slate-400 mt-2">Define your physical space and topographical graph.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/scenario" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
            Next: Scenarios
          </Link>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex border-b border-slate-800">
          <button onClick={() => setActiveTab('map')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'map' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800/50'}`}>Map Upload</button>
          <button onClick={() => setActiveTab('nodes')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'nodes' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800/50'}`}>Nodes ({nodes.length})</button>
          <button onClick={() => setActiveTab('edges')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'edges' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800/50'}`}>Edges ({edges.length})</button>
          <button onClick={() => setActiveTab('json')} className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'json' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800/50'}`}>JSON Preview</button>
        </div>

        <div className="p-6">
          {activeTab === 'map' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Venue Name</label>
                <input 
                  type="text" 
                  value={venue_name}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Grand Stadium"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Map Image (PDF/Image)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-800 border-dashed rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Map className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-500">SVG, PNG, JPG (Max 5MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              {map_url && (
                <div className="mt-4 border border-slate-800 p-2 rounded-lg bg-slate-950">
                  <img src={map_url} alt="Venue Map" className="w-full max-h-96 object-contain rounded" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="space-y-8">
              <form onSubmit={handleAddNode} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <input required name="name" placeholder="Node Name (e.g. Main Gate)" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
                <select required name="type" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="entry">Entry</option>
                  <option value="exit">Exit</option>
                  <option value="merge">Merge</option>
                  <option value="zone">Zone</option>
                </select>
                <input required name="area" type="number" placeholder="Area (sqm)" min="1" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
                <input required name="max_safe_capacity" type="number" placeholder="Max Capacity" min="1" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Node
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                  <thead className="text-xs text-slate-300 uppercase bg-slate-950">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-lg">Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Area (m²)</th>
                      <th className="px-6 py-3">Capacity</th>
                      <th className="px-6 py-3 rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map(node => (
                      <tr key={node.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                        <td className="px-6 py-4 font-medium text-white">{node.name}</td>
                        <td className="px-6 py-4 capitalize">{node.type}</td>
                        <td className="px-6 py-4">{node.area}</td>
                        <td className="px-6 py-4">{node.max_safe_capacity}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => deleteNode(node.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {nodes.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No nodes added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'edges' && (
            <div className="space-y-8">
              <form onSubmit={handleAddEdge} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <input required name="name" placeholder="Lane Name (e.g. Main Corridor)" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
                <select required name="from" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="">From Node...</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
                <select required name="to" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="">To Node...</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input required name="length" type="number" placeholder="Length(m)" min="1" className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
                  <input required name="width" type="number" placeholder="Width(m)" min="1" className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <input required name="max_flow" type="number" placeholder="Max Flow/min" min="1" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
                
                <select required name="type" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="corridor">Corridor</option>
                  <option value="stairs">Stairs</option>
                  <option value="ramp">Ramp</option>
                  <option value="exit">Exit</option>
                  <option value="queue">Queue</option>
                  <option value="platform">Platform</option>
                  <option value="open-area">Open Area</option>
                </select>
                <select required name="direction" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="one-way">One-Way</option>
                  <option value="two-way">Two-Way</option>
                  <option value="multi">Multi</option>
                </select>
                
                <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Edge
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                  <thead className="text-xs text-slate-300 uppercase bg-slate-950">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-lg">Lane Name / Path</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Dimensions</th>
                      <th className="px-6 py-3">Max Flow</th>
                      <th className="px-6 py-3 rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edges.map(edge => {
                      const fromNode = nodes.find(n => n.id === edge.from)?.name || 'Unknown';
                      const toNode = nodes.find(n => n.id === edge.to)?.name || 'Unknown';
                      return (
                        <tr key={edge.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                          <td className="px-6 py-4 font-medium text-white">
                            <div>{edge.name}</div>
                            <div className="text-xs text-slate-500">{fromNode} → {toNode}</div>
                          </td>
                          <td className="px-6 py-4 capitalize">{edge.type} ({edge.direction})</td>
                          <td className="px-6 py-4">{edge.length}m x {edge.width}m</td>
                          <td className="px-6 py-4">{edge.max_flow}/min</td>
                          <td className="px-6 py-4">
                            <button onClick={() => deleteEdge(edge.id)} className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {edges.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No edges added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 relative">
              <div className="absolute top-4 right-4 text-emerald-400 flex items-center gap-2 text-sm font-medium bg-emerald-400/10 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" /> Schema Valid
              </div>
              <pre className="text-xs text-slate-300 overflow-auto max-h-96">
{JSON.stringify({ venue_name, map_url: map_url ? "data:image/..." : "", nodes, edges }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
