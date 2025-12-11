export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  lantern_health: number;
  sparks: number;
  streak_days: number;
  subscription_status: 'free_trial' | 'active' | 'cancelled' | 'expired';
  trial_started_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UserWithStats extends User {
  stats: {
    mood_entries: number;
    journal_entries: number;
    signs_found: number;
    goals_created: number;
    goals_achieved: number;
    receipts_generated: number;
  };
}

export interface AudioLesson {
  id: string;
  step_number: number;
  title: string;
  description: string;
  audio_url: string;
  duration_seconds: number;
  is_premium: boolean;
  created_at: string;
}

export interface DailyMessage {
  id: string;
  content: string;
  category: string;
  is_active: boolean;
}

export interface Sign {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  is_active: boolean;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingConfig {
  monthly_price: number;
  annual_price: number;
  trial_days: number;
  currency: string;
}

export interface Analytics {
  users: {
    total: number;
    on_trial: number;
    active: number;
    expired: number;
    new_last_7_days: number;
  };
  engagement: {
    total_mood_entries: number;
    total_journal_entries: number;
    total_signs_found: number;
    total_goals: number;
    goals_achieved: number;
    total_receipts: number;
  };
  recent_activity: {
    mood_entries_7d: number;
    journal_entries_7d: number;
    signs_found_7d: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CardVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface CardVisibilitySettings {
  heroCarousel: CardVisibility;
  todayCard: CardVisibility;
  sparksRewards: CardVisibility;
  tribesCard: CardVisibility;
  latestWin: CardVisibility;
  manifestedWins: CardVisibility;
  personalGreeting: CardVisibility;
  exploreByIntention: CardVisibility;
  startYourJourney: CardVisibility;
  whatOthersLove: CardVisibility;
  editorsPicks: CardVisibility;
  userStories: CardVisibility;
  blogSection: CardVisibility;
  newsletterSignup: CardVisibility;
}

export interface AppSettings {
  free_trial_days: number;
  card_visibility: CardVisibilitySettings;
}
