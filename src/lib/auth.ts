// Django authentication utilities

const API_BASE_URL = 'http://localhost:3001/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  referral_code: string;
}

interface AuthResponse {
  user: User;
  message: string;
}

class AuthClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for session auth
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async register(email: string, password: string, fullName: string = ''): Promise<AuthResponse> {
    const response = await this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    // Django uses session auth, so we don't need to store a token
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout/', {
      method: 'POST',
    });
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getProfile(): Promise<any> {
    return this.request('/auth/profile/');
  }

  async getSession(): Promise<{ user: User } | null> {
    try {
      const profile = await this.getProfile();
      return { user: profile.user };
    } catch {
      return null;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return this.token;
  }
}

export const auth = new AuthClient();