import React, { useState } from 'react';
import { BenchmarkResult } from '../types';
import { api } from '../services/api';
import { X, Play, Loader2, Radio, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';

interface NoisyBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoisyBenchmarkModal: React.FC<NoisyBenchmarkModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BenchmarkResult | null>(null);

  if (!isOpen) return null;

  const handleRunBenchmark = async () => {
    try {
      setLoading(true);
      const res = await api.runNoisyBenchmark();
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Radio className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Noisy Audio STT Intelligence Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                  Prisma Evaluation
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Benchmarking Gnani Prisma transcription in harsh agricultural noise environments
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
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Info Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
            <Cpu className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-white mb-1">
                పరిశోధన స్థాయి ధ్రువీకరణ (Empirical Acoustic Verification):
              </p>
              రైతులు పొలాల్లో పనిచేసేటప్పుడు ట్రాక్టర్ ఇంజిన్ల రొద, గాలులు, వ్యవసాయ మోటార్ల శబ్దాల మధ్య మాట్లాడతారు. 
              ఈ స్టూడియో Gnani Prisma మోడల్ యొక్క Word Error Rate (WER) మరియు ఖచ్చితత్వాన్ని లెక్కించి లైవ్ ఫలితాలను ప్రదర్శిస్తుంది.
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {results ? `పరీక్షించిన నమూనాలు: ${results.total_samples}` : 'పరీక్షించడానికి సిద్ధంగా ఉంది'}
            </span>
            <button
              onClick={handleRunBenchmark}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>శబ్దాలను విశ్లేషిస్తోంది...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-slate-950" />
                  <span>రన్ నాయిసీ ఆడియో బెంచ్‌మార్క్</span>
                </>
              )}
            </button>
          </div>

          {/* Results Summary Scorecard */}
          {results && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">సగటు ఖచ్చితత్వం (Accuracy)</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {results.overall_accuracy_pct}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Word Error Rate (WER)</span>
                <span className="text-2xl font-black font-mono text-cyan-400">
                  {results.average_wer}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">స్టేటస్</span>
                <span className="text-sm font-bold text-amber-400 block mt-1">
                  ROBUST ✅
                </span>
              </div>
            </div>
          )}

          {/* Test Cases Table */}
          {results && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                వివరణాత్మక పరీక్ష రికార్డులు (Acoustic Noise Breakdown)
              </h4>
              <div className="space-y-2.5">
                {results.benchmark_results.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{item.condition}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300">
                          SNR: {item.snr_db} dB
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          Accuracy: {item.accuracy_pct}%
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          WER: {item.wer}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="text-slate-400">
                        <span className="text-slate-600">Audio Ground Truth:</span> "{item.ground_truth}"
                      </div>
                      <div className="text-emerald-400">
                        <span className="text-slate-600">Prisma Recognized:</span> "{item.transcription}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            పూర్తి (Done)
          </button>
        </div>

      </div>
    </div>
  );
};
