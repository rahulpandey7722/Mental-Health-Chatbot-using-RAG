import React from 'react';
import { Sparkles, Check } from 'lucide-react';

const COMMON_SYMPTOMS = [
  { id: "insomnia", label: "Insomnia & Sleep Issues" },
  { id: "fatigue", label: "Low Energy & Fatigue" },
  { id: "negative thoughts", label: "Negative Thoughts & Guilt" },
  { id: "anhedonia", label: "Loss of Interest" },
  { id: "isolation", label: "Feeling Isolated" },
  { id: "anxiety", label: "Anxiety & Overwhelm" }
];

export default function SymptomPicker({ selectedSymptoms, onToggleSymptom, onGenerateRAGPlan }) {
  return (
    <div className="clean-card rounded-2xl p-4 sm:p-5 border-slate-800">
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Experiencing any of these symptoms?
        </h3>
        {selectedSymptoms.length > 0 && (
          <span className="text-[11px] font-medium text-teal-400">
            {selectedSymptoms.length} selected
          </span>
        )}
      </div>

      {/* Clean symptom chips grid */}
      <div className="flex flex-wrap gap-2 mb-4">
        {COMMON_SYMPTOMS.map((s) => {
          const isSelected = selectedSymptoms.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onToggleSymptom(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-teal-500/20 text-teal-200 border border-teal-500/50 shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-teal-400 stroke-[3]" />}
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Button */}
      {selectedSymptoms.length > 0 && (
        <button
          onClick={() => onGenerateRAGPlan(5)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all shadow-md shadow-teal-950/50"
        >
          <Sparkles className="w-4 h-4" />
          <span>Get Targeted Coping Strategy ({selectedSymptoms.length})</span>
        </button>
      )}

    </div>
  );
}
