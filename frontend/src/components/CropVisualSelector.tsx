import React from 'react';
import { Sparkles } from 'lucide-react';
import { getTranslation } from '../i18n';

interface CropItem {
  id: string;
  name: Record<string, string>;
  icon: string;
  gradient: string;
  tagline: Record<string, string>;
  defaultQuery: Record<string, string>;
}

const CROPS: CropItem[] = [
  {
    id: 'tomato',
    name: {
      te: 'టమాటా',
      hi: 'टमाटर',
      kn: 'ಟೊಮೆಟೊ',
      ta: 'தக்காளி',
      mr: 'टोमॅटो',
      en: 'Tomato'
    },
    icon: '🍅',
    gradient: 'from-rose-500/20 via-red-500/10 to-amber-500/20 border-rose-500/30 text-rose-400',
    tagline: {
      te: 'ఆకుముడుత & మండి ధరలు',
      hi: 'पत्ती मरोड़ व मंडी भाव',
      kn: 'ಎಲೆ ಮುರುಟು ರೋಗ & ದರ',
      ta: 'இலை சுருள் & சந்தை விலை',
      mr: 'पाने आकसणे व बाजारभाव',
      en: 'Leaf curl & Mandi rates'
    },
    defaultQuery: {
      te: 'నా టమాటా పంటకు ఆకులు పసుపు రంగులోకి మారుతున్నాయి, దీనికి నివారణ ఏమిటి?',
      hi: 'मेरे टमाटर की पत्तियां पीली पड़ रही हैं, क्या समाधान है?',
      kn: 'ನನ್ನ ಟೊಮೆಟೊ ಬೆಳೆಯ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿವೆ, ಪರಿಹಾರವೇನು?',
      ta: 'என் தக்காளி பயிரின் இலைகள் மஞ்சள் நிறமாக மாறுகின்றன, என்ன செய்ய வேண்டும்?',
      mr: 'माझ्या टोमॅटो पिकाची पाने पिवळी पडत आहेत, काय उपाय करावा?',
      en: 'My tomato leaves are turning yellow, what is the remedy?'
    }
  },
  {
    id: 'chilli',
    name: {
      te: 'మిరప / మిర్చి',
      hi: 'हरी/लाल मिर्च',
      kn: 'ಮೆಣಸಿನಕಾಯಿ',
      ta: 'மிளகாய்',
      mr: 'मिरची',
      en: 'Chilli'
    },
    icon: '🌶️',
    gradient: 'from-red-600/20 via-orange-500/10 to-rose-600/20 border-red-500/30 text-red-400',
    tagline: {
      te: 'నల్ల తామర పురుగు & గుంటూరు ధర',
      hi: 'ब्लैक थ्रिप्स व गुंटूर भाव',
      kn: 'ಕಪ್ಪು ನುಸಿ & ಮಾರುಕಟ್ಟೆ ದರ',
      ta: 'கருப்பு த்ரிப்ஸ் & சந்தை',
      mr: 'काळा थ्रिप्स व दर',
      en: 'Black Thrips & Guntur rates'
    },
    defaultQuery: {
      te: 'ఈరోజు గుంటూరు మిర్చి యార్డులో తేజ రకం ధర ఎంత ఉంది?',
      hi: 'आज गुंटूर मंडी में तेजा मिर्च का भाव क्या है?',
      kn: 'ಇಂದು ಗುಂಟೂರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಮೆಣಸಿನಕಾಯಿ ದರ ಎಷ್ಟು?',
      ta: 'இன்று குண்டூர் சந்தையில் மிளகாய் விலை என்ன?',
      mr: 'आज गुंटूर बाजारात मिरचीचा भाव काय आहे?',
      en: 'What is the price of Teja chilli in Guntur market today?'
    }
  },
  {
    id: 'cotton',
    name: {
      te: 'పత్తి',
      hi: 'कपास',
      kn: 'ಹತ್ತಿ',
      ta: 'பருத்தி',
      mr: 'कापूस',
      en: 'Cotton'
    },
    icon: '☁️',
    gradient: 'from-sky-500/20 via-blue-500/10 to-indigo-500/20 border-sky-500/30 text-sky-400',
    tagline: {
      te: 'గులాబీ పురుగు & MSP రేటు',
      hi: 'गुलाबी सुंडी व एमएसपी',
      kn: 'ಗುಲಾಬಿ ಕಾಯಿಕೊರಕ & ಬೆಲೆ',
      ta: 'இளஞ்சிவப்பு காய்ப்புழு',
      mr: 'बोंडअळी व हमीभाव',
      en: 'Pink Bollworm & MSP price'
    },
    defaultQuery: {
      te: 'పత్తిలో గులాబీ రంగు కాయతొలుచు పురుగు నివారణకు ఏ మందు పిచికారీ చేయాలి?',
      hi: 'कपास में गुलाबी सुंडी की रोकथाम के लिए कौन सी दवा डालें?',
      kn: 'ಹತ್ತಿ ಬೆಳೆಯಲ್ಲಿ ಗುಲಾಬಿ ಕಾಯಿಕೊರಕ ನಿಯಂತ್ರಣಕ್ಕೆ ಯಾವ ಔಷಧಿ ಸಿಂಪಡಿಸಬೇಕು?',
      ta: 'பருத்தியில் இளஞ்சிவப்பு காய்ப்புழுவை கட்டுப்படுத்த என்ன மருந்து தெளிக்க வேண்டும்?',
      mr: 'कापसावरील बोंडअळी नियंत्रणासाठी कोणते औषध फवारावे?',
      en: 'How to control pink bollworm in cotton crop?'
    }
  },
  {
    id: 'paddy',
    name: {
      te: 'వరి',
      hi: 'धान / चावल',
      kn: 'ಭತ್ತ',
      ta: 'நெல்',
      mr: 'भात',
      en: 'Paddy / Rice'
    },
    icon: '🌾',
    gradient: 'from-emerald-500/20 via-green-500/10 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    tagline: {
      te: 'అగ్గి తెగులు & యూరియా షెడ్యూల్',
      hi: 'झुलसा रोग व यूरिया शेड्यूल',
      kn: 'ಬೆಂಕಿ ರೋಗ & ಗೊಬ್ಬರ ಮಾಹಿತಿ',
      ta: 'குலை நோய் & உரம் மேலாண்மை',
      mr: 'करपा रोग व खतांचे नियोजन',
      en: 'Blast disease & fertilizer'
    },
    defaultQuery: {
      te: 'వరిలో అగ్గి తెగులు నివారణకు ట్రైసైక్లాజోల్ ఎంత మోతాదులో వాడాలి?',
      hi: 'धान में ब्लास्ट रोग के लिए ट्राईसाइक्लाजोल की कितनी मात्रा डालें?',
      kn: 'ಭತ್ತದ ಬೆಂಕಿ ರೋಗಕ್ಕೆ ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ ಎಷ್ಟು ಪ್ರಮಾಣದಲ್ಲಿ ಬಳಸಬೇಕು?',
      ta: 'நெல்லில் குலை நோய்க்கு ட்ரைசைக்ளஸோல் எவ்வளவு பயன்படுத்த வேண்டும்?',
      mr: 'भातावरील करपा रोगासाठी ट्रायसायक्लॅझोलचे प्रमाण किती असावे?',
      en: 'What is the dosage of Tricyclazole for blast disease in paddy?'
    }
  },
  {
    id: 'maize',
    name: {
      te: 'మొక్కజొన్న',
      hi: 'मक्का',
      kn: 'ಮೆಕ್ಕೆಜೋಳ',
      ta: 'மக்காச்சோளம்',
      mr: 'मका',
      en: 'Maize'
    },
    icon: '🌽',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-orange-500/20 border-amber-500/30 text-amber-400',
    tagline: {
      te: 'కత్తెర పురుగు & పౌల్ట్రీ ధర',
      hi: 'फॉल आर्मीवर्म व बाजारभाव',
      kn: 'ಲದ್ದಿ ಹುಳು & ಮಾರುಕಟ್ಟೆ ದರ',
      ta: 'படைப்புழு & சந்தை விலை',
      mr: 'लष्करी अळी व दर',
      en: 'Fall Armyworm & rates'
    },
    defaultQuery: {
      te: 'మొక్కజొన్న పంటలో కత్తెర పురుగు నివారణ పద్ధతులు తెలపండి?',
      hi: 'मक्का में फॉल आर्मीवर्म की रोकथाम कैसे करें?',
      kn: 'ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಲದ್ದಿ ಹುಳು ನಿಯಂತ್ರಣ ಹೇಗೆ?',
      ta: 'மக்காச்சோளத்தில் படைப்புழுவை கட்டுப்படுத்துவது எப்படி?',
      mr: 'मक्यावरील लष्करी अळीचे नियंत्रण कसे करावे?',
      en: 'How to manage Fall Armyworm in maize crop?'
    }
  },
  {
    id: 'groundnut',
    name: {
      te: 'వేరుశనగ',
      hi: 'मूंगफली',
      kn: 'ಕಡಲೆಕಾಯಿ',
      ta: 'வேர்க்கடலை',
      mr: 'भुईमूग',
      en: 'Groundnut'
    },
    icon: '🥜',
    gradient: 'from-yellow-600/20 via-amber-600/10 to-stone-500/20 border-yellow-600/30 text-yellow-500',
    tagline: {
      te: 'తిక్కా ఆకుమచ్చ & జిప్సం',
      hi: 'टिक्का रोग व जिप्सम',
      kn: 'ತಿಕ್ಕಾ ಚುಕ್ಕೆ ರೋಗ & ಜಿಪ್ಸಮ್',
      ta: 'டிக்கா இலைப்புள்ளி & ஜிப்சம்',
      mr: 'टिक्का रोग व जिप्सम',
      en: 'Tikka spot & Gypsum'
    },
    defaultQuery: {
      te: 'వేరుశనగలో తిక్కా ఆకుమచ్చ తెగులు నివారణకు ఏ మందు వాడాలి?',
      hi: 'मूंगफली में टिक्का रोग के लिए कौन सी दवा उपयोगी है?',
      kn: 'ಕಡಲೆಕಾಯಿಯಲ್ಲಿ ತಿಕ್ಕಾ ರೋಗಕ್ಕೆ ಯಾವ ಔಷಧಿ ಬಳಸಬೇಕು?',
      ta: 'வேர்க்கடலையில் டிக்கா நோய்க்கு என்ன மருந்து பயன்படுத்த வேண்டும்?',
      mr: 'भुईमुगावरील टिक्का रोगासाठी कोणते औषध फवारावे?',
      en: 'How to treat Tikka leaf spot disease in groundnut?'
    }
  }
];

interface CropVisualSelectorProps {
  selectedLanguage: string;
  onSelectCropQuery: (query: string) => void;
  disabled?: boolean;
}

export const CropVisualSelector: React.FC<CropVisualSelectorProps> = ({
  selectedLanguage,
  onSelectCropQuery,
  disabled
}) => {
  const lang = selectedLanguage in CROPS[0].name ? selectedLanguage : 'en';
  const t = getTranslation(selectedLanguage);

  return (
    <div className="my-5">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.cropSelectorTitle}</span>
        </span>
        <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline">
          {t.cropSelectorSubtitle}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {CROPS.map((crop) => (
          <button
            key={crop.id}
            onClick={() => onSelectCropQuery(crop.defaultQuery[lang] || crop.defaultQuery['en'])}
            disabled={disabled}
            className={`p-3 rounded-2xl bg-gradient-to-b ${crop.gradient} border hover:scale-[1.03] active:scale-95 transition-all text-left flex flex-col justify-between group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div>
              <span className="text-2xl mb-1.5 block filter drop-shadow">
                {crop.icon}
              </span>
              <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                {crop.name[lang] || crop.name['en']}
              </h4>
            </div>

            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 group-hover:text-slate-200">
              {crop.tagline[lang] || crop.tagline['en']}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

