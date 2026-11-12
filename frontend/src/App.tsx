import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MarketTicker } from './components/MarketTicker';
import { WeatherCard } from './components/WeatherCard';
import { VoiceRecorder } from './components/VoiceRecorder';
import { QuickPrompts } from './components/QuickPrompts';
import { ChatFeed } from './components/ChatFeed';
import { AgentTraceModal } from './components/AgentTraceModal';
import { RemindersDrawer } from './components/RemindersDrawer';
import { NoisyBenchmarkModal } from './components/NoisyBenchmarkModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatMessage, AgentTraceStep, ReminderItem } from './types';
import { api } from './services/api';
import { Sparkles, Sprout, ShieldCheck, HeartHandshake } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'dashboard'>('assistant');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('te');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  // Modals state
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [currentTrace, setCurrentTrace] = useState<AgentTraceStep[]>([]);
  const [currentTraceQuery, setCurrentTraceQuery] = useState('');
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);

  useEffect(() => {
    loadReminders();
    // Seed initial greeting in Telugu
    const welcomeMsg: ChatMessage = {
      id: 'welcome_01',
      sender: 'rythum',
      text: 'నమస్కారం రైతు సోదరా! నేను RYTHUM AI — మీ డిజిటల్ వ్యవసాయ సహాయకుడిని.\n\nమీ పంట సమస్యలు, నేటి మార్కెట్ ధరలు, వాతావరణ సమాచారం లేదా రేపటి పనుల రిమైండర్ల గురించి మీ సొంత భాషలో మాట్లాడండి.',
      detected_language: 'te (Telugu)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
  }, []);

  const loadReminders = async () => {
    try {
      const data = await api.getReminders();
      setReminders(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle voice submission
  const handleAudioReady = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const userMsgId = 'user_' + Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const res = await api.sendVoiceQuery(audioBlob, selectedLanguage);

      const farmerMsg: ChatMessage = {
        id: userMsgId,
        sender: 'farmer',
        text: res.query || 'రైతు వాయిస్ రికార్డ్...',
        detected_language: res.detected_language,
        timestamp: timeStr,
      };

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'rythum',
        text: res.response_text,
        detected_language: res.detected_language,
        intent: res.intent,
        audio_base64: res.audio_base64,
        agent_trace: res.agent_trace,
        sources: res.sources,
        telemetry: res.telemetry,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, farmerMsg, aiMsg]);
      loadReminders(); // Refresh in case reminder was created
    } catch (err) {
      console.error('Voice interaction error:', err);
      // Fallback message
      const errMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'rythum',
        text: 'క్షమించండి, సర్వర్ అనుసంధానంలో చిన్న లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.',
        timestamp: timeStr,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle prompt click
  const handleSelectPrompt = async (promptText: string) => {
    setIsProcessing(true);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const farmerMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'farmer',
      text: promptText,
      detected_language: selectedLanguage,
      timestamp: timeStr,
    };
    setMessages((prev) => [...prev, farmerMsg]);

    try {
      const res = await api.sendChatMessage(promptText, selectedLanguage);

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'rythum',
        text: res.response_text,
        detected_language: res.detected_language,
        intent: res.intent,
        audio_base64: res.audio_base64,
        agent_trace: res.agent_trace,
        sources: res.sources,
        telemetry: res.telemetry,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      loadReminders();
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenTrace = (trace: AgentTraceStep[], messageText: string) => {
    setCurrentTrace(trace);
    setCurrentTraceQuery(messageText);
    setIsTraceOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenReminders={() => setIsRemindersOpen(true)}
        remindersCount={reminders.filter((r) => r.status === 'pending').length}
      />

      {/* Live APMC Mandi Ticker */}
      <MarketTicker />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'assistant' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Voice Interaction & Quick Prompts */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Voice Recorder Microphone */}
              <VoiceRecorder
                onAudioReady={handleAudioReady}
                isProcessing={isProcessing}
                selectedLanguage={selectedLanguage}
              />

              {/* Weather & Spray Safety Advisory */}
              <WeatherCard />

              {/* Quick Prompt Suggestions */}
              <QuickPrompts
                onSelectPrompt={handleSelectPrompt}
                disabled={isProcessing}
              />

            </div>

            {/* Right Column: Conversational Feed & Citations */}
            <div className="lg:col-span-7 flex flex-col">
              
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl min-h-[550px] flex flex-col justify-between">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Sprout className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">రైతు సంభాషణ (Farmer Interaction Feed)</h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/80">
                    Live Session
                  </span>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto max-h-[580px] pr-1">
                  <ChatFeed
                    messages={messages}
                    onOpenTrace={handleOpenTrace}
                  />
                </div>

                {/* Footer Assurance */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-xs">
                  <div className="flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>ధ్రువీకరించిన ANGRAU & ICAR సమాచారం</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Kisan Call Center: 1800-180-1551
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* Engineering Analytics Dashboard */
          <AdminDashboard />
        )}
      </main>

      {/* Modals & Drawers */}
      <AgentTraceModal
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        trace={currentTrace}
        queryText={currentTraceQuery}
      />

      <RemindersDrawer
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        reminders={reminders}
        onRefresh={loadReminders}
      />

      <NoisyBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 py-4 bg-slate-900/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-400">RYTHUM AI</span>
            <span>— Great Indian AI Internship Challenge 2026 (Gnani.ai)</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Speech: Gnani Prisma v3.0 • Voice: Gnani Timbre v3.0 • Reasoning: Evon / LangGraph
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
