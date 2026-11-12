import React, { useEffect, useState } from 'react';
import { WeatherAdvisory } from '../types';
import { api } from '../services/api';
import { CloudSun, Droplets, Wind, AlertCircle, CheckCircle2 } from 'lucide-react';

export const WeatherCard: React.FC = () => {
  const [advisory, setAdvisory] = useState<WeatherAdvisory | null>(null);

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

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <CloudSun className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-white">{advisory.region}</span>
          <span className="text-xs text-slate-400 font-medium">వాతావరణం & పిచికారీ సలహా</span>
        </div>
        <div
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            isSuitable
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
              : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
          }`}
        >
          {isSuitable ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>పిచికారీకి అనుకూలం</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>పిచికారీ వాయిదా వేయండి</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center mb-2.5">
        <div>
          <span className="text-[11px] text-slate-400 block">ఉష్ణోగ్రత</span>
          <span className="text-base font-bold text-white font-mono">{advisory.temperature_c}°C</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block flex items-center justify-center space-x-1">
            <Droplets className="w-3 h-3 text-cyan-400 inline" /> తేమ
          </span>
          <span className="text-base font-bold text-cyan-300 font-mono">{advisory.humidity_pct}%</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block flex items-center justify-center space-x-1">
            <Wind className="w-3 h-3 text-slate-400 inline" /> గాలి
          </span>
          <span className="text-base font-bold text-slate-300 font-mono">{advisory.wind_speed_kmh} km/h</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {advisory.farming_advisory_te}
      </p>
    </div>
  );
};

