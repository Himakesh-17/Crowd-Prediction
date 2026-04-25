import Link from 'next/link';
import { ArrowRight, Activity, Map, ShieldAlert } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Deterministic Crowd Simulation System
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          Analyze <span className="text-blue-500">Crowd Safety</span><br />Before It Happens.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload venue maps, build topological flow graphs, and simulate capacity limits to proactively identify structural bottlenecks and danger zones.
        </p>
        
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/venue" 
            className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] flex items-center gap-2"
          >
            Start Analysis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="https://github.com/your-repo/crowdflow"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors border border-slate-700 hover:border-slate-600"
          >
            View Documentation
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full mt-32 relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl hover:bg-slate-900 transition-colors">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-400">
            <Map className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Venue Modeling</h3>
          <p className="text-slate-400 text-sm">Digitize physical spaces into mathematical graphs. Define node capacities and edge throughput flows.</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl hover:bg-slate-900 transition-colors">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-400">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Flow Simulation</h3>
          <p className="text-slate-400 text-sm">Run deterministic algorithms simulating crowd distributions based on scenarios like panic or rapid exit.</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl hover:bg-slate-900 transition-colors">
          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-4 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Risk Dashboards</h3>
          <p className="text-slate-400 text-sm">Visually isolate safety bottlenecks and get actionable mitigation strategies powered by AI recommendations.</p>
        </div>
      </div>
    </div>
  );
}
