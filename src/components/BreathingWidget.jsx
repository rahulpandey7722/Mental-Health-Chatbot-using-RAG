import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Wind, Sparkles } from 'lucide-react';

export default function BreathingWidget({ isOpen, onClose }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Idle'); // Idle, Inhale, Hold, Exhale
  const [timer, setTimer] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    if (phase === 'Idle' || phase === 'Exhale' && timer >= 8) {
      setPhase('Inhale');
      setTimer(0);
      if (phase === 'Exhale') setCycles(c => c + 1);
    } else if (phase === 'Inhale' && timer >= 4) {
      setPhase('Hold');
      setTimer(0);
    } else if (phase === 'Hold' && timer >= 7) {
      setPhase('Exhale');
      setTimer(0);
    }
  }, [timer, isActive, phase]);

  if (!isOpen) return null;

  const handleToggle = () => {
    if (!isActive) {
      setIsActive(true);
      setPhase('Inhale');
      setTimer(0);
    } else {
      setIsActive(false);
      setPhase('Idle');
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('Idle');
    setTimer(0);
    setCycles(0);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'Inhale': return 'from-emerald-500 to-teal-400 text-emerald-300';
      case 'Hold': return 'from-indigo-500 to-sky-400 text-sky-300';
      case 'Exhale': return 'from-teal-500 to-cyan-500 text-teal-200';
      default: return 'from-slate-700 to-slate-800 text-slate-400';
    }
  };

  const getCircleAnimationClass = () => {
    if (!isActive) return 'scale-100 bg-slate-800/80 border-slate-700';
    if (phase === 'Inhale') return 'breathing-circle-inhale border-emerald-400/60 shadow-2xl shadow-emerald-500/30';
    if (phase === 'Hold') return 'breathing-circle-hold border-indigo-400/60 shadow-2xl shadow-indigo-500/30';
    if (phase === 'Exhale') return 'breathing-circle-exhale border-teal-400/60 shadow-2xl shadow-teal-500/30';
    return 'scale-100';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel border-teal-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
        
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
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wind className="w-6 h-6 text-teal-400" />
          <h3 className="text-xl font-bold text-white">4-7-8 Deep Breathing Guide</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Calms the autonomic nervous system and reduces emotional distress
        </p>

        {/* Breathing Circle Container */}
        <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
          
          {/* Animated Circle */}
          <div
            className={`w-48 h-48 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 ${getCircleAnimationClass()}`}
          >
            <span className={`text-2xl font-bold tracking-wide uppercase ${getPhaseColor()}`}>
              {phase === 'Idle' ? 'Ready' : phase}
            </span>
            {isActive && (
              <span className="text-4xl font-extrabold text-white mt-1 font-mono">
                {timer}s
              </span>
            )}
          </div>

        </div>

        {/* Phase Instruction Description */}
        <div className="h-12 flex items-center justify-center text-sm font-medium text-slate-300 mb-6">
          {phase === 'Inhale' && 'Slowly inhale through your nose... (4s)'}
          {phase === 'Hold' && 'Gently hold your breath... (7s)'}
          {phase === 'Exhale' && 'Slowly exhale through your mouth making a whoosh sound... (8s)'}
          {phase === 'Idle' && 'Press Start to begin relaxing your nervous system.'}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mb-6 text-xs text-slate-400">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            Completed Cycles: <strong className="text-teal-300 font-bold ml-1">{cycles}</strong>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/30 hover:scale-105'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isActive ? 'Pause' : 'Start Exercise'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Reset Counter"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
