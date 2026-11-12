import React, { useEffect, useState } from 'react';
import { MandiRate } from '../types';
import { api } from '../services/api';
import { TrendingUp, TrendingDown, Store, RefreshCw } from 'lucide-react';

export const MarketTicker: React.FC = () => {
  const [rates, setRates] = useState<MandiRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      setLoading(true);
      const data = await api.getMarketRates();
      setRates(data);
    } catch (err) {
      console.error('Failed to load market rates:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border-y border-slate-800/80 py-2.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
            <Store className="w-3.5 h-3.5" />
            <span>నేటి మార్కెట్ ధరలు (APMC Mandi)</span>
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center space-x-4">
            {rates.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 whitespace-nowrap text-xs flex-shrink-0 hover:border-emerald-500/40 transition-colors"
              >
                <span className="font-semibold text-white">{item.commodity_te}</span>
                <span className="text-slate-400 text-[11px]">({item.market.split(' ')[0]})</span>
                <span className="font-mono font-bold text-emerald-400">₹{item.modal_price.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">/క్వింటాల్</span>
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
