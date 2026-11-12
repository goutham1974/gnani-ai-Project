import React from 'react';
import { Mic, BarChart3, Radio, Sparkles, Volume2, ShieldCheck, Languages } from 'lucide-react';

interface NavbarProps {
  activeTab: 'assistant' | 'dashboard';
  setActiveTab: (tab: 'assistant' | 'dashboard') => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  onOpenBenchmark: () => void;
  onOpenReminders: () => void;
  remindersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedLanguage,
  setSelectedLanguage,
  onOpenBenchmark,
  onOpenReminders,
  remindersCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('assistant')}>
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/40">
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 font-bold" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                  RYTHUM <span className="text-emerald-400 ml-1">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                  రైతుమ్
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 uppercase tracking-wider">
                  Gnani Inside
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium truncate max-w-sm">
                Autonomous Multilingual Voice OS for Indian Farmers
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700">
              <Languages className="w-4 h-4 text-slate-400 ml-2 mr-1 hidden sm:block" />
              <button
                onClick={() => setSelectedLanguage('te')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedLanguage === 'te'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Telugu First"
              >
                తెలుగు
              </button>
              <button
                onClick={() => setSelectedLanguage('hi')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedLanguage === 'hi'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedLanguage === 'en'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Benchmark Runner Button */}
            <button
              onClick={onOpenBenchmark}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm"
              title="Test Noisy Agricultural Audio"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden md:inline">Noisy STT Test</span>
            </button>

            {/* Reminders Pill */}
            <button
              onClick={onOpenReminders}
              className="relative flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <span>రిమైండర్లు</span>
              {remindersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {remindersCount}
                </span>
              )}
            </button>

            {/* Tab Switcher (Voice vs Admin) */}
            <div className="flex bg-slate-800/90 rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => setActiveTab('assistant')}
                className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'assistant'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">రైతు వాయిస్</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Dashboard</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
