import React, { useEffect, useState } from 'react';
import { WeatherAdvisory } from '../types';
import { api } from '../services/api';
import { CloudSun, Droplets, Wind, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getTranslation } from '../i18n';

interface WeatherCardProps {
  selectedLanguage?: string;
}

const REGION_TRANSLATIONS: Record<string, Record<string, string>> = {
  Guntur: {
    en: 'Guntur / Andhra Pradesh',
    te: 'Guntur / గుంటూరు',
    hi: 'Guntur / गुंटूर',
    kn: 'Guntur / ಗುಂಟೂರು',
    ta: 'Guntur / குண்டூர்',
    mr: 'Guntur / गुंटूर'
  },
  Warangal: {
    en: 'Warangal / Telangana',
    te: 'Warangal / వరంగల్',
    hi: 'Warangal / वारंगल',
    kn: 'Warangal / ವಾರಂಗಲ್',
    ta: 'Warangal / வாரங்கல்',
    mr: 'Warangal / वारंगल'
  },
  Kurnool: {
    en: 'Kurnool / Andhra Pradesh',
    te: 'Kurnool / కర్నూలు',
    hi: 'Kurnool / कर्नूल',
    kn: 'Kurnool / ಕರ್ನೂಲು',
    ta: 'Kurnool / கர்னூல்',
    mr: 'Kurnool / कर्नूल'
  },
  Hyderabad: {
    en: 'Hyderabad / Telangana',
    te: 'Hyderabad / హైదరాబాద్',
    hi: 'Hyderabad / हैदराबाद',
    kn: 'Hyderabad / ಹೈದರಾಬಾದ್',
    ta: 'Hyderabad / ஹைதராபாத்',
    mr: 'Hyderabad / हैदराबाद'
  },
  Vijayawada: {
    en: 'Vijayawada / Andhra Pradesh',
    te: 'Vijayawada / విజయవాడ',
    hi: 'Vijayawada / विजयवाड़ा',
    kn: 'Vijayawada / ವಿಜಯವಾಡ',
    ta: 'Vijayawada / விஜயவாடா',
    mr: 'Vijayawada / विजयवाडा'
  },
  Khammam: {
    en: 'Khammam / Telangana',
    te: 'Khammam / ఖమ్మం',
    hi: 'Khammam / खम्मम',
    kn: 'Khammam / ಖಮ್ಮಂ',
    ta: 'Khammam / கம்மம்',
    mr: 'Khammam / खम्मम'
  }
};

export const getLocalizedRegion = (rawRegion: string, lang: string): string => {
  for (const [key, map] of Object.entries(REGION_TRANSLATIONS)) {
    if (rawRegion.toLowerCase().includes(key.toLowerCase())) {
      return map[lang] || map['en'] || `${key} / ${key}`;
    }
  }
  if (rawRegion.includes(' / ')) {
    const [engPart] = rawRegion.split(' / ');
    return engPart.trim();
  }
  return rawRegion;
};

const ADVISORIES_BY_LANG: Record<string, string> = {
  te: 'వాతావరణం అనుకూలంగా ఉంది. ఉదయం లేదా సాయంత్రం వేళల్లో తెగుళ్ల నివారణ మందులు పిచికారీ చేయవచ్చు.',
  hi: 'मौसम अनुकूल है। सुबह या शाम के समय फसलों में कीटनाशक का सुरक्षित छिड़काव किया जा सकता है।',
  kn: 'ಹವಾಮಾನವು ಅನುಕೂಲಕರವಾಗಿದೆ. ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆಯ ವೇಳೆಯಲ್ಲಿ ಕೀಟನಾಶಕ ಸಿಂಪರಣೆ ಮಾಡಬಹುದು.',
  ta: 'வானிலை சாதகமாக உள்ளது. காலை அல்லது மாலை வேளையில் பூச்சிக்கொல்லி மருந்து தெளிக்கலாம்.',
  mr: 'हवामान अनुकूल आहे. सकाळी किंवा संध्याकाळी पिकांवर कीटकनाशक फवारणी केली जाऊ शकते.',
  en: 'Weather is favorable for agricultural operations. Recommended for spraying in early morning or evening hours.'
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ selectedLanguage = 'te' }) => {
  const [advisory, setAdvisory] = useState<WeatherAdvisory | null>(null);
  const t = getTranslation(selectedLanguage);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      const data = await api.getWeatherAdvisories();
      if (data && data.length > 0) {
        setAdvisory(data[0]);
      }
    } catch (e) {
      console.error('Failed to load weather:', e);
    }
  };

  if (!advisory) return null;

  const isSuitable = advisory.spray_suitability.includes('SUITABLE') && !advisory.spray_suitability.includes('NOT');
  const localizedRegion = getLocalizedRegion(advisory.region, selectedLanguage);
  const advisoryText = ADVISORIES_BY_LANG[selectedLanguage] || advisory.farming_advisory_en || advisory.farming_advisory_te;

  return (
    <div className="bg-slate-900/90 border border-emerald-900/30 rounded-3xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <CloudSun className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block font-sans tracking-wide">
              {localizedRegion}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">{t.weatherTitle}</span>
          </div>
        </div>

        <div
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
            isSuitable
              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-600/70'
              : 'bg-rose-950/90 text-rose-300 border border-rose-600/70'
          }`}
        >
          {isSuitable ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.weatherSpraySuitable}</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.weatherSprayPostpone}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 py-2.5 px-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center mb-3 shadow-inner">
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">{t.tempLabel}</span>
          <span className="text-base font-bold text-white font-mono">{advisory.temperature_c}°C</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5 flex items-center justify-center space-x-1">
            <Droplets className="w-3 h-3 text-cyan-400 inline" />
            <span>{t.humidityLabel}</span>
          </span>
          <span className="text-base font-bold text-cyan-300 font-mono">{advisory.humidity_pct}%</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5 flex items-center justify-center space-x-1">
            <Wind className="w-3 h-3 text-slate-400 inline" />
            <span>{t.windLabel}</span>
          </span>
          <span className="text-base font-bold text-slate-300 font-mono">{advisory.wind_speed_kmh} km/h</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
        💡 <strong className="text-emerald-400">{t.weatherTitle}:</strong> {advisoryText}
      </p>
    </div>
  );
};
