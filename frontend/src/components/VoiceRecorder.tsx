import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Sparkles, RefreshCw, AudioWaveform } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioReady: (audioBlob: Blob, liveTranscript?: string) => void;
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

const PROMPT_HINTS: Record<string, { title: string; subtitle: string }> = {
  te: {
    title: 'మీ మాతృభాషలో మాట్లాడండి (తెలుగు)',
    subtitle: 'మైక్ బటన్ నొక్కి మీ పంట సమస్య, మార్కెట్ ధరలు లేదా పనుల రిమైండర్ గురించి అడగండి.'
  },
  hi: {
    title: 'अपनी मातृभाषा में बोलिए (हिंदी)',
    subtitle: 'माइक बटन दबाएं और अपनी फसल की बीमारी, मंडी भाव या काम का रिमाइंडर पूछें।'
  },
  kn: {
    title: 'ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ (ಕನ್ನಡ)',
    subtitle: 'ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಬೆಳೆ ಸಮಸ್ಯೆ, ಮಾರುಕಟ್ಟೆ ದರ ಅಥವಾ ಕೃಷಿ ಕೆಲಸಗಳ ಬಗ್ಗೆ ಕೇಳಿ.'
  },
  ta: {
    title: 'உங்கள் தாய்மொழியில் பேசுங்கள் (தமிழ்)',
    subtitle: 'மைக் பொத்தானை அழுத்தி பயிர் பிரச்சனைகள், சந்தை விலை அல்லது நினைவூட்டல் பற்றி கேட்கவும்.'
  },
  mr: {
    title: 'आपल्या मातृभाषेत बोला (मराठी)',
    subtitle: 'माइक बटण दाबा आणि पिकांचे रोग, बाजारभाव किंवा शेतीकामांचे रिमाइंडर्स विचारा.'
  },
  en: {
    title: 'Speak Naturally in Your Native Language',
    subtitle: 'Tap the mic to ask about crop diseases, mandi prices, weather forecast, or reminders.'
  }
};

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioReady,
  isProcessing,
  selectedLanguage,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const langKey = selectedLanguage in PROMPT_HINTS ? selectedLanguage : 'en';
  const hints = PROMPT_HINTS[langKey];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
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
        onAudioReady(audioBlob, liveTranscript);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);

      // 2. Start Browser Web Speech Recognition (for accurate zero-latency live words)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = SPEECH_RECOGNITION_LANG[selectedLanguage] || 'te-IN';

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interim += event.results[i][0].transcript;
          }
          if (interim) {
            setLiveTranscript(interim);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition warning:', err);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.warn('Microphone stream initialization:', err);
      // Fallback timer simulation for systems without hardware mic
      simulateRecording();
    }
  };

  const simulateRecording = () => {
    setIsRecording(true);
    setRecordTime(0);
    setLiveTranscript('');

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
      onAudioReady(audioBlob, liveTranscript);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-emerald-900/30 rounded-3xl shadow-2xl relative overflow-hidden">
      
      {/* Decorative Glow Background */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
      <div className="absolute -top-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="text-center mb-4 z-10">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 mb-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Gnani Prisma v3.0 STT & Timbre TTS</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {hints.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          {hints.subtitle}
        </p>
      </div>

      {/* Live Interim Transcript Pill */}
      {liveTranscript && (
        <div className="my-2 px-4 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-medium max-w-md text-center shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <span className="text-emerald-500 font-bold block text-[10px] uppercase tracking-wider mb-0.5">
            లైవ్ వాయిస్ రికగ్నిషన్ (Live Speech):
          </span>
          "{liveTranscript}"
        </div>
      )}

      {/* Big Animated Central Mic Button */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Animated Ripple Circles */}
        {isRecording && (
          <>
            <span className="absolute w-36 h-36 rounded-full bg-rose-500/20 animate-ping"></span>
            <span className="absolute w-44 h-44 rounded-full bg-rose-500/10 animate-pulse"></span>
            <span className="absolute w-52 h-52 rounded-full border border-rose-500/30 animate-pulse"></span>
          </>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-2xl ${
            isProcessing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-2 border-slate-700'
              : isRecording
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-4 border-rose-400/80 shadow-rose-600/50 scale-105'
              : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-400 hover:from-emerald-500 hover:to-green-300 text-slate-950 border-4 border-emerald-300/80 shadow-emerald-500/40 hover:scale-105'
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
                ఆపండి (Stop)
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

      {/* Equalizer Frequency Bars Animation when recording */}
      {isRecording && (
        <div className="flex items-center space-x-1.5 my-2">
          {[40, 70, 95, 60, 85, 50, 90, 75, 45, 80].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-rose-500 rounded-full animate-pulse"
              style={{
                height: `${h * 0.35}px`,
                animationDelay: `${i * 80}ms`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Status Bar */}
      <div className="text-center mt-2 z-10">
        {isRecording ? (
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-sm font-bold bg-rose-950/70 px-4 py-1.5 rounded-full border border-rose-800/80 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>రైతు వాయిస్ రికార్డ్ అవుతోంది: {formatTime(recordTime)}</span>
          </div>
        ) : isProcessing ? (
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-semibold bg-emerald-950/70 px-4 py-1.5 rounded-full border border-emerald-800/80 shadow-lg">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Gnani Prisma STT ➔ LangGraph Agent ➔ Gnani Timbre TTS</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <AudioWaveform className="w-4 h-4 text-emerald-400" />
            <span>నొక్కండి • మీ భాషలో మాట్లాడండి • సమాధానం వినండి</span>
          </div>
        )}
      </div>

    </div>
  );
};
