import React from 'react';
import { AgentTraceStep } from '../types';
import { X, Network, CheckCircle, ArrowDown, Bot, ShieldCheck, Zap } from 'lucide-react';

interface AgentTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  trace: AgentTraceStep[];
  queryText: string;
}

export const AgentTraceModal: React.FC<AgentTraceModalProps> = ({
  isOpen,
  onClose,
  trace,
  queryText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Network className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>LangGraph Multi-Agent Execution Trace</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-mono">
                  Autonomous
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Step-by-step reasoning, intent routing, and verification trace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Query Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Farmer Voice Input (రైతు ప్రశ్న)
            </span>
            <p className="text-sm font-medium text-emerald-400 font-sans">
              "{queryText}"
            </p>
          </div>

          {/* Execution Steps */}
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-emerald-500 before:to-blue-500">
            {trace.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Node Dot */}
                <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center shadow">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                </div>

                {/* Step Card */}
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span>{step.agent}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                      Step #{idx + 1}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-emerald-400 mb-1">
                    Action: {step.action}
                  </div>

                  <p className="text-xs text-slate-300 font-mono bg-slate-950/80 p-2 rounded-xl border border-slate-900 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            మూసివేయి (Close Trace)
          </button>
        </div>

      </div>
    </div>
  );
};

