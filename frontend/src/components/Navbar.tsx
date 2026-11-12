import React from 'react';
import { Mic, BarChart3, Radio, Cpu, Bell } from 'lucide-react';
import { getTranslation } from '../i18n';

interface NavbarProps {
  activeTab: 'assistant' | 'dashboard';
  setActiveTab: (tab: 'assistant' | 'dashboard') => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  onOpenBenchmark: () => void;
  onOpenReminders: () => void;
  remindersCount: number;
}

const LANGUAGES = [
  { code: 'te', label: 'తెలుగు', name: 'Telugu' },
  { code: 'hi', label: 'हिंदी', name: 'Hindi' },
  { code: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
  { code: 'mr', label: 'मराठी', name: 'Marathi' },
  { code: 'en', label: 'English', name: 'English' }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedLanguage,
  setSelectedLanguage,
  onOpenBenchmark,
  onOpenReminders,
  remindersCount,
}) => {
  const t = getTranslation(selectedLanguage);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-emerald-900/40 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('assistant')}>
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-300/40">
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 font-bold" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                  RYTHUM <span className="text-emerald-400 ml-1">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {t.appNativeName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-800/80 uppercase tracking-wider flex items-center space-x-1">
                  <Cpu className="w-3 h-3 text-amber-400" />
                  <span>Gemini + Gnani</span>
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-medium truncate max-w-sm">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Navigation & Language Selectors */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* 6-Language Native Selector */}
            <div className="flex items-center bg-slate-900/90 rounded-2xl p-1 border border-slate-800 shadow-inner">
              <div className="flex space-x-0.5 overflow-x-auto max-w-[210px] sm:max-w-none no-scrollbar">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={lang.name}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Acoustic Benchmark Studio */}
            <button
              onClick={onOpenBenchmark}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
              title="Test Noisy Agricultural Audio"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{t.acousticStudio}</span>
            </button>

            {/* Reminders Pill */}
            <button
              onClick={onOpenReminders}
              className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all shadow-sm"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t.reminders}</span>
              {remindersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {remindersCount}
                </span>
              )}
            </button>

            {/* View Switcher: Farmer Voice vs Engineering Telemetry */}
            <div className="flex bg-slate-900/90 rounded-2xl p-1 border border-slate-800">
              <button
                onClick={() => setActiveTab('assistant')}
                className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'assistant'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.voiceOS}</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.dashboard}</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
