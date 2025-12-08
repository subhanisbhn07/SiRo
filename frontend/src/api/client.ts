const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('signroad_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('signroad_token', token);
    } else {
      localStorage.removeItem('signroad_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  }

  async signup(email: string, password: string, name?: string) {
    const data = await this.request<{ access_token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.request<import('../types').User>('/api/auth/me');
  }

  async completeOnboarding(name: string, intention: string) {
    return this.request<import('../types').User>('/api/user/onboarding', {
      method: 'POST',
      body: JSON.stringify({ name, intention }),
    });
  }

  async advanceDay() {
    return this.request<import('../types').User>('/api/user/advance-day', {
      method: 'POST',
    });
  }

  async getAvailableSigns() {
    return this.request<import('../types').Sign[]>('/api/signs/available');
  }

  async getAllSigns() {
    return this.request<import('../types').Sign[]>('/api/signs');
  }

  async logSign(signId: string, note?: string, locationType?: string) {
    return this.request<import('../types').SignLog>('/api/signs/log', {
      method: 'POST',
      body: JSON.stringify({ sign_id: signId, note, location_type: locationType }),
    });
  }

  async getMySignLogs() {
    return this.request<import('../types').SignLog[]>('/api/signs/logs/me');
  }

  async generateReceipt(signId: string, context?: { time_of_day?: string; location_type?: string; user_streak?: number }) {
    return this.request<import('../types').UniverseReceipt>('/api/signs/receipt', {
      method: 'POST',
      body: JSON.stringify({ sign_id: signId, context }),
    });
  }

  async getTodayMeditation() {
    return this.request<import('../types').Meditation>('/api/meditations/today');
  }

  async getAllMeditations() {
    return this.request<import('../types').Meditation[]>('/api/meditations');
  }

  async completeMeditation(meditationId: string, durationSeconds: number) {
    return this.request<import('../types').MeditationLog>('/api/meditations/complete', {
      method: 'POST',
      body: JSON.stringify({ meditation_id: meditationId, duration_seconds: durationSeconds }),
    });
  }

  async getMyMeditationLogs() {
    return this.request<import('../types').MeditationLog[]>('/api/meditations/logs/me');
  }

  async getAllSounds() {
    return this.request<import('../types').AmbientSound[]>('/api/sounds');
  }

  async joinTribe() {
    return this.request<import('../types').TribeStats>('/api/tribes/join', {
      method: 'POST',
    });
  }

  async getTribeStats() {
    return this.request<import('../types').TribeStats>('/api/tribes/stats');
  }

  async getDailyMessage() {
    return this.request<import('../types').DailyMessage>('/api/daily-message');
  }

  logout() {
    this.setToken(null);
  }
}

export const api = new ApiClient();
