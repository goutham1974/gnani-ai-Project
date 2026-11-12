import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2, Sparkles, RefreshCw } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
  isProcessing: boolean;
  selectedLanguage: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioReady,
  isProcessing,
  selectedLanguage,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
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
        onAudioReady(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access not available or denied. Generating simulated voice waveform for testing.', err);
      // Fallback synthetic audio blob for testing
      simulateAudioRecording();
    }
  };

  const simulateAudioRecording = () => {
    setIsRecording(true);
    setRecordTime(0);
    timerRef.current = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);

    setTimeout(() => {
      stopRecording();
    }, 2800);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Mock audio blob
      const dummyBuffer = new ArrayBuffer(4096);
      const audioBlob = new Blob([dummyBuffer], { type: 'audio/wav' });
      onAudioReady(audioBlob);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      
      {/* Language Header / Instruction */}
      <div className="text-center mb-5">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Gnani Prisma v3.0 STT & Timbre TTS</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {selectedLanguage === 'te'
            ? 'మీ భాషలో మాట్లాడండి'
            : selectedLanguage === 'hi'
            ? 'अपनी भाषा में बोलिए'
            : 'Speak Naturally in Your Language'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
          {selectedLanguage === 'te'
            ? 'మైక్ బటన్ నొక్కి మీ పంట సమస్య, మార్కెట్ ధరలు లేదా రిమైండర్ గురించి అడగండి.'
            : 'Press the mic button to ask about crop diseases, mandi prices, or set farming reminders.'}
        </p>
      </div>

      {/* Big Animated Mic Button */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Ripple Effect during Recording */}
        {isRecording && (
          <>
            <span className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-ping"></span>
            <span className="absolute w-44 h-44 rounded-full bg-emerald-500/10 animate-pulse"></span>
          </>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-xl ${
            isProcessing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-2 border-slate-700'
              : isRecording
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-4 border-rose-400/60 shadow-rose-600/40'
              : 'bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-slate-950 border-4 border-emerald-400/80 shadow-emerald-600/40 hover:scale-105'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-1" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                విశ్లేషణ...
              </span>
            </>
          ) : isRecording ? (
            <>
              <Square className="w-8 h-8 text-white fill-current mb-1" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                ఆపండి
              </span>
            </>
          ) : (
            <>
              <Mic className="w-9 h-9 sm:w-10 sm:h-10 text-slate-950 stroke-[2.5] mb-1" />
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-wider">
                మాట్లాడండి
              </span>
            </>
          )}
        </button>
      </div>

      {/* Status & Timer */}
      <div className="text-center mt-2">
        {isRecording ? (
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-sm font-bold bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/60">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>రైతు వాయిస్ రికార్డ్ అవుతోంది: {formatTime(recordTime)}</span>
          </div>
        ) : isProcessing ? (
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-semibold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            <span>Gnani Prisma STT ➔ LangGraph Agent ➔ Gnani Timbre TTS</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            (నొక్కండి • మాట్లాడండి • సమాధానం వినండి)
          </span>
        )}
      </div>

    </div>
  );
};
