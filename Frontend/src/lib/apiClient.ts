// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Token management
export const TokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    return !!TokenManager.getAccessToken();
  }
};

// API Client with automatic token refresh
class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      TokenManager.clearTokens();
      window.location.href = '/auth';
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const newAccessToken = data.access_token;
      
      // Update access token (keep existing refresh token)
      localStorage.setItem('access_token', newAccessToken);
      
      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      TokenManager.clearTokens();
      window.location.href = '/auth';
      return null;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const accessToken = TokenManager.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (accessToken && !endpoint.includes('/login') && !endpoint.includes('/signup') && !endpoint.includes('/refresh')) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 - Token expired
      if (response.status === 401 && !endpoint.includes('/refresh')) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;

          if (newToken) {
            this.onTokenRefreshed(newToken);
            // Retry original request with new token
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, {
              ...options,
              headers,
            });
          } else {
            throw new Error('Authentication failed');
          }
        } else {
          // Wait for token refresh to complete
          return new Promise((resolve, reject) => {
            this.subscribeTokenRefresh(async (token: string) => {
              headers['Authorization'] = `Bearer ${token}`;
              try {
                const retryResponse = await fetch(url, {
                  ...options,
                  headers,
                });
                const data = await retryResponse.json();
                resolve(data as T);
              } catch (error) {
                reject(error);
              }
            });
          });
        }
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const accessToken = TokenManager.getAccessToken();

    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
