import React, { useState } from 'react';
import { Eye, Hand, Volume2, Flower2, Utensils, CheckCircle2, RotateCcw, X, Shield } from 'lucide-react';

const STEPS = [
  {
    count: 5,
    icon: Eye,
    title: "5 Things You See",
    color: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    instruction: "Look around your room. Name 5 distinct items (e.g. lamp, desk, curtain, shadow, phone)."
  },
  {
    count: 4,
    icon: Hand,
    title: "4 Things You Can Touch",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    instruction: "Notice 4 physical textures (e.g. fabric of your shirt, cool desk surface, feet on the floor)."
  },
  {
    count: 3,
    icon: Volume2,
    title: "3 Things You Hear",
    color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
    instruction: "Listen closely. Identify 3 sounds (e.g. fan humming, distant traffic, your own breathing)."
  },
  {
    count: 2,
    icon: Flower2,
    title: "2 Things You Smell",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    instruction: "Notice 2 scents around you (e.g. coffee, fresh air, soap, perfume)."
  },
  {
    count: 1,
    icon: Utensils,
    title: "1 Thing You Taste",
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    instruction: "Focus on 1 taste in your mouth (e.g. mint, tea, water, or lingering toothpaste)."
  }
];

export default function GroundingWidget({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState([false, false, false, false, false]);

  if (!isOpen) return null;

  const currentStep = STEPS[activeStep];
  const Icon = currentStep.icon;

  const handleStepComplete = (idx) => {
    const updated = [...completed];
    updated[idx] = true;
    setCompleted(updated);
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted([false, false, false, false, false]);
  };

  const allCompleted = completed.every(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl glass-panel border-indigo-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => {
            handleReset();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-indigo-400" />
          <h3 className="text-xl font-bold text-white">5-4-3-2-1 Grounding Technique</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Re-anchor your mind in the present moment when experiencing panic or depression brain fog.
        </p>

        {/* Step Progress Pills */}
        <div className="flex items-center justify-between gap-1.5 mb-6">
          {STEPS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                activeStep === idx
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                  : completed[idx]
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {completed[idx] ? '✓' : `${s.count}`}
            </button>
          ))}
        </div>

        {/* Step Content Card */}
        {!allCompleted ? (
          <div className={`p-5 rounded-xl border mb-6 transition-all ${currentStep.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-slate-950/50 border border-white/10">
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">{currentStep.title}</h4>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed mb-5">
              {currentStep.instruction}
            </p>

            <button
              onClick={() => handleStepComplete(activeStep)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I have identified this ({currentStep.count} items)</span>
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-emerald-200 mb-1">Grounding Complete!</h4>
            <p className="text-xs text-slate-300">
              Notice how your mind has brought focus back to the immediate environment. You are safe here.
            </p>
          </div>
        )}

        {/* Reset & Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Grounding</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Return to Chat
          </button>
        </div>

      </div>
    </div>
  );
}
