import React, { useEffect, useState } from 'react';
import { MandiRate } from '../types';
import { api } from '../services/api';
import { TrendingUp, Store } from 'lucide-react';
import { getTranslation } from '../i18n';

interface MarketTickerProps {
  selectedLanguage?: string;
}

const COMMODITY_NAMES: Record<string, Record<string, string>> = {
  Tomato: { te: 'టమాటా', hi: 'टमाटर', kn: 'ಟೊಮೆಟೊ', ta: 'தக்காளி', mr: 'टोमॅटो', en: 'Tomato' },
  'Dry Chilli': { te: 'ఎండు మిర్చి', hi: 'लाल मिर्च', kn: 'ಒಣ ಮೆಣಸಿನಕಾಯಿ', ta: 'மிளகாய்', mr: 'मिरची', en: 'Dry Chilli' },
  Chilli: { te: 'ఎండు మిర్చి', hi: 'मिर्च', kn: 'ಒಣ ಮೆಣಸಿನಕಾಯಿ', ta: 'மிளகாய்', mr: 'मिरची', en: 'Chilli' },
  Cotton: { te: 'పత్తి (కపాస్)', hi: 'कपास', kn: 'ಹತ್ತಿ', ta: 'பருத்தி', mr: 'कापूस', en: 'Cotton' },
  Paddy: { te: 'వరి ధాన్యం', hi: 'धान', kn: 'ಭತ್ತ', ta: 'நெல்', mr: 'भात', en: 'Paddy' },
  Maize: { te: 'మొక్కజొన్న', hi: 'मक्का', kn: 'ಮೆಕ್ಕೆಜೋಳ', ta: 'மக்காச்சோளம்', mr: 'मका', en: 'Maize' },
  Groundnut: { te: 'వేరుశనగ', hi: 'मूंगफली', kn: 'ಕಡಲೆಕಾಯಿ', ta: 'வேர்க்கடலை', mr: 'भुईमूग', en: 'Groundnut' }
};

const MARKET_LOCALIZATION: Record<string, Record<string, string>> = {
  Guntur: { en: 'Guntur', te: 'గుంటూరు', hi: 'गुंटूर', kn: 'ಗುಂಟೂರು', ta: 'குண்டூர்', mr: 'गुंटूर' },
  Warangal: { en: 'Warangal', te: 'వరంగల్', hi: 'वारंगल', kn: 'ವಾರಂಗಲ್', ta: 'வாரங்கல்', mr: 'वारंगल' },
  Kurnool: { en: 'Kurnool', te: 'కర్నూలు', hi: 'कर्नूल', kn: 'ಕರ್ನೂಲು', ta: 'கர்னூல்', mr: 'कर्नूल' },
  Madanapalle: { en: 'Madanapalle', te: 'మదనపల్లె', hi: 'मदनपल्ले', kn: 'ಮದನಪಲ್ಲಿ', ta: 'மதனபள்ளி', mr: 'मदनपल्ले' },
  Bowenpally: { en: 'Bowenpally', te: 'బోయిన్‌పల్లి', hi: 'बोवेनपल्ली', kn: 'ಬೋವನ್‌ಪಲ್ಲಿ', ta: 'போவன்பல்லி', mr: 'बोवेनपल्ली' },
  Khammam: { en: 'Khammam', te: 'ఖమ్మం', hi: 'खम्मम', kn: 'ಖಮ್ಮಂ', ta: 'கம்மம்', mr: 'खम्मम' },
  Nizamabad: { en: 'Nizamabad', te: 'నిజామాబాద్', hi: 'निज़ामाबाद', kn: 'ನಿಜಾಮಾಬಾದ್', ta: 'நிஜாமாபாத்', mr: 'निझामाबाद' }
};

export const MarketTicker: React.FC<MarketTickerProps> = ({ selectedLanguage = 'te' }) => {
  const [rates, setRates] = useState<MandiRate[]>([]);
  const t = getTranslation(selectedLanguage);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      const data = await api.getMarketRates();
      setRates(data);
    } catch (err) {
      console.error('Failed to load market rates:', err);
    }
  };

  const getLocalizedCrop = (comm: string, defaultTe: string) => {
    const cleanComm = comm.split(' / ')[0].trim();
    const found = COMMODITY_NAMES[cleanComm] || COMMODITY_NAMES[comm];
    const nativeName = found ? found[selectedLanguage] : defaultTe;
    if (selectedLanguage === 'en' || !nativeName || nativeName === cleanComm) {
      return cleanComm;
    }
    return `${cleanComm} / ${nativeName}`;
  };

  const getLocalizedMarket = (rawMarket: string) => {
    for (const [key, map] of Object.entries(MARKET_LOCALIZATION)) {
      if (rawMarket.toLowerCase().includes(key.toLowerCase())) {
        const native = map[selectedLanguage] || map['en'] || key;
        if (selectedLanguage === 'en' || native === key) {
          return key;
        }
        return `${key} / ${native}`;
      }
    }
    return rawMarket.split('(')[0].trim();
  };

  return (
    <div className="bg-slate-900/80 border-y border-emerald-900/30 py-2.5 overflow-hidden backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider whitespace-nowrap bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-700/50 shadow-sm">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.mandiTickerTitle}</span>
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center space-x-4">
            {rates.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/70 whitespace-nowrap text-xs flex-shrink-0 hover:border-emerald-500/50 transition-colors shadow-sm"
              >
                <span className="font-semibold text-white">
                  {getLocalizedCrop(item.commodity, item.commodity_te)}
                </span>
                <span className="text-slate-400 text-[11px]">
                  ({getLocalizedMarket(item.market)})
                </span>
                <span className="font-mono font-bold text-emerald-400">₹{item.modal_price.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">{t.perQuintal}</span>
                {item.trend.includes('Up') || item.trend.includes('పెరుగు') ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400 inline" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
