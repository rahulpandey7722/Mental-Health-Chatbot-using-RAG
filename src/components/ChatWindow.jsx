import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Database, ShieldAlert, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';

const SAMPLE_QUESTIONS = [
  "I feel empty and cannot sleep at night",
  "How do I stop negative self-talk?",
  "I have no energy to get out of bed",
  "How to deal with feeling lonely and isolated?"
];

export default function ChatWindow({
  messages,
  onSendMessage,
  isLoading,
  onOpenEmergency,
  onOpenGrounding
}) {
  const [input, setInput] = useState('');
  const [openSources, setOpenSources] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const toggleSources = (idx) => {
    setOpenSources(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const cleanText = text.replace(/[*#_•\-\n]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="clean-card rounded-2xl flex flex-col h-[calc(100vh-8.5rem)] border-slate-800 overflow-hidden shadow-xl">
      
      {/* Top Header inside Chat */}
      <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">RAG Chat Assistant Active</span>
        </div>

        <button
          onClick={onOpenGrounding}
          className="text-xs font-medium text-teal-300 hover:text-teal-200 transition-colors"
        >
          Quick 5-4-3-2-1 Grounding
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        
        {/* Welcome Empty State */}
        {messages.length === 0 && (
          <div className="max-w-lg mx-auto py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white">How can I support you right now?</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Share your symptoms or questions below. I will retrieve evidence-based psychological coping strategies to help you navigate depression.
            </p>

            {/* Quick sample prompt chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {SAMPLE_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(q)}
                  className="p-2.5 text-left rounded-xl bg-slate-900/70 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800/80 hover:border-teal-500/40 transition-all"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Items */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 ${
                msg.is_crisis ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40' : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
              }`}>
                {msg.is_crisis ? <ShieldAlert className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
            )}

            <div className={`max-w-2xl rounded-2xl px-4 py-3.5 ${
              msg.sender === 'user'
                ? 'bg-teal-600 text-white rounded-br-sm font-normal text-xs sm:text-sm shadow-md'
                : msg.is_crisis
                ? 'bg-rose-950/40 border border-rose-500/50 text-rose-100 rounded-bl-sm text-xs sm:text-sm'
                : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-sm text-xs sm:text-sm leading-relaxed'
            }`}>
              
              {/* Message text */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* RAG Sources Accordion */}
              {msg.sender === 'bot' && msg.retrieved_sources && msg.retrieved_sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleSources(idx)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-teal-300 transition-colors"
                    >
                      <Database className="w-3 h-3 text-indigo-400" />
                      <span>{openSources[idx] ? 'Hide Clinical Sources' : `View ${msg.retrieved_sources.length} Clinical Sources`}</span>
                      {openSources[idx] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => handleSpeak(msg.text)}
                      className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {openSources[idx] && (
                    <div className="mt-2 space-y-1.5 animate-fadeIn">
                      {msg.retrieved_sources.map((src, sIdx) => (
                        <div key={sIdx} className="p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px]">
                          <div className="flex items-center justify-between font-medium text-slate-300">
                            <span>{src.title}</span>
                            <span className="text-teal-400 font-mono text-[10px]">
                              {Math.round(src.relevance_score * 100)}% match
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic mt-0.5">{src.citation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Crisis SOS Banner trigger if crisis message */}
              {msg.is_crisis && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-600/30 border border-rose-500 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Need emergency help?</span>
                  <button
                    onClick={onOpenEmergency}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                  >
                    Open Helplines
                  </button>
                </div>
              )}

            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Bot className="w-4 h-4 text-teal-400 animate-spin" />
            <span>Finding evidence-based guidance...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Clean Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your symptoms or questions (e.g. 'I feel exhausted and cannot sleep')..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all flex items-center gap-1.5 ${
              input.trim() && !isLoading
                ? 'bg-teal-600 hover:bg-teal-500 shadow-md shadow-teal-950'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

    </div>
  );
}
