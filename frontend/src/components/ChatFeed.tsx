import React, { useState } from 'react';
import { ChatMessage, AgentTraceStep } from '../types';
import { Volume2, VolumeX, Sparkles, ShieldCheck, ChevronRight, User, Bot, Clock, Loader2 } from 'lucide-react';
import { getTranslation } from '../i18n';
import { api } from '../services/api';

interface ChatFeedProps {
  messages: ChatMessage[];
  onOpenTrace: (trace: AgentTraceStep[], messageText: string) => void;
  selectedLanguage?: string;
  onUpdateMessageAudio?: (messageId: string, audioBase64: string) => void;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  messages,
  onOpenTrace,
  selectedLanguage = 'te',
  onUpdateMessageAudio,
}) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loadingTTSId, setLoadingTTSId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const t = getTranslation(selectedLanguage);

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingAudioId(null);
  };

  const playBase64Audio = (id: string, base64Audio: string) => {
    stopCurrentAudio();
    try {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingAudioId(null);
      };

      audio.play().then(() => {
        setPlayingAudioId(id);
      }).catch(err => {
        console.warn("Audio playback issue:", err);
        setPlayingAudioId(null);
      });
    } catch (e) {
      console.error(e);
      setPlayingAudioId(null);
    }
  };

  const handlePlayAudio = (messageId: string, base64Audio?: string) => {
    if (playingAudioId === messageId) {
      stopCurrentAudio();
      return;
    }
    if (base64Audio) {
      playBase64Audio(messageId, base64Audio);
    }
  };

  // Speaks user's question via Gnani Timbre TTS
  const handleSpeakUserMessage = async (msg: ChatMessage) => {
    if (playingAudioId === msg.id) {
      stopCurrentAudio();
      return;
    }

    if (msg.audio_base64) {
      playBase64Audio(msg.id, msg.audio_base64);
      return;
    }

    try {
      setLoadingTTSId(msg.id);
      const res = await api.synthesizeSpeech(msg.text, selectedLanguage);
      if (res && res.audio_base64) {
        msg.audio_base64 = res.audio_base64;
        if (onUpdateMessageAudio) {
          onUpdateMessageAudio(msg.id, res.audio_base64);
        }
        playBase64Audio(msg.id, res.audio_base64);
      }
    } catch (err) {
      console.error("Failed to synthesize user question:", err);
    } finally {
      setLoadingTTSId(null);
    }
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 my-2">
      {messages.map((msg) => {
        const isFarmer = msg.sender === 'farmer';

        return (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${isFarmer ? 'justify-end' : 'justify-start'}`}
          >
            {/* Bot Avatar */}
            {!isFarmer && (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-amber-400 flex items-center justify-center flex-shrink-0 shadow-lg border border-emerald-300/40">
                <Bot className="w-5 h-5 text-slate-950 font-bold" />
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-xl rounded-3xl p-5 shadow-xl transition-all ${
                isFarmer
                  ? 'bg-emerald-950/90 border border-emerald-700/80 text-white rounded-tr-none'
                  : 'bg-slate-900/90 border border-emerald-900/40 text-slate-100 rounded-tl-none backdrop-blur-md'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between space-x-3 mb-2 pb-1.5 border-b border-white/10 text-[11px]">
                <div className="flex items-center space-x-1.5 font-bold">
                  <span>{isFarmer ? t.farmerVoiceLabel : t.assistantLabel}</span>
                  {msg.detected_language && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
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
              <div className="text-sm leading-relaxed whitespace-pre-line font-normal text-slate-100">
                {msg.text}
              </div>

              {/* Farmer question voice playback button */}
              {isFarmer && (
                <div className="mt-2.5 pt-2 border-t border-emerald-800/60 flex items-center justify-between">
                  <button
                    onClick={() => handleSpeakUserMessage(msg)}
                    disabled={loadingTTSId === msg.id}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      playingAudioId === msg.id
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50'
                    }`}
                    title={t.speakQuestion}
                  >
                    {playingAudioId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>{t.stopVoiceBtn}</span>
                      </>
                    ) : loadingTTSId === msg.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                        <span>{t.analyzingBtn}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{t.speakQuestion}</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-emerald-400/80 font-mono">
                    Gnani Timbre TTS
                  </span>
                </div>
              )}

              {/* Verified Citations Badge */}
              {!isFarmer && msg.sources && msg.sources.length > 0 && (
                <div className="mt-3.5 pt-2.5 border-t border-slate-800/90">
                  <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-bold mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.verifiedCitationLabel}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-emerald-950/90 border border-emerald-700/70 text-emerald-300 text-[10px] font-mono shadow-sm"
                      >
                        {src.source_organization} • ID: {src.verified_advisory_id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Toolbar for AI message */}
              {!isFarmer && (
                <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* Repeat Voice Playback Button */}
                  {msg.audio_base64 && (
                    <button
                      onClick={() => handlePlayAudio(msg.id, msg.audio_base64)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        playingAudioId === msg.id
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 shadow-emerald-500/20'
                      }`}
                      title={t.repeatAnswer}
                    >
                      {playingAudioId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>{t.stopVoiceBtn}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t.repeatAnswer}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Agent Trace Inspector Button */}
                  {msg.agent_trace && msg.agent_trace.length > 0 && (
                    <button
                      onClick={() => onOpenTrace(msg.agent_trace || [], msg.text)}
                      className="flex items-center space-x-1 text-slate-300 hover:text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 transition-colors ml-auto shadow-sm"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{t.aiTraceBtn}</span>
                      <ChevronRight className="w-3 h-3 ml-0.5 text-slate-400" />
                    </button>
                  )}

                  {/* Telemetry pill */}
                  {msg.telemetry && (
                    <div className="text-[10px] font-mono text-slate-400 w-full text-right mt-1">
                      Latency: STT {msg.telemetry.latency_stt_ms || 0}ms + Agent {msg.telemetry.latency_agent_ms || 0}ms + TTS {msg.telemetry.latency_tts_ms || 0}ms = <span className="text-emerald-400 font-bold">{msg.telemetry.total_latency_ms}ms</span>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Farmer Avatar */}
            {isFarmer && (
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-emerald-900/40 flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
