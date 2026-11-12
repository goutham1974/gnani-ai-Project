import React from 'react';
import { Sparkles, MessageSquareHeart } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  selectedLanguage: string;
  disabled?: boolean;
}

interface LocalizedPrompt {
  category: Record<string, string>;
  text: Record<string, string>;
  badgeColor: string;
}

const PROMPTS: LocalizedPrompt[] = [
  {
    category: {
      te: 'పరిచయం / సంభాషణ (Greeting)',
      hi: 'अभिवादन / बातचीत (Greeting)',
      kn: 'ಶುಭಾಶಯ / ಮಾತುಕತೆ (Greeting)',
      ta: 'வாழ்த்துக்கள் / உரையாடல் (Greeting)',
      mr: 'संभाषण / अभिवादन (Greeting)',
      en: 'Conversation / Greeting'
    },
    text: {
      te: 'నమస్కారం, మీరు ఎలా ఉన్నారు? నాకు ఏం సహాయం చేయగలరు?',
      hi: 'नमस्ते, आप कैसे हैं? आप मेरी क्या मदद कर सकते हैं?',
      kn: 'ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಾ? ನನಗೆ ಏನು ಸಹಾಯ ಮಾಡಬಲ್ಲಿರಿ?',
      ta: 'வணக்கம், எப்படி இருக்கிறீர்கள்? எனக்கு என்ன உதவி செய்வீர்கள்?',
      mr: 'नमस्कार, तुम्ही कसे आहात? मला काय मदत करू शकता?',
      en: 'Hi, how are you? What can you do for my farm?'
    },
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40'
  },
  {
    category: {
      te: 'పంట తెగులు (Crop Disease)',
      hi: 'फसल रोग (Crop Disease)',
      kn: 'ಬೆಳೆ ರೋಗ (Crop Disease)',
      ta: 'பயிர் நோய் (Crop Disease)',
      mr: 'पीक रोग (Crop Disease)',
      en: 'Crop Disease Diagnosis'
    },
    text: {
      te: 'నా టమాటా పంటకు ఆకులు పసుపు రంగులోకి మారుతున్నాయి, ఏం చేయాలి?',
      hi: 'मेरे टमाटर के पौधे की पत्तियाँ पीली पड़ रही हैं, क्या करूँ?',
      kn: 'ನನ್ನ ಟೊಮೆಟೊ ಬೆಳೆಯ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿವೆ, ಪರಿಹಾರವೇನು?',
      ta: 'என் தக்காளி பயிரின் இலைகள் மஞ்சள் நிறமாக மாறுகின்றன, என்ன செய்வது?',
      mr: 'माझ्या टोमॅटोच्या पिकाची पाने पिवळी पडत आहेत, काय करू?',
      en: 'My tomato crop leaves are turning yellow. What should I do?'
    },
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/40'
  },
  {
    category: {
      te: 'స్వయంప్రతిపత్తి టాస్క్ (Autonomous Reminder)',
      hi: 'टास्क रिमाइंडर (Autonomous Task)',
      kn: 'ಕೃಷಿ ಜ್ಞಾಪನೆ (Task Reminder)',
      ta: 'நினைவூட்டல் (Task Reminder)',
      mr: 'काम आठवण (Task Reminder)',
      en: 'Autonomous Task Reminder'
    },
    text: {
      te: 'రేపు నాకు పొలంలో ఎరువులు వేయాలి. నాకు గుర్తు చేస్తావా?',
      hi: 'कल खेत में यूरिया डालना है, मुझे सुबह आठ बजे याद दिला देना।',
      kn: 'ನಾಳೆ ಜಮೀನಿನಲ್ಲಿ ರಸಗೊಬ್ಬರ ಹಾಕಬೇಕು, ನನಗೆ ನೆನಪಿಸು.',
      ta: 'நாளை வயலில் உரம் போட வேண்டும், எனக்கு நினைவூட்டு.',
      mr: 'उद्या शेतात खत टाकायचे आहे, मला सकाळी आठ वाजता आठवण करा.',
      en: 'Remind me to apply fertilizer in the field tomorrow morning.'
    },
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
  },
  {
    category: {
      te: 'మార్కెట్ ధరలు (Mandi Rates)',
      hi: 'मंडी भाव (Mandi Rates)',
      kn: 'ಮಾರುಕಟ್ಟೆ ದರ (Mandi Rates)',
      ta: 'சந்தை விலை (Mandi Rates)',
      mr: 'बाजारभाव (Mandi Rates)',
      en: 'Mandi Market Prices'
    },
    text: {
      te: 'ఈరోజు గుంటూరు మిర్చి మార్కెట్లో తేజ రకం ధర ఎంత ఉంది?',
      hi: 'आज गुंटूर मंडी में तेजा मिर्च का भाव क्या है?',
      kn: 'ಇಂದು ಗುಂಟೂರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಮೆಣಸಿನಕಾಯಿ ದರ ಎಷ್ಟು?',
      ta: 'இன்று குண்டூர் சந்தையில் மிளகாய் விலை என்ன?',
      mr: 'आज गुंटूर बाजारात मिरचीचा भाव काय आहे?',
      en: 'What is the price of Teja chilli in Guntur mandi today?'
    },
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/40'
  },
  {
    category: {
      te: 'వాతావరణం & పిచికారీ (Weather & Spray)',
      hi: 'मौसम व छिड़काव (Weather & Spray)',
      kn: 'ಹವಾಮಾನ & ಸಿಂಪರಣೆ (Weather & Spray)',
      ta: 'வானிலை & தெளிப்பு (Weather & Spray)',
      mr: 'हवामान व फवारणी (Weather & Spray)',
      en: 'Agri-Weather & Spraying'
    },
    text: {
      te: 'వచ్చే 3 రోజుల్లో వర్షం పడుతుందా? మందులు పిచికారీ చేయవచ్చా?',
      hi: 'क्या अगले 3 दिनों में बारिश होगी? क्या कीटनाशक छिड़काव कर सकते हैं?',
      kn: 'ಮುಂದಿನ 3 ದಿನಗಳಲ್ಲಿ ಮಳೆ ಬರುತ್ತದೆಯೇ? ಔಷಧಿ ಸಿಂಪಡಿಸಬಹುದೇ?',
      ta: 'அடுத்த 3 நாட்களில் மழை பெய்யுமா? மருந்து தெளிக்கலாமா?',
      mr: 'पुढील ३ दिवसात पाऊस पडेल का? फवारणी करणे योग्य आहे का?',
      en: 'Will it rain in the next 3 days? Is it safe to spray pesticides?'
    },
    badgeColor: 'border-rose-500/40 text-rose-300 bg-rose-950/40'
  },
  {
    category: {
      te: 'కోడ్-మిక్సింగ్ (Code-Mixed Indian)',
      hi: 'कोड-मिक्सिंग (Code-Mixed)',
      kn: 'ಕೋಡ್-ಮಿಕ್ಸಿಂಗ್ (Code-Mixed)',
      ta: 'கலப்பு மொழி (Code-Mixed)',
      mr: 'मिश्र भाषा (Code-Mixed)',
      en: 'Code-Mixed Indic Dialogue'
    },
    text: {
      te: 'Anna, naa tomato crop ki leaf infection undi. What should I do?',
      hi: 'Bhaiya, mere tomato crop me leaf problem hai, what should I do?',
      kn: 'Anna, nanna tomato crop ge leaf problem ide, what to do?',
      ta: 'Anna, en tomato crop ku leaf infection irukku, what should I do?',
      mr: 'Bhau, mazya tomato crop la infection zala ahe, what should I do?',
      en: 'Anna, naa tomato crop ki leaf infection undi. What should I do?'
    },
    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-950/40'
  }
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  onSelectPrompt,
  selectedLanguage,
  disabled
}) => {
  const lang = selectedLanguage in PROMPTS[0].text ? selectedLanguage : 'en';

  const headingMap: Record<string, string> = {
    te: 'త్వరిత సంభాషణ సూచనలు (నొక్కండి):',
    hi: 'त्वरित प्रश्न सुझाव (क्लिक करें):',
    kn: 'ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳ ಪಟ್ಟಿ (ಕ್ಲಿಕ್ ಮಾಡಿ):',
    ta: 'விரைவு கேள்வி பரிந்துரைகள் (கிளிக் செய்க):',
    mr: 'त्वरित प्रश्न सूचना (क्लिक करा):',
    en: 'Quick Voice Suggestions (Tap to Ask):'
  };

  return (
    <div className="mt-4">
      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 mb-2">
        <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-400" />
        <span>{headingMap[lang] || headingMap['en']}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(p.text[lang] || p.text['en'])}
            disabled={disabled}
            className="flex flex-col text-left p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 transition-all text-xs group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span className={`inline-block w-fit px-2 py-0.5 rounded-lg text-[10px] font-bold border mb-1.5 ${p.badgeColor}`}>
              {p.category[lang] || p.category['en']}
            </span>
            <span className="text-slate-200 group-hover:text-white font-medium leading-relaxed">
              "{p.text[lang] || p.text['en']}"
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
