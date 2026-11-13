import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Sparkles, RefreshCw, AudioWaveform, Radio } from 'lucide-react';
import { getTranslation } from '../i18n';

interface VoiceRecorderProps {
  onAudioReady: (audioBlob: Blob, liveTranscript?: string) => void;
  onLiveSpeech?: (transcript: string) => void;
  isProcessing: boolean;
  selectedLanguage: string;
}

const SPEECH_RECOGNITION_LANG: Record<string, string> = {
  te: 'te-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
  en: 'en-IN'
};

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioReady,
  onLiveSpeech,
  isProcessing,
  selectedLanguage,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');

  const t = getTranslation(selectedLanguage);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setLiveTranscript('');
      liveTranscriptRef.current = '';
      
      // 1. Start Web Audio MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach((track) => track.stop());
        onAudioReady(audioBlob, liveTranscriptRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);

      // 2. Start Browser Web Speech Recognition (for zero-latency live voice-to-text in message box)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = SPEECH_RECOGNITION_LANG[selectedLanguage] || 'te-IN';

        recognition.onresult = (event: any) => {
          let finalAccumulated = '';
          let interimAccumulated = '';

          // Accumulate ALL speech chunks from index 0 so words are NEVER lost or truncated
          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res && res[0]) {
              if (res.isFinal) {
                finalAccumulated += res[0].transcript + ' ';
              } else {
                interimAccumulated += res[0].transcript;
              }
            }
          }

          const completeTranscript = (finalAccumulated + interimAccumulated).trim();
          if (completeTranscript) {
            setLiveTranscript(completeTranscript);
            liveTranscriptRef.current = completeTranscript;
            if (onLiveSpeech) {
              onLiveSpeech(completeTranscript);
            }

            // Auto-submit after 3.5 seconds of silence (allows natural pauses between farmer sentences)
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            silenceTimerRef.current = setTimeout(() => {
              if (liveTranscriptRef.current && liveTranscriptRef.current.trim().length > 2) {
                stopRecording();
              }
            }, 3500);
          }
        };

        recognition.onspeechend = () => {
          // Keep a relaxed 3.2s silence buffer so natural farmer breathing does not cut sentence
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (liveTranscriptRef.current && liveTranscriptRef.current.trim().length > 2) {
              stopRecording();
            }
          }, 3200);
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition warning:', err);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.warn('Microphone stream initialization:', err);
      // Fallback timer simulation for environments without audio hardware
      simulateRecording();
    }
  };

  const simulateRecording = () => {
    setIsRecording(true);
    setRecordTime(0);
    setLiveTranscript('');
    liveTranscriptRef.current = '';

    timerRef.current = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);

    setTimeout(() => {
      stopRecording();
    }, 2800);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      const dummyBuffer = new ArrayBuffer(4096);
      const audioBlob = new Blob([dummyBuffer], { type: 'audio/wav' });
      onAudioReady(audioBlob, liveTranscriptRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 border border-emerald-800/40 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
      
      {/* Decorative Botanical Glow Background */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 via-green-400 to-amber-400"></div>
      <div className="absolute -top-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="text-center mb-4 z-10">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/70 mb-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.voiceStudioBadge}</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {t.voiceStudioTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          {t.voiceStudioSubtitle}
        </p>
      </div>

      {/* Live Interim Transcript Pill */}
      {liveTranscript && (
        <div className="my-2 px-4 py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-medium max-w-md text-center shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <span className="text-emerald-400 font-bold block text-[10px] uppercase tracking-wider mb-0.5 flex items-center justify-center space-x-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>{t.liveSpeechLabel}</span>
          </span>
          "{liveTranscript}"
        </div>
      )}

      {/* Big Animated Central Mic Button */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Animated Ripple Circles */}
        {isRecording && (
          <>
            <span className="absolute w-36 h-36 rounded-full bg-rose-500/25 animate-ping"></span>
            <span className="absolute w-44 h-44 rounded-full bg-rose-500/15 animate-pulse"></span>
            <span className="absolute w-56 h-56 rounded-full border border-rose-500/30 animate-pulse"></span>
          </>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          aria-label={isRecording ? t.stopBtn : t.speakBtn}
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-2xl ${
            isProcessing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-2 border-slate-700'
              : isRecording
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-4 border-rose-300 shadow-rose-600/50 scale-105'
              : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-400 hover:from-emerald-500 hover:to-green-300 text-slate-950 border-4 border-emerald-200 shadow-emerald-500/40 hover:scale-105'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-1" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                {t.analyzingBtn}
              </span>
            </>
          ) : isRecording ? (
            <>
              <Square className="w-8 h-8 text-white fill-current mb-1" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                {t.stopBtn}
              </span>
            </>
          ) : (
            <>
              <Mic className="w-9 h-9 sm:w-10 sm:h-10 text-slate-950 stroke-[2.5] mb-1" />
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-wider">
                {t.speakBtn}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Dynamic Sound Equalizer Waveform */}
      {isRecording && (
        <div className="flex items-center space-x-1.5 my-2.5">
          {[35, 65, 95, 50, 85, 45, 100, 75, 40, 90, 60, 80].map((h, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-rose-600 to-amber-400 rounded-full animate-pulse"
              style={{
                height: `${h * 0.38}px`,
                animationDelay: `${i * 75}ms`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Localized Status Bar */}
      <div className="text-center mt-2 z-10">
        {isRecording ? (
          <div className="flex items-center space-x-2 text-rose-300 font-mono text-xs sm:text-sm font-bold bg-rose-950/80 px-4 py-1.5 rounded-full border border-rose-700/80 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>{t.recordingStatus} {formatTime(recordTime)}</span>
          </div>
        ) : isProcessing ? (
          <div className="flex items-center space-x-2 text-emerald-300 font-mono text-xs font-semibold bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-700/80 shadow-lg">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>{t.processingStatus}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <AudioWaveform className="w-4 h-4 text-emerald-400" />
            <span>{t.voiceInstruction}</span>
          </div>
        )}
      </div>

    </div>
  );
};
