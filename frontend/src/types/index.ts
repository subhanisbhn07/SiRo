export type SignRarity = 'whispered' | 'spoken' | 'shouted' | 'thundered' | 'cosmos_aligned';

export type SubscriptionStatus = 'trial' | 'active' | 'canceled' | 'expired';

export interface User {
  id: string;
  email: string;
  name?: string;
  intention?: string;
  current_day: number;
  lantern_health: number;
  sparks: number;
  streak_days: number;
  subscription_status: SubscriptionStatus;
  trial_end_date?: string;
  tribe_id?: string;
  onboarding_completed: boolean;
  created_at: string;
  last_meditation_date?: string;
}

export interface Sign {
  id: string;
  name: string;
  emoji: string;
  description: string;
  meaning: string;
  rarity: SignRarity;
  unlock_day: number;
  category: string;
}

export interface SignLog {
  id: string;
  user_id: string;
  sign_id: string;
  found_at: string;
  note?: string;
  location_type?: string;
  sparks_earned: number;
}

export interface UniverseReceipt {
  sign_name: string;
  sign_emoji: string;
  rarity: SignRarity;
  found_at: string;
  probability_display: string;
  user_streak: number;
  receipt_id: string;
}

export interface Meditation {
  id: string;
  day: number;
  title: string;
  description: string;
  duration_minutes: number;
  audio_url?: string;
  script: string;
  is_free: boolean;
}

export interface MeditationLog {
  id: string;
  user_id: string;
  meditation_id: string;
  completed_at: string;
  duration_seconds: number;
  sparks_earned: number;
}

export interface AmbientSound {
  id: string;
  name: string;
  description: string;
  audio_url: string;
  category: string;
  is_downloadable: boolean;
}

export interface TribeStats {
  tribe_id: string;
  tribe_name: string;
  total_members: number;
  meditated_today: number;
  member_streaks: number[];
}

export interface DailyMessage {
  message: string;
  category: string;
  generated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}
