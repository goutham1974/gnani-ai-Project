import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MarketTicker } from './components/MarketTicker';
import { WeatherCard } from './components/WeatherCard';
import { VoiceRecorder } from './components/VoiceRecorder';
import { ChatFeed } from './components/ChatFeed';
import { AgentTraceModal } from './components/AgentTraceModal';
import { RemindersDrawer } from './components/RemindersDrawer';
import { NoisyBenchmarkModal } from './components/NoisyBenchmarkModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatMessage, AgentTraceStep, ReminderItem } from './types';
import { api } from './services/api';
import { getTranslation } from './i18n';
import { Sprout, ShieldCheck, HeartHandshake, Send, Volume2, CloudSun, TrendingUp, Calendar, PhoneCall, Sparkles } from 'lucide-react';
import { createPlayableAudioUrl, safePlayAudio } from './utils/audio';

const WELCOME_GREETINGS: Record<string, string> = {
  te: 'నమస్కారం రైతు సోదరా! నేను RYTHUM AI — మీ డిజిటల్ వ్యవసాయ సహాయకుడిని 🙏\n\nమీ పంట సమస్యలు, నేటి మార్కెట్ ధరలు, వాతావరణం లేదా పనుల రిమైండర్ల గురించి మైక్ నొక్కి మాట్లాడండి లేదా ఇక్కడ టైప్ చేయండి.',
  hi: 'नमस्ते किसान भाई! मैं RYTHUM AI हूँ — आपका डिजिटल कृषि सहायक 🙏\n\nअपनी फसल की समस्या, ताज़ा मंडी भाव, मौसम या खेती के कामों के बारे में माइक दबाकर बोलें या यहाँ टाइप करें।',
  kn: 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ನಾನು RYTHUM AI — ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಕೃಷಿ ಸಹಾಯಕ 🙏\n\nನಿಮ್ಮ ಬೆಳೆ ಸಮಸ್ಯೆಗಳು, ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರಗಳು ಅಥವಾ ಕೃಷಿ ಕೆಲಸಗಳ ಬಗ್ಗೆ ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.',
  ta: 'வணக்கம் விவசாய தோழரே! நான் RYTHUM AI — உங்கள் டிஜிட்டல் வேளாண்மை உதவியாளர் 🙏\n\nஉங்கள் பயிர் பிரச்சனைகள், சந்தை விலைகள் அல்லது வேலை நினைவூட்டல்கள் குறித்து மைக் அழுத்திப் பேசவும் அல்லது தட்டச்சு செய்யவும்.',
  mr: 'नमस्कार शेतकरी बंधू! मी RYTHUM AI आहे — आपला डिजिटल शेती सहाय्यक 🙏\n\nआपल्या पिकांच्या समस्या, आजचे बाजारभाव किंवा शेतीकामांच्या नियोजनाविषयी माइक दाबून बोला किंवा टाइप करा.',
  en: 'Hello farmer friend! I am RYTHUM AI — your Autonomous Agricultural Operating Assistant 🙏\n\nTap the microphone to speak naturally or type your farming query here.'
};

const CROPS_COMPACT = [
  { id: 'tomato', icon: '🍅', names: { te: 'టమాటా', hi: 'टमाटर', kn: 'ಟೊಮೆಟೊ', ta: 'தக்காளி', mr: 'टोमॅटो', en: 'Tomato' }, query: { te: 'నా టమాటా పంటకు ఆకులు పసుపు రంగులోకి మారుతున్నాయి, దీనికి నివారణ ఏమిటి?', hi: 'मेरे टमाटर की पत्तियां पीली पड़ रही हैं, क्या समाधान है?', en: 'My tomato leaves are turning yellow, what is the remedy?' } },
  { id: 'chilli', icon: '🌶️', names: { te: 'మిరప', hi: 'मिर्च', kn: 'ಮೆಣಸಿನಕಾಯಿ', ta: 'மிளகாய்', mr: 'मिरची', en: 'Chilli' }, query: { te: 'మిరప పంటలో నల్ల తామర పురుగు నివారణకు ఏ మందులు పిచికారీ చేయాలి?', hi: 'मिर्च में ब्लैक थ्रिप्स के नियंत्रण के लिए क्या उपाय करें?', en: 'How to control black thrips in chilli crop?' } },
  { id: 'cotton', icon: '☁️', names: { te: 'పత్తి', hi: 'कपास', kn: 'ಹತ್ತಿ', ta: 'பருத்தி', mr: 'कापूस', en: 'Cotton' }, query: { te: 'పత్తి పంటలో గులాబీ రంగు పురుగు నివారణ పద్ధతులు తెలపండి', hi: 'कपास में गुलाबी सुंडी नियंत्रण के तरीके बताएं', en: 'How to manage pink bollworm in cotton?' } },
  { id: 'paddy', icon: '🌾', names: { te: 'వరి', hi: 'धान', kn: 'ಭತ್ತ', ta: 'நெல்', mr: 'भात', en: 'Paddy' }, query: { te: 'వరి పంటలో అగ్గి తెగులు లక్షణాలు మరియు నివారణ చర్యలు తెలపండి', hi: 'धान में ब्लास्ट रोग के लक्षण और रोकथाम के उपाय बताएं', en: 'Remedy for blast disease in paddy crop' } },
  { id: 'maize', icon: '🌽', names: { te: 'మొక్కజొన్న', hi: 'मक्का', kn: 'ಮೆಕ್ಕೆಜೋಳ', ta: 'மக்காச்சோளம்', mr: 'मका', en: 'Maize' }, query: { te: 'మొక్కజొన్నలో కత్తెర పురుగు నివారణ ఎలా చేయాలి?', hi: 'मक्का में फॉल आर्मीवर्म का नियंत्रण कैसे करें?', en: 'Fall armyworm control in maize crop' } },
  { id: 'groundnut', icon: '🥜', names: { te: 'వేరుశనగ', hi: 'मूंगफली', kn: 'ಕಡಲೆಕಾಯಿ', ta: 'வேர்க்கடலை', mr: 'भुईमूग', en: 'Groundnut' }, query: { te: 'వేరుశనగ పంటలో టిక్కా ఆకుమచ్చ తెగులు నివారణ తెలపండి', hi: 'मूंगफली में टिक्का रोग के लक्षण और उपाय', en: 'Tikka disease control in groundnut' } }
];

export function App() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'dashboard'>('assistant');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('te');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [latestAiAudio, setLatestAiAudio] = useState<string | null>(null);
  const [isSynthesizingLatest, setIsSynthesizingLatest] = useState(false);
  const [isSpeakingInput, setIsSpeakingInput] = useState(false);

  // Modals state
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [currentTrace, setCurrentTrace] = useState<AgentTraceStep[]>([]);
  const [currentTraceQuery, setCurrentTraceQuery] = useState('');
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);

  const globalAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingQueueRef = useRef<boolean>(false);
  const t = getTranslation(selectedLanguage);

  useEffect(() => {
    loadReminders();
    setInitialGreeting(selectedLanguage);
  }, []);

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

  const playNextInQueue = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingQueueRef.current = false;
      return;
    }
    isPlayingQueueRef.current = true;
    const nextBase64 = audioQueueRef.current.shift()!;
    try {
      if (globalAudioRef.current) {
        globalAudioRef.current.onended = null;
        globalAudioRef.current.onerror = null;
        try {
          globalAudioRef.current.pause();
          globalAudioRef.current.currentTime = 0;
        } catch (e) {}
      }
      const audioUrl = createPlayableAudioUrl(nextBase64);
      if (!audioUrl) {
        playNextInQueue();
        return;
      }
      const audio = new Audio(audioUrl);
      globalAudioRef.current = audio;
      audio.onended = () => {
        playNextInQueue();
      };
      audio.onerror = () => {
        playNextInQueue();
      };
      safePlayAudio(audio);
    } catch (e) {
      console.error('Queue playback error:', e);
      playNextInQueue();
    }
  };

  const queueAudioString = (base64Audio: string) => {
    audioQueueRef.current.push(base64Audio);
    if (!isPlayingQueueRef.current) {
      playNextInQueue();
    }
  };

  const playAudioString = (base64Audio: string) => {
    audioQueueRef.current = [base64Audio];
    playNextInQueue();
  };

  // Speaks what the user currently has typed in the input box
  const handleSpeakInputText = async (text: string) => {
    if (!text.trim() || isSpeakingInput) return;
    try {
      setIsSpeakingInput(true);
      const res = await api.synthesizeSpeech(text.trim(), selectedLanguage);
      if (res && res.audio_base64) {
        playAudioString(res.audio_base64);
      }
    } catch (e) {
      console.error('Failed to speak input text:', e);
    } finally {
      setIsSpeakingInput(false);
    }
  };

  // Handle voice submission with zero-loss live speech transcript support
  const handleAudioReady = async (audioBlob: Blob, liveTranscript?: string) => {
    setIsProcessing(true);
    const userMsgId = 'user_' + Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const recognizedText = (liveTranscript || textInput || '').trim() || t.farmerVoiceLabel;
    setTextInput('');

    const farmerMsg: ChatMessage = {
      id: userMsgId,
      sender: 'farmer',
      text: recognizedText,
      detected_language: selectedLanguage,
      timestamp: timeStr,
    };

    // Show farmer message bubble immediately in chat
    setMessages((prev) => [...prev, farmerMsg]);

    try {
      const res = await api.sendVoiceQuery(audioBlob, selectedLanguage, undefined, recognizedText);

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

      if (res.audio_base64) {
        setLatestAiAudio(res.audio_base64);
        if (autoPlayVoice) {
          playAudioString(res.audio_base64);
        }
      }

      setMessages((prev) => [...prev, aiMsg]);
      loadReminders();
    } catch (err) {
      console.error('Voice interaction error:', err);
      const errMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'rythum',
        text: selectedLanguage === 'te' 
          ? 'క్షమించండి, సర్వర్ అనుసంధానంలో చిన్న లోపం ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
          : selectedLanguage === 'hi'
          ? 'क्षमा करें, सर्वर कनेक्शन में समस्या आई। कृपया पुनः प्रयास करें।'
          : 'Sorry, a temporary network issue occurred. Please try again.',
        timestamp: timeStr,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle prompt or crop click
  const handleSelectPrompt = async (promptText: string) => {
    if (!promptText.trim() || isProcessing) return;
    setIsProcessing(true);
    setTextInput('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const farmerMsgId = 'user_' + Date.now();
    const farmerMsg: ChatMessage = {
      id: farmerMsgId,
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

      if (res.audio_base64) {
        setLatestAiAudio(res.audio_base64);
        if (autoPlayVoice) {
          playAudioString(res.audio_base64);
        }
      }

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
    handleSelectPrompt(msg);
  };

  const handleRepeatLatest = async () => {
    if (latestAiAudio) {
      playAudioString(latestAiAudio);
      return;
    }
    // Find latest AI message
    const lastAiMsg = [...messages].reverse().find((m) => m.sender === 'rythum');
    if (lastAiMsg) {
      if (lastAiMsg.audio_base64) {
        setLatestAiAudio(lastAiMsg.audio_base64);
        playAudioString(lastAiMsg.audio_base64);
      } else if (lastAiMsg.text) {
        try {
          setIsSynthesizingLatest(true);
          const ttsRes = await api.synthesizeSpeech(lastAiMsg.text, selectedLanguage);
          if (ttsRes && ttsRes.audio_base64) {
            lastAiMsg.audio_base64 = ttsRes.audio_base64;
            setLatestAiAudio(ttsRes.audio_base64);
            playAudioString(ttsRes.audio_base64);
          }
        } catch (e) {
          console.error('Failed to synthesize latest AI answer:', e);
        } finally {
          setIsSynthesizingLatest(false);
        }
      }
    }
  };

  const handleUpdateMessageAudio = (messageId: string, audioBase64: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, audio_base64: audioBase64 } : m))
    );
  };

  const handleOpenTrace = (trace: AgentTraceStep[], messageText: string) => {
    setCurrentTrace(trace);
    setCurrentTraceQuery(messageText);
    setIsTraceOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Floating Glassmorphism Navbar with 6 Languages */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={handleLanguageChange}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenReminders={() => setIsRemindersOpen(true)}
        remindersCount={reminders.filter((r) => r.status === 'pending').length}
      />

      {/* Live Mandi Ticker showing English / Selected Language */}
      <MarketTicker selectedLanguage={selectedLanguage} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'assistant' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Command & Voice Studio */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Central Futuristic Microphone */}
              <VoiceRecorder
                onAudioReady={handleAudioReady}
                onLiveSpeech={(transcript) => setTextInput(transcript)}
                isProcessing={isProcessing}
                selectedLanguage={selectedLanguage}
              />

              {/* Compact Crop Diagnostics Chips Bar */}
              <div className="bg-slate-900/90 border border-emerald-900/40 rounded-3xl p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.cropSelectorTitle}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    1-Tap ANGRAU / ICAR
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {CROPS_COMPACT.map((c) => {
                    const cName = c.names[selectedLanguage as keyof typeof c.names] || c.names['en'];
                    const cQuery = c.query[selectedLanguage as keyof typeof c.query] || c.query['en'];
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectPrompt(cQuery)}
                        disabled={isProcessing}
                        className="p-2 rounded-2xl bg-slate-950/80 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 transition-all text-center flex flex-col items-center group shadow-sm disabled:opacity-50"
                        title={cQuery}
                      >
                        <span className="text-2xl filter drop-shadow group-hover:scale-110 transition-transform">
                          {c.icon}
                        </span>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-300 mt-1 truncate w-full">
                          {cName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Professional Farm Action Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleSelectPrompt(
                    selectedLanguage === 'te' ? 'ఈరోజు వాతావరణం ఎలా ఉంది? మందులు పిచికారీ చేయవచ్చా?' :
                    selectedLanguage === 'hi' ? 'आज का मौसम कैसा है? क्या कीटनाशक छिड़काव कर सकते हैं?' :
                    'What is the weather today? Is it suitable for pesticide spraying?'
                  )}
                  disabled={isProcessing}
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left flex items-center space-x-2 text-xs font-semibold text-slate-300 transition-all shadow-sm"
                >
                  <CloudSun className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{t.actionWeather}</span>
                </button>

                <button
                  onClick={() => handleSelectPrompt(
                    selectedLanguage === 'te' ? 'నేటి మార్కెట్ లో పంటల ధరలు మరియు విక్రయ సలహా తెలపండి' :
                    selectedLanguage === 'hi' ? 'आज के ताज़ा मंडी भाव और बेचने की सलाह बताएं' :
                    'Today mandi market rates and selling recommendations'
                  )}
                  disabled={isProcessing}
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left flex items-center space-x-2 text-xs font-semibold text-slate-300 transition-all shadow-sm"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{t.actionMandi}</span>
                </button>

                <button
                  onClick={() => handleSelectPrompt(
                    selectedLanguage === 'te' ? 'రేపు ఉదయం 8 గంటలకు పొలంలో ఎరువులు వేయాలి, నాకు గుర్తుచేయి' :
                    selectedLanguage === 'hi' ? 'कल सुबह 8 बजे खेत में खाद डालनी है, मुझे याद दिलाना' :
                    'Remind me tomorrow at 8 AM to apply fertilizer in the field'
                  )}
                  disabled={isProcessing}
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left flex items-center space-x-2 text-xs font-semibold text-slate-300 transition-all shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{t.actionReminder}</span>
                </button>

                <a
                  href="tel:18001801551"
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-green-500/40 text-left flex items-center space-x-2 text-xs font-semibold text-slate-300 transition-all shadow-sm"
                  title="Kisan Call Center: 1800-180-1551"
                >
                  <PhoneCall className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="truncate">{t.actionKCC}</span>
                </a>
              </div>

              {/* Weather & Spray Index with English / Selected Language */}
              <WeatherCard selectedLanguage={selectedLanguage} />

            </div>

            {/* Right Column: Conversational AI Feed & Spoken Voice Console */}
            <div className="lg:col-span-7 flex flex-col">
              
              <div className="bg-slate-900/90 border border-emerald-900/40 rounded-3xl p-5 sm:p-6 shadow-2xl min-h-[640px] flex flex-col justify-between backdrop-blur-xl">
                
                {/* Clean Professional Feed Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Sprout className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{t.feedTitle}</h3>
                      <p className="text-[11px] text-slate-400">{t.feedSubtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Auto-Play Voice Toggle */}
                    <button
                      onClick={() => setAutoPlayVoice(!autoPlayVoice)}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        autoPlayVoice
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="Toggle Automatic Voice Playback on response"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${autoPlayVoice ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="text-[10px] font-mono">
                        {autoPlayVoice ? t.autoVoiceOn : t.autoVoiceOff}
                      </span>
                    </button>

                    <span className="hidden sm:inline-flex text-[10px] font-mono text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-700/80 font-bold items-center space-x-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{t.onlineBadge}</span>
                    </span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto max-h-[520px] pr-1">
                  <ChatFeed
                    messages={messages}
                    onOpenTrace={handleOpenTrace}
                    selectedLanguage={selectedLanguage}
                    onUpdateMessageAudio={handleUpdateMessageAudio}
                  />
                </div>

                {/* Message Input Box & Instant Repeat Action */}
                <div className="mt-4 pt-3.5 border-t border-slate-800">
                  <form onSubmit={handleTextSubmit} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={t.inputPlaceholder}
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        disabled={isProcessing}
                        className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                      />
                      {textInput.trim() && (
                        <button
                          type="button"
                          onClick={() => handleSpeakInputText(textInput)}
                          disabled={isSpeakingInput}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950 text-emerald-400 border border-slate-700 hover:border-emerald-500 transition-colors"
                          title={t.speakQuestion}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={isProcessing || !textInput.trim()}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <span>{t.sendBtn}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Button: Repeat Last Spoken Answer */}
                    <button
                      type="button"
                      onClick={handleRepeatLatest}
                      disabled={isProcessing || isSynthesizingLatest}
                      className="px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/40 font-bold text-xs flex items-center space-x-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                      title={t.repeatLatest}
                    >
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">{t.repeatLatest}</span>
                    </button>
                  </form>

                  {/* Clean Footer Assurance */}
                  <div className="pt-2.5 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs mt-2.5 gap-1">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{t.footerAssurance}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 font-semibold">
                      {t.kisanCallCenter}
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
        selectedLanguage={selectedLanguage}
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
            <span>— Great Indian AI Internship Challenge (Gnani.ai)</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Languages: English • Telugu • Hindi • Kannada • Tamil • Marathi
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
