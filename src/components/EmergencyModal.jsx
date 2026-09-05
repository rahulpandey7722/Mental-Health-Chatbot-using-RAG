import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, MessageSquare, ExternalLink, X, Heart, AlertTriangle, Check, Copy } from 'lucide-react';

const HOTLINES = [
  { country: "India", name: "Tele-MANAS (Govt of India)", number: "14416", alt: "1800 891 4416", type: "Free 24/7 National Mental Health Helpline", tel: "14416" },
  { country: "India", name: "Vandrevala Foundation Helpline", number: "+91 9999 666 555", alt: "9999666555", type: "24/7 Crisis Counseling", tel: "+919999666555" },
  { country: "USA & Canada", name: "988 Suicide & Crisis Lifeline", number: "988", alt: "Call or Text 988", type: "Free, Confidential 24/7 Lifeline", tel: "988" },
  { country: "United Kingdom", name: "Samaritans Helpline", number: "116 123", alt: "NHS 111", type: "Free 24/7 Listening & Support", tel: "116123" },
  { country: "Australia", name: "Lifeline Australia", number: "13 11 14", alt: "Text 0477 13 11 14", type: "24/7 Crisis Support", tel: "131114" },
  { country: "International", name: "Befrienders Worldwide", number: "Online Directory", alt: "befrienders.org", type: "Global Network of Crisis Centers", link: "https://www.befrienders.org" }
];

export default function EmergencyModal({ isOpen, onClose, onOpenBreathing }) {
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const filteredHotlines = selectedCountry === "All" 
    ? HOTLINES 
    : HOTLINES.filter(h => h.country.includes(selectedCountry));

  const sosSmsTemplate = "I am in crisis and feeling overwhelmed right now. Please check in on me or call me as soon as you can.";

  const handleCopySMS = () => {
    navigator.clipboard.writeText(sosSmsTemplate);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel border-rose-500/40 rounded-2xl p-5 sm:p-7 shadow-2xl shadow-rose-950/50">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-rose-500/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Emergency Crisis Support
              </h2>
              <p className="text-xs sm:text-sm text-rose-300">
                If you are in immediate danger, help is available 24/7.
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

        {/* Immediate Danger Warning */}
        <div className="glass-card-emergency rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-rose-200 leading-relaxed">
            <strong className="text-rose-100 font-semibold block mb-1">Are you in immediate danger?</strong>
            If you have harmed yourself or feel you cannot keep yourself safe, please call your local emergency services (like <strong>112 / 911 / 14416</strong>) or go to the nearest hospital emergency room immediately.
          </div>
        </div>

        {/* Country Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {["All", "India", "USA & Canada", "United Kingdom", "Australia", "International"].map(country => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCountry === country
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {country}
            </button>
          ))}
        </div>

        {/* Hotline List */}
        <div className="space-y-3 mb-6">
          {filteredHotlines.map((hotline, idx) => (
            <div
              key={idx}
              className="glass-panel p-4 rounded-xl border-slate-700/60 hover:border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {hotline.country}
                  </span>
                  <h4 className="text-base font-bold text-white">{hotline.name}</h4>
                </div>
                <p className="text-xs text-slate-400 mt-1">{hotline.type}</p>
                <p className="text-sm font-mono font-bold text-rose-300 mt-1">{hotline.number}</p>
              </div>

              {hotline.tel ? (
                <a
                  href={`tel:${hotline.tel}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Now</span>
                </a>
              ) : (
                <a
                  href={hotline.link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Website</span>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Quick SMS Trusted Contact Feature */}
        <div className="glass-panel rounded-xl p-4 border-slate-700 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              Quick Emergency SMS to Trusted Contact
            </h4>
            <button
              onClick={handleCopySMS}
              className="flex items-center gap-1 text-xs font-semibold text-teal-300 hover:text-teal-200 transition-colors"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono italic text-slate-300">
            "{sosSmsTemplate}"
          </p>
        </div>

        {/* Calming Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Heart className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Take slow breaths. You do not have to process everything at once.</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenBreathing();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 border border-teal-500/40 text-xs font-semibold transition-all"
          >
            <span>Open Calming Breathing Circle</span>
          </button>
        </div>

      </div>
    </div>
  );
}
