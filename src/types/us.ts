export interface MessageStatsMeta {
  contact: string;
  generated_at: string;
  message_count: number;
  real_messages: number;
  reactions: number;
  with_attachments: number;
  first_message: string;
  last_message: string;
  days_span: number;
}

export interface MessageStatsTotals {
  me: number;
  her: number;
  words_me: number;
  words_her: number;
}

export interface MessageStatsLength {
  mean: number;
  median: number;
  max: number;
}

export interface LatencyBucket {
  label: string;
  count: number;
}

export interface MessageStatsLatency {
  median_sec: number;
  mean_sec: number;
  p25_sec: number;
  p75_sec: number;
  n: number;
  buckets: LatencyBucket[];
}

export interface MonthPoint {
  month: string;
  me: number;
  her: number;
}

export interface HeatmapCell {
  weekday: number;
  hour: number;
  count: number;
}

export interface DistinctiveWord {
  word: string;
  ratio: number;
  me: number;
  her: number;
}

export interface SharedWord {
  word: string;
  me: number;
  her: number;
  total: number;
}

export interface MessageStatsStreaks {
  longest_days: number;
  streak_ended: string;
  active_days: number;
  silent_days: number;
  longest_gap_days: number;
  gap_from: string | null;
  gap_to: string | null;
  busiest_days: { date: string; count: number }[];
  avg_per_active_day: number;
}

export interface MessageStatsEmoji {
  total: Record<string, number>;
  distinct: Record<string, number>;
  messages_with_emoji: Record<string, number>;
  game_grids: Record<string, number>;
}

export interface MessageStatsAttachments {
  by_type: [string, number][];
  by_sender: Record<string, number>;
  total: number;
}

/**
 * The full aggregate payload produced on Andrew's machine by
 * `imessage-export/analyze.py` and uploaded with `pnpm upload:message-stats`.
 * Counts only — no message text is ever stored here.
 */
export interface MessageStats {
  meta: MessageStatsMeta;
  totals: MessageStatsTotals;
  words: Record<string, [string, number][]>;
  emoji: Record<string, [string, number][]>;
  emoji_stats: MessageStatsEmoji;
  phrases: Record<string, Record<string, number>>;
  phrase_order: string[];
  domains: [string, number][];
  distinctive: { me: DistinctiveWord[]; her: DistinctiveWord[] };
  shared_words: SharedWord[];
  by_month: MonthPoint[];
  heatmap: HeatmapCell[];
  by_hour: Record<string, number[]>;
  by_weekday: Record<string, number[]>;
  length_by_month: MonthPoint[];
  length: Record<string, MessageStatsLength>;
  streaks: MessageStatsStreaks;
  latency: Record<string, MessageStatsLatency>;
  starts: Record<string, number>;
  reactions: { kind: string; me: number; her: number }[];
  attachments: MessageStatsAttachments;
}
