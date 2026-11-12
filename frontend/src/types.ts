export interface AgentTraceStep {
  agent: string;
  action: string;
  detail: string;
  timestamp_ms: number;
}

export interface SourceCitation {
  id: string;
  crop: string;
  issue: string;
  source_organization: string;
  verified_advisory_id: string;
  confidence_score: number;
  relevance_score?: number;
}

export interface TelemetryBreakdown {
  stt_provider?: string;
  tts_provider?: string;
  latency_stt_ms?: number;
  latency_agent_ms?: number;
  latency_tts_ms?: number;
  total_latency_ms: number;
}

export interface ChatMessage {
  id: string;
  sender: 'farmer' | 'rythum';
  text: string;
  detected_language?: string;
  intent?: string;
  audio_base64?: string;
  agent_trace?: AgentTraceStep[];
  sources?: SourceCitation[];
  telemetry?: TelemetryBreakdown;
  timestamp: string;
}

export interface ReminderItem {
  id: number;
  title: string;
  description?: string;
  crop?: string;
  scheduled_date: string;
  scheduled_time?: string;
  status: 'pending' | 'completed' | 'cancelled';
  is_confirmed: boolean;
  language: string;
  created_at: string;
}

export interface MandiRate {
  commodity: string;
  commodity_te: string;
  market: string;
  state: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  price_per_kg: number;
  trend: string;
  recommendation_te: string;
  recommendation_en: string;
  updated_at: string;
}

export interface WeatherAdvisory {
  region: string;
  state: string;
  temperature_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  condition: string;
  rain_forecast_next_3_days: string;
  spray_suitability: string;
  farming_advisory_te: string;
  farming_advisory_en: string;
}

export interface DashboardData {
  kpis: {
    total_queries: number;
    total_tasks_automated: number;
    tasks_completed: number;
    avg_latency_ms: number;
    telugu_speech_accuracy: string;
    system_status: string;
  };
  language_distribution: Array<{
    language: string;
    count: number;
    percentage: number;
  }>;
  agent_distribution: Array<{
    agent: string;
    invocations: number;
    pct: number;
  }>;
  stt_performance: {
    overall_wer: string;
    overall_accuracy: string;
    avg_stt_latency_ms: number;
    avg_llm_latency_ms: number;
    avg_tts_latency_ms: number;
    total_turnaround_latency_ms: number;
    gnani_stt_model: string;
    gnani_tts_model: string;
  };
  recent_activity: any[];
}

export interface BenchmarkResult {
  total_samples: number;
  average_wer: number;
  overall_accuracy_pct: number;
  benchmark_results: Array<{
    id: string;
    condition: string;
    noise_type: string;
    snr_db: number;
    ground_truth: string;
    transcription: string;
    wer: number;
    accuracy_pct: number;
    language: string;
  }>;
  timestamp: string;
  status: string;
}
