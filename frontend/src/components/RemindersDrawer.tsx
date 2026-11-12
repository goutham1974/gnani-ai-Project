import React, { useState } from 'react';
import { ReminderItem } from '../types';
import { api } from '../services/api';
import { X, Calendar, CheckCircle2, Plus, Bell } from 'lucide-react';
import { getTranslation } from '../i18n';

interface RemindersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: ReminderItem[];
  onRefresh: () => void;
  selectedLanguage?: string;
}

export const RemindersDrawer: React.FC<RemindersDrawerProps> = ({
  isOpen,
  onClose,
  reminders,
  onRefresh,
  selectedLanguage = 'te',
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [crop, setCrop] = useState('');
  const [scheduledDate, setScheduledDate] = useState('Tomorrow 08:00 AM');
  const t = getTranslation(selectedLanguage);

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
        crop: crop || 'General Crop',
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
      <div className="bg-slate-900 border-l border-emerald-900/40 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.remindersTitle}</h3>
              <p className="text-xs text-slate-400">{t.remindersSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Action to Toggle New Form */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.scheduledTasksCount} ({reminders.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newReminderBtn}</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-slate-800/90 border border-emerald-900/40 space-y-3 shadow-lg">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">{t.taskTitleLabel}</label>
                <input
                  type="text"
                  placeholder={t.taskTitlePlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">{t.cropLabel}</label>
                <input
                  type="text"
                  placeholder={t.cropPlaceholder}
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">{t.dateLabel}</label>
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  {t.saveTaskBtn}
                </button>
              </div>
            </form>
          )}

          {/* List of Reminders */}
          {reminders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
              <p className="text-xs max-w-xs mx-auto leading-relaxed">{t.noReminders}</p>
            </div>
          ) : (
            reminders.map((rem) => {
              const isCompleted = rem.status === 'completed';
              return (
                <div
                  key={rem.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-800/80 border-slate-700/80 shadow-md hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">{rem.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isCompleted ? t.completedBadge : t.pendingBadge}
                        </span>
                      </div>
                      {rem.crop && (
                        <p className="text-xs text-emerald-400 font-medium mt-1">🌱 {rem.crop}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>{rem.scheduled_date}</span>
                      </p>
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => handleComplete(rem.id)}
                        className="p-1.5 rounded-xl bg-slate-700/60 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors shadow-sm"
                        title={t.markDoneBtn}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

        </div>

      </div>
    </div>
  );
};
