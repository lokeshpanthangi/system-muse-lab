import { apiClient, TokenManager } from '../lib/apiClient';
import type {
  User,
  UserSignup,
  UserLogin,
  TokenResponse,
} from '../types/api';

export const authService = {
  // Sign up a new user
  async signup(data: UserSignup): Promise<{ message: string; user: User }> {
    const response = await apiClient.post<{ message: string; user: User }>(
      '/users/signup',
      data
    );
    return response;
  },

  // Login user
  async login(email: string, password: string): Promise<TokenResponse> {
    // OAuth2 requires form data format
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data: TokenResponse = await response.json();
    
    // Store tokens and user info
    TokenManager.setTokens(data.access_token, data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    const response = await apiClient.post<{ access_token: string; token_type: string; expires_in: number }>(
      '/users/refresh',
      { refresh_token: refreshToken }
    );
    
    // Update access token
    localStorage.setItem('access_token', response.access_token);
    
    return response;
  },

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    localStorage.setItem('user', JSON.stringify(response));
    return response;
  },

  // Logout
  logout(): void {
    TokenManager.clearTokens();
  },

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }
};
