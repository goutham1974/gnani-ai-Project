import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MarketTicker } from './components/MarketTicker';
import { WeatherCard } from './components/WeatherCard';
import { VoiceRecorder } from './components/VoiceRecorder';
import { CropVisualSelector } from './components/CropVisualSelector';
import { QuickPrompts } from './components/QuickPrompts';
import { ChatFeed } from './components/ChatFeed';
import { AgentTraceModal } from './components/AgentTraceModal';
import { RemindersDrawer } from './components/RemindersDrawer';
import { NoisyBenchmarkModal } from './components/NoisyBenchmarkModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatMessage, AgentTraceStep, ReminderItem } from './types';
import { api } from './services/api';
import { Sprout, ShieldCheck, HeartHandshake, Sparkles, Send } from 'lucide-react';

const WELCOME_GREETINGS: Record<string, string> = {
  te: 'నమస్కారం రైతు సోదరా! నేను RYTHUM AI — మీ డిజిటల్ వ్యవసాయ సహాయకుడిని 🙏\n\nమీ పంట సమస్యలు, నేటి మార్కెట్ ధరలు, వాతావరణం లేదా పనుల రిమైండర్ల గురించి మైక్ నొక్కి మీ సొంత భాషలో మాట్లాడండి.',
  hi: 'नमस्ते किसान भाई! मैं RYTHUM AI हूँ — आपका डिजिटल कृषि सहायक 🙏\n\nअपनी फसल की समस्या, ताज़ा मंडी भाव, मौसम या खेती के कामों के बारे में माइक दबाकर अपनी भाषा में पूछें।',
  kn: 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ನಾನು RYTHUM AI — ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಕೃಷಿ ಸಹಾಯಕ 🙏\n\nನಿಮ್ಮ ಬೆಳೆ ಸಮಸ್ಯೆಗಳು, ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರಗಳು ಅಥವಾ ಕೃಷಿ ಕೆಲಸಗಳ ಬಗ್ಗೆ ಮೈಕ್ ಒತ್ತಿ ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ.',
  ta: 'வணக்கம் விவசாய தோழரே! நான் RYTHUM AI — உங்கள் டிஜிட்டல் வேளாண்மை உதவியாளர் 🙏\n\nஉங்கள் பயிர் பிரச்சனைகள், சந்தை விலைகள் அல்லது வேலை நினைவூட்டல்கள் குறித்து மைக் அழுத்தி உங்கள் தாய்மொழியில் பேசவும்.',
  mr: 'नमस्कार शेतकरी बंधू! मी RYTHUM AI आहे — आपला डिजिटल शेती सहाय्यक 🙏\n\nआपल्या पिकांच्या समस्या, आजचे बाजारभाव किंवा शेतीकामांच्या नियोजनाविषयी माइक दाबून आपल्या भाषेत बोला.',
  en: 'Hello farmer friend! I am RYTHUM AI — your Autonomous Agricultural Operating Assistant 🙏\n\nTap the microphone to speak naturally in your language about crop diseases, mandi prices, weather, or reminders.'
};

export function App() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'dashboard'>('assistant');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('te');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [textInput, setTextInput] = useState('');

  // Modals state
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [currentTrace, setCurrentTrace] = useState<AgentTraceStep[]>([]);
  const [currentTraceQuery, setCurrentTraceQuery] = useState('');
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);

  useEffect(() => {
    loadReminders();
    // Set greeting for currently selected language
    setInitialGreeting(selectedLanguage);
  }, []);

  // Update greeting when user switches language
  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    setInitialGreeting(newLang);
  };

  const setInitialGreeting = (lang: string) => {
    const greetingText = WELCOME_GREETINGS[lang] || WELCOME_GREETINGS['en'];
    const welcomeMsg: ChatMessage = {
      id: 'welcome_' + Date.now(),
      sender: 'rythum',
      text: greetingText,
      detected_language: lang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
  };

  const loadReminders = async () => {
    try {
      const data = await api.getReminders();
      setReminders(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle voice submission with live speech transcript support
  const handleAudioReady = async (audioBlob: Blob, liveTranscript?: string) => {
    setIsProcessing(true);
    const userMsgId = 'user_' + Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const res = await api.sendVoiceQuery(audioBlob, selectedLanguage, undefined, liveTranscript);

      const farmerMsg: ChatMessage = {
        id: userMsgId,
        sender: 'farmer',
        text: res.query || liveTranscript || 'రైతు వాయిస్ ప్రశ్న...',
        detected_language: res.detected_language || selectedLanguage,
        timestamp: timeStr,
      };

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'rythum',
        text: res.response_text,
        detected_language: res.detected_language || selectedLanguage,
        intent: res.intent,
        audio_base64: res.audio_base64,
        agent_trace: res.agent_trace,
        sources: res.sources,
        telemetry: res.telemetry,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, farmerMsg, aiMsg]);
      loadReminders();
    } catch (err) {
      console.error('Voice interaction error:', err);
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

  // Handle prompt or crop click
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
        detected_language: res.detected_language || selectedLanguage,
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

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    const msg = textInput.trim();
    setTextInput('');
    handleSelectPrompt(msg);
  };

  const handleOpenTrace = (trace: AgentTraceStep[], messageText: string) => {
    setCurrentTrace(trace);
    setCurrentTraceQuery(messageText);
    setIsTraceOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Floating Glassmorphism Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={handleLanguageChange}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenReminders={() => setIsRemindersOpen(true)}
        remindersCount={reminders.filter((r) => r.status === 'pending').length}
      />

      {/* Live APMC Mandi Ticker */}
      <MarketTicker />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'assistant' ? (
          <div>
            {/* Visual Crop Quick Diagnostics Row */}
            <CropVisualSelector
              selectedLanguage={selectedLanguage}
              onSelectCropQuery={handleSelectPrompt}
              disabled={isProcessing}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
              
              {/* Left Column: Voice Studio, Weather, Quick Prompts */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Big Glowing Futuristic Microphone */}
                <VoiceRecorder
                  onAudioReady={handleAudioReady}
                  isProcessing={isProcessing}
                  selectedLanguage={selectedLanguage}
                />

                {/* Weather & Spray Index */}
                <WeatherCard />

                {/* Localized Quick Prompts */}
                <QuickPrompts
                  onSelectPrompt={handleSelectPrompt}
                  selectedLanguage={selectedLanguage}
                  disabled={isProcessing}
                />

              </div>

              {/* Right Column: Conversational Feed & Citations */}
              <div className="lg:col-span-7 flex flex-col">
                
                <div className="bg-slate-900/70 border border-emerald-900/30 rounded-3xl p-5 sm:p-6 shadow-2xl min-h-[600px] flex flex-col justify-between backdrop-blur-md">
                  
                  {/* Feed Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <Sprout className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">రైతు సంభాషణ (Farmer Interaction Feed)</h3>
                        <p className="text-[11px] text-slate-400">Multilingual Voice & Text Feed</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800 font-bold flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>LLM + Agent Online</span>
                      </span>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto max-h-[580px] pr-1">
                    <ChatFeed
                      messages={messages}
                      onOpenTrace={handleOpenTrace}
                    />
                  </div>

                  {/* Text Input Fallback / Alternative to Voice */}
                  <form onSubmit={handleTextSubmit} className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder={
                        selectedLanguage === 'te' ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయవచ్చు...' :
                        selectedLanguage === 'hi' ? 'अपना प्रश्न यहाँ टाइप कर सकते हैं...' :
                        selectedLanguage === 'kn' ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...' :
                        selectedLanguage === 'ta' ? 'உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...' :
                        selectedLanguage === 'mr' ? 'आपला प्रश्न येथे टाइप करा...' :
                        'Type your farming query here...'
                      }
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 transition-colors shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={isProcessing || !textInput.trim()}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <span>పంపు</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Footer Assurance */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-xs mt-3">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>ధ్రువీకరించిన ANGRAU & ICAR శాస్త్రీయ సమాచారం</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      Kisan Call Center: 1800-180-1551
                    </div>
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
      <footer className="border-t border-slate-800/80 py-4 bg-slate-950 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">RYTHUM AI</span>
            <span>— Great Indian AI Internship Challenge 2026 (Gnani.ai)</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Languages: Telugu • Hindi • Kannada • Tamil • Marathi • English
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
