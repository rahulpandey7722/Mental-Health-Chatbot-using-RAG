import React, { useState } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import SymptomPicker from './components/SymptomPicker';
import EmergencyModal from './components/EmergencyModal';
import BreathingWidget from './components/BreathingWidget';
import GroundingWidget from './components/GroundingWidget';
import RAGInspectorModal from './components/RAGInspectorModal';
import { sendChatMessage } from './services/ragService';
import { ShieldAlert, Heart, Wind, Sparkles } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Welcome to **MindHaven**.\n\nI am your RAG depression coping assistant. You can describe how you feel, or select symptoms below to get evidence-based CBT exercises and coping strategies.\n\n*If you are in distress, click the Emergency SOS button above anytime for instant 24/7 helplines.*",
      is_crisis: false,
      retrieved_sources: [
        {
          title: "CBT Thought Reframing (The 3 Cs Technique)",
          category: "Cognitive Behavioral Therapy (CBT)",
          relevance_score: 0.95,
          citation: "Beck, A. T. (1979). Cognitive Therapy of Depression."
        }
      ]
    }
  ]);

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modals
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [isRAGInspectorOpen, setIsRAGInspectorOpen] = useState(false);

  const handleToggleSymptom = (id) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const handleSendMessage = async (userText) => {
    const userMsg = { sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const ragResult = await sendChatMessage(userText, selectedSymptoms);

    const botMsg = {
      sender: 'bot',
      text: ragResult.response,
      is_crisis: ragResult.is_crisis,
      retrieved_sources: ragResult.retrieved_sources
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);

    if (ragResult.is_crisis) {
      setIsEmergencyOpen(true);
    }
  };

  const handleGenerateRAGPlan = (severity) => {
    if (selectedSymptoms.length === 0) return;
    const prompt = `I am experiencing symptoms: ${selectedSymptoms.join(', ')}. Please provide evidence-based coping strategies for these symptoms.`;
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col font-sans">
      
      {/* Clean Header */}
      <Header
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenBreathing={() => setIsBreathingOpen(true)}
        onOpenGrounding={() => setIsGroundingOpen(true)}
        onOpenRAGInspector={() => setIsRAGInspectorOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-4">
        
        {/* Symptom Selection Strip */}
        <SymptomPicker
          selectedSymptoms={selectedSymptoms}
          onToggleSymptom={handleToggleSymptom}
          onGenerateRAGPlan={handleGenerateRAGPlan}
        />

        {/* Central Chat Interface */}
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenBreathing={() => setIsBreathingOpen(true)}
          onOpenGrounding={() => setIsGroundingOpen(true)}
          onOpenRAGInspector={() => setIsRAGInspectorOpen(true)}
        />

      </main>

      {/* Emergency SOS Banner Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070d1e] py-3 px-4 text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>In Crisis? Help is available 24/7.</span>
          </div>
          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="text-rose-400 hover:text-rose-300 font-semibold underline"
          >
            Open Emergency Helplines
          </button>
        </div>
      </footer>

      {/* Modals */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onOpenBreathing={() => setIsBreathingOpen(true)}
      />

      <BreathingWidget
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <GroundingWidget
        isOpen={isGroundingOpen}
        onClose={() => setIsGroundingOpen(false)}
      />

      <RAGInspectorModal
        isOpen={isRAGInspectorOpen}
        onClose={() => setIsRAGInspectorOpen(false)}
      />

    </div>
  );
}
