import React, { useState } from 'react';
import { ReminderItem } from '../types';
import { api } from '../services/api';
import { X, Calendar, Clock, CheckCircle2, Plus, Bell, Sparkles } from 'lucide-react';

interface RemindersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: ReminderItem[];
  onRefresh: () => void;
}

export const RemindersDrawer: React.FC<RemindersDrawerProps> = ({
  isOpen,
  onClose,
  reminders,
  onRefresh,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [crop, setCrop] = useState('');
  const [scheduledDate, setScheduledDate] = useState('రేపు (Tomorrow)');

  if (!isOpen) return null;

  const handleComplete = async (id: number) => {
    try {
      await api.completeReminder(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    try {
      await api.createReminder({
        title,
        crop: crop || 'సాధారణ పంట',
        scheduled_date: scheduledDate,
      });
      setTitle('');
      setCrop('');
      setShowAddForm(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">రైతు రిమైండర్లు & పనులు</h3>
              <p className="text-xs text-slate-400">Autonomous Task & Reminder Ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Action to Toggle New Form */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              నమోదైన పనులు ({reminders.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>కొత్త రిమైండర్</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">పని వివరాలు (Task Title)</label>
                <input
                  type="text"
                  placeholder="ఉదా: పొలంలో ఎరువులు వేయాలి"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">పంట (Crop)</label>
                <input
                  type="text"
                  placeholder="ఉదా: టమాటా / వరి / పత్తి"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">సమయం (Date & Time)</label>
                <input
                  type="text"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  రద్దు
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950"
                >
                  సేవ్ చేయండి
                </button>
              </div>
            </form>
          )}

          {/* Reminders List */}
          {reminders.map((rem) => {
            const isDone = rem.status === 'completed';
            return (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                    : 'bg-slate-800/90 border-slate-700 shadow-md hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                      {rem.title}
                    </h4>
                    {rem.crop && (
                      <span className="text-[11px] font-semibold text-emerald-400 block mt-0.5">
                        🌱 పంట: {rem.crop}
                      </span>
                    )}
                  </div>

                  {!isDone ? (
                    <button
                      onClick={() => handleComplete(rem.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center space-x-1"
                      title="పూర్తయిందిగా గుర్తించు"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>పూర్తయింది</span>
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-400">
                      పూర్తయింది ✅
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{rem.scheduled_date}</span>
                  </div>
                  {rem.scheduled_time && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{rem.scheduled_time}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
};
