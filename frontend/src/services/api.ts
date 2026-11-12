import {
  DashboardData,
  BenchmarkResult,
  ReminderItem,
  MandiRate,
  WeatherAdvisory
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  // Voice Interaction (STT -> LangGraph -> TTS)
  async sendVoiceQuery(audioBlob: Blob, preferredLanguage: string = 'indic-auto', sessionId?: string) {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'farmer_voice.wav');
    formData.append('preferred_language', preferredLanguage);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const res = await fetch(`${API_BASE_URL}/voice/interact`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Voice pipeline failed with status ${res.status}`);
    }

    return await res.json();
  },

  // Text Chat (LangGraph + TTS)
  async sendChatMessage(message: string, languageHint: string = 'te', sessionId?: string) {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        language_hint: languageHint,
        session_id: sessionId,
        generate_voice: true,
      }),
    });

    if (!res.ok) {
      throw new Error(`Chat failed with status ${res.status}`);
    }

    return await res.json();
  },

  // Reminders
  async getReminders(): Promise<ReminderItem[]> {
    const res = await fetch(`${API_BASE_URL}/farming/reminders`);
    return await res.json();
  },

  async completeReminder(id: number): Promise<ReminderItem> {
    const res = await fetch(`${API_BASE_URL}/farming/reminders/${id}/complete`, {
      method: 'PATCH',
    });
    return await res.json();
  },

  async createReminder(payload: { title: string; scheduled_date: string; crop?: string; description?: string }): Promise<ReminderItem> {
    const res = await fetch(`${API_BASE_URL}/farming/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  // Market & Weather
  async getMarketRates(): Promise<MandiRate[]> {
    const res = await fetch(`${API_BASE_URL}/farming/market`);
    return await res.json();
  },

  async getWeatherAdvisories(): Promise<WeatherAdvisory[]> {
    const res = await fetch(`${API_BASE_URL}/farming/weather`);
    return await res.json();
  },

  // Analytics & Evaluation
  async getDashboardMetrics(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard`);
    return await res.json();
  },

  async runNoisyBenchmark(): Promise<BenchmarkResult> {
    const res = await fetch(`${API_BASE_URL}/analytics/run-noisy-benchmark`, {
      method: 'POST',
    });
    return await res.json();
  },

  // System Health
  async getHealth() {
    const res = await fetch(`http://localhost:8000/api/health`);
    return await res.json();
  }
};
