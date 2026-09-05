import React from 'react';
import { Database, FileText, BookOpen, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { getKnowledgeBase } from '../services/ragService';

export default function RAGInspectorModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const knowledgeItems = getKnowledgeBase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-panel border-indigo-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <Database className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                RAG Vector Knowledge Base
              </h3>
              <p className="text-xs text-slate-400">
                Indexed psychological interventions & evidence-based coping protocols ({knowledgeItems.length} modules)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RAG Explanation Banner */}
        <div className="glass-panel bg-indigo-950/30 border-indigo-500/30 p-4 rounded-xl mb-6 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-200 leading-relaxed">
            <strong className="text-white block font-semibold mb-0.5">How RAG Works in MindHaven:</strong>
            When you type symptoms or questions, our TF-IDF & Cosine Similarity vector engine searches this clinical corpus, retrieves the top $k$ matching therapeutic modules, and augments the chatbot's response with actionable steps and citations.
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-4">
          {knowledgeItems.map((item) => (
            <div key={item.id} className="glass-panel p-4 rounded-xl border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5">{item.title}</h4>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {item.content}
              </p>

              {item.actionable_steps && (
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 mb-3">
                  <span className="text-[11px] font-semibold text-teal-400 block mb-1">Targeted Action Steps:</span>
                  <ul className="space-y-1">
                    {item.actionable_steps.map((step, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-teal-400 text-xs">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.citation}</span>
                </span>
                <span className="font-mono text-slate-400">ID: {item.id}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
