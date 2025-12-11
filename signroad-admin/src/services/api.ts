import type { 
  User, 
  UserWithStats, 
  AudioLesson, 
  DailyMessage, 
  Sign, 
  Page, 
  PricingConfig, 
  Analytics,
  AuthResponse 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setAccessToken(response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  async getAnalytics(): Promise<Analytics> {
    return this.request<Analytics>('/api/admin/analytics');
  }

  async getUsers(search?: string): Promise<{ users: User[]; total: number }> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/api/admin/users${params}`);
  }

  async getUser(id: string): Promise<UserWithStats> {
    return this.request(`/api/admin/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<{ user: User }> {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getLessons(): Promise<{ lessons: AudioLesson[] }> {
    return this.request('/api/admin/lessons');
  }

  async createLesson(data: Omit<AudioLesson, 'id' | 'created_at'>): Promise<{ lesson: AudioLesson }> {
    return this.request('/api/admin/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLesson(id: string, data: Partial<AudioLesson>): Promise<{ lesson: AudioLesson }> {
    return this.request(`/api/admin/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLesson(id: string): Promise<void> {
    return this.request(`/api/admin/lessons/${id}`, { method: 'DELETE' });
  }

  async getMessages(): Promise<{ messages: DailyMessage[] }> {
    return this.request('/api/admin/messages');
  }

  async createMessage(data: Omit<DailyMessage, 'id'>): Promise<{ message: DailyMessage }> {
    return this.request('/api/admin/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMessage(id: string, data: Partial<DailyMessage>): Promise<{ message: DailyMessage }> {
    return this.request(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMessage(id: string): Promise<void> {
    return this.request(`/api/admin/messages/${id}`, { method: 'DELETE' });
  }

  async getSigns(): Promise<{ signs: Sign[] }> {
    return this.request('/api/admin/signs');
  }

  async createSign(data: Omit<Sign, 'id'>): Promise<{ sign: Sign }> {
    return this.request('/api/admin/signs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSign(id: string, data: Partial<Sign>): Promise<{ sign: Sign }> {
    return this.request(`/api/admin/signs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSign(id: string): Promise<void> {
    return this.request(`/api/admin/signs/${id}`, { method: 'DELETE' });
  }

  async getPages(): Promise<{ pages: Page[] }> {
    return this.request('/api/admin/pages');
  }

  async createPage(data: Omit<Page, 'id' | 'created_at' | 'updated_at'>): Promise<{ page: Page }> {
    return this.request('/api/admin/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePage(id: string, data: Partial<Page>): Promise<{ page: Page }> {
    return this.request(`/api/admin/pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePage(id: string): Promise<void> {
    return this.request(`/api/admin/pages/${id}`, { method: 'DELETE' });
  }

  async getPricing(): Promise<{ pricing: PricingConfig }> {
    return this.request('/api/admin/pricing');
  }

  async updatePricing(data: Partial<PricingConfig>): Promise<{ pricing: PricingConfig }> {
    return this.request('/api/admin/pricing', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
