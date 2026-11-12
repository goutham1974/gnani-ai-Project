import React, { useState } from 'react';
import { ChatMessage, AgentTraceStep } from '../types';
import { Volume2, VolumeX, Sparkles, ShieldCheck, ChevronRight, User, Bot, Clock } from 'lucide-react';

interface ChatFeedProps {
  messages: ChatMessage[];
  onOpenTrace: (trace: AgentTraceStep[], messageText: string) => void;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({ messages, onOpenTrace }) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = (messageId: string, base64Audio?: string) => {
    if (!base64Audio) return;

    if (playingAudioId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAudioId(null);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audioUrl = `data:audio/wav;base64,${base64Audio}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingAudioId(null);
    };

    audio.play().then(() => {
      setPlayingAudioId(messageId);
    }).catch(err => {
      console.warn("Audio playback issue:", err);
      setPlayingAudioId(null);
    });
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 my-6">
      {messages.map((msg) => {
        const isFarmer = msg.sender === 'farmer';

        return (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${isFarmer ? 'justify-end' : 'justify-start'}`}
          >
            {/* Bot Avatar */}
            {!isFarmer && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center flex-shrink-0 shadow-md border border-emerald-400/30">
                <Bot className="w-5 h-5 text-slate-950 font-bold" />
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-xl rounded-2xl p-4 shadow-lg transition-all ${
                isFarmer
                  ? 'bg-emerald-950/80 border border-emerald-800/80 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between space-x-3 mb-2 pb-1.5 border-b border-white/10 text-[11px]">
                <div className="flex items-center space-x-1.5 font-bold">
                  <span>{isFarmer ? '👨‍🌾 రైతు (రైతు వాయిస్)' : '🌿 RYTHUM AI'}</span>
                  {msg.detected_language && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {msg.detected_language}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
                  <Clock className="w-3 h-3" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="text-sm leading-relaxed whitespace-pre-line font-normal">
                {msg.text}
              </div>

              {/* Verified Citations Badge */}
              {!isFarmer && msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/90">
                  <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-bold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>పరిశోధన ఆధారిత ధ్రువీకరణ (ICAR / ANGRAU Verified):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono"
                      >
                        {src.source_organization} • ID: {src.verified_advisory_id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Toolbar for AI message */}
              {!isFarmer && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* Voice Playback Button */}
                  {msg.audio_base64 && (
                    <button
                      onClick={() => handlePlayAudio(msg.id, msg.audio_base64)}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        playingAudioId === msg.id
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {playingAudioId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>వాయిస్ ఆపండి</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>వాయిస్ వినండి (Gnani Timbre)</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Agent Trace Inspector Button */}
                  {msg.agent_trace && msg.agent_trace.length > 0 && (
                    <button
                      onClick={() => onOpenTrace(msg.agent_trace || [], msg.text)}
                      className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 text-xs font-semibold px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors ml-auto"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>AI ఆలోచన క్రమం</span>
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </button>
                  )}

                  {/* Telemetry pill */}
                  {msg.telemetry && (
                    <div className="text-[10px] font-mono text-slate-500 w-full text-right mt-1">
                      Latency: STT {msg.telemetry.latency_stt_ms || 0}ms + Agent {msg.telemetry.latency_agent_ms || 0}ms + TTS {msg.telemetry.latency_tts_ms || 0}ms = <span className="text-emerald-400 font-bold">{msg.telemetry.total_latency_ms}ms</span>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Farmer Avatar */}
            {isFarmer && (
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

