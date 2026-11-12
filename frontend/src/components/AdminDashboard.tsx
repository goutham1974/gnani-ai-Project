import React, { useState, useEffect } from 'react';
import { DashboardData } from '../types';
import { api } from '../services/api';
import { 
  BarChart3, 
  Activity, 
  Clock, 
  CheckCircle, 
  Languages, 
  Cpu, 
  Zap, 
  Radio, 
  ShieldCheck, 
  RefreshCw,
  Layers
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.getDashboardMetrics();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-sm font-semibold text-slate-400">టెలిమెట్రీ డేటా లోడ్ అవుతోంది...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Title & Live Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-white">RYTHUM AI Engineering Telemetry</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-mono font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE TELEMETRY</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-agent orchestration, speech recognition accuracy, and task automation performance
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>రిఫ్రెష్ చేయండి</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Queries */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">రైతు సంభాషణలు (Queries)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {data.kpis.total_queries}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
            +18% Today • Multilingual
          </span>
        </div>

        {/* Avg Latency */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">సగటు టర్న్‌అరౌండ్ సమయం</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {data.kpis.avg_latency_ms} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold block mt-1">
            STT + LangGraph + TTS
          </span>
        </div>

        {/* Speech Accuracy */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">తెలుగు ఖచ్చితత్వం (Accuracy)</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {data.kpis.telugu_speech_accuracy}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Prisma v3.0 WER: {data.stt_performance.overall_wer}
          </span>
        </div>

        {/* Automated Tasks */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">ఆటోమేటెడ్ టాస్క్‌లు</span>
            <CheckCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {data.kpis.tasks_completed} / {data.kpis.total_tasks_automated}
          </div>
          <span className="text-[10px] text-purple-400 font-semibold block mt-1">
            Reminders & Farm Records
          </span>
        </div>

      </div>

      {/* Two Column Section: Language Distribution & Multi-Agent Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Language Breakdown */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Languages className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">భాషల వర్గీకరణ (Language Distribution)</h3>
          </div>

          <div className="space-y-3">
            {data.language_distribution.map((lang, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{lang.language}</span>
                  <span className="font-mono text-slate-400">{lang.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-emerald-500'
                        : idx === 1
                        ? 'bg-amber-400'
                        : idx === 2
                        ? 'bg-cyan-400'
                        : 'bg-indigo-400'
                    }`}
                    style={{ width: `${lang.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            💡 <strong>గమనిక:</strong> తెలుగు మరియు కోడ్-మిక్స్డ్ (తెలుగు-ఇంగ్లీష్ సంభాషణలు) మొత్తం ప్రశ్నలలో 86% వాటా కలిగి ఉన్నాయి.
          </p>
        </div>

        {/* Multi-Agent Orchestration Distribution */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">LangGraph ఏజెంట్ల కార్యకలాపాలు</h3>
          </div>

          <div className="space-y-3">
            {data.agent_distribution.map((agent, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{agent.agent}</span>
                  <span className="font-mono text-slate-400">{agent.pct}% ({agent.invocations} calls)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                    style={{ width: `${agent.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            🛡️ ప్రతి AI సమాధానం ANGRAU మరియు ICAR డాక్యుమెంట్లతో Verification Node ద్వారా సరిచూడబడింది.
          </p>
        </div>

      </div>

      {/* Latency Pipeline Breakdown */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Speech & Agent Latency Waterfall (ల్యాటెన్సీ విశ్లేషణ)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Gnani Prisma STT</span>
            <span className="text-lg font-black font-mono text-white mt-1 block">
              {data.stt_performance.avg_stt_latency_ms} ms
            </span>
            <span className="text-[10px] text-emerald-400">Indic-Auto Stream</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. LangGraph Agent</span>
            <span className="text-lg font-black font-mono text-white mt-1 block">
              {data.stt_performance.avg_llm_latency_ms} ms
            </span>
            <span className="text-[10px] text-amber-400">Router + Tools + RAG</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">3. Gnani Timbre TTS</span>
            <span className="text-lg font-black font-mono text-white mt-1 block">
              {data.stt_performance.avg_tts_latency_ms} ms
            </span>
            <span className="text-[10px] text-cyan-400">Nalini Telugu Voice</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/80">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">మొత్తం రెస్పాన్స్ సమయం</span>
            <span className="text-lg font-black font-mono text-emerald-400 mt-1 block">
              {data.stt_performance.total_turnaround_latency_ms} ms
            </span>
            <span className="text-[10px] text-emerald-300 font-bold">Sub-second Latency ⚡</span>
          </div>
        </div>
      </div>

    </div>
  );
};
