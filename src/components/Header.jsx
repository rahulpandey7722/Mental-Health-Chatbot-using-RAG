import React from 'react';
import { ShieldAlert, Heart, Wind, Database } from 'lucide-react';

export default function Header({ onOpenEmergency, onOpenBreathing, onOpenGrounding, onOpenRAGInspector }) {
  return (
    <header className="sticky top-0 z-30 bg-[#0b1329]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <Heart className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              MindHaven
              <span className="text-[11px] font-normal text-teal-300/80 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-500/20">
                RAG Coping AI
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Quick Calm Button */}
          <button
            onClick={onOpenBreathing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors"
          >
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Calm Breathing</span>
          </button>

          {/* RAG Knowledge Database */}
          <button
            onClick={onOpenRAGInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">RAG Sources</span>
          </button>

          {/* Clear Emergency SOS Button */}
          <button
            onClick={onOpenEmergency}
            className="sos-button-glow flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>

        </div>

      </div>
    </header>
  );
}
