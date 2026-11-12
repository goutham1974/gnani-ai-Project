import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, disabled }) => {
  const prompts = [
    {
      label_te: 'నా టమాటా పంటకు ఆకులు పసుపు రంగులోకి మారుతున్నాయి. ఏం చేయాలి?',
      category: 'Crop Disease / తెగులు',
      badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/40',
    },
    {
      label_te: 'రేపు నాకు పొలంలో ఎరువులు వేయాలి. నాకు గుర్తు చేస్తావా?',
      category: 'Autonomous Reminder / టాస్క్',
      badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
    },
    {
      label_te: 'Anna, naa tomato crop ki leaf infection undi. What should I do?',
      category: 'Code-Mixed Telugu-English',
      badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40',
    },
    {
      label_te: 'ఈరోజు గుంటూరు మిర్చి మార్కెట్లో తేజ రకం ధర ఎంత ఉంది?',
      category: 'Mandi Rates / మార్కెట్',
      badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/40',
    },
    {
      label_te: 'వరిలో అగ్గి తెగులు నివారణకు ఏ మందు పిచికారీ చేయాలి?',
      category: 'Paddy Advisory / వరి సలహా',
      badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-950/40',
    },
    {
      label_te: 'వచ్చే 3 రోజుల్లో వర్షం పడుతుందా? మందులు కొట్టవచ్చా?',
      category: 'Agri Weather / వాతావరణం',
      badgeColor: 'border-rose-500/40 text-rose-300 bg-rose-950/40',
    }
  ];

  return (
    <div className="mt-4">
      <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>రైతులు అడిగే ముఖ్యమైన ప్రశ్నలు (త్వరిత పరీక్ష కోసం):</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(p.label_te)}
            disabled={disabled}
            className="flex flex-col text-left p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 transition-all text-xs group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`inline-block w-fit px-2 py-0.5 rounded text-[10px] font-bold border mb-1.5 ${p.badgeColor}`}>
              {p.category}
            </span>
            <span className="text-slate-200 group-hover:text-white font-medium leading-relaxed">
              "{p.label_te}"
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
