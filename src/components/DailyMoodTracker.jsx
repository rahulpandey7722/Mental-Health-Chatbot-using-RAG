import React, { useState } from 'react';
import { Smile, Meh, Frown, HeartPulse, CheckSquare, Calendar } from 'lucide-react';

const MOODS = [
  { id: 'great', label: 'Good', icon: Smile, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'okay', label: 'Okay', icon: Meh, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { id: 'down', label: 'Low', icon: Frown, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'severe', label: 'Struggling', icon: HeartPulse, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
];

export default function DailyMoodTracker() {
  const [selectedMood, setSelectedMood] = useState('down');
  const [habits, setHabits] = useState([
    { id: 1, text: "5 min morning sunlight", done: true },
    { id: 2, text: "1 glass room-temp water", done: true },
    { id: 3, text: "1 cycle of 4-7-8 breathing", done: false },
    { id: 4, text: "Completed 1 micro-task", done: false }
  ]);

  const toggleHabit = (id) => {
    setHabits(habits.map(h => h.id === id ? { ...h, done: !h.done } : h));
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">Daily Mood Check-in</h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Today</span>
      </div>

      {/* Mood Selector */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {MOODS.map(m => {
          const Icon = m.icon;
          const isSel = selectedMood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMood(m.id)}
              className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                isSel ? m.color + ' font-bold scale-105 shadow-md' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Micro-habits Checklist */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 mb-1">
          <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
          Daily Coping Micro-Habits
        </span>
        {habits.map(h => (
          <button
            key={h.id}
            onClick={() => toggleHabit(h.id)}
            className="w-full flex items-center gap-2 text-xs text-left p-1.5 rounded-lg hover:bg-slate-900/80 text-slate-300 transition-colors"
          >
            <input
              type="checkbox"
              checked={h.done}
              onChange={() => {}}
              className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
            />
            <span className={h.done ? 'line-through text-slate-500' : 'text-slate-300'}>{h.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
