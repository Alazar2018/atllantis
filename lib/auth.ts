// Secure token storage utilities
export class SecureTokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'atl_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'atl_refresh_token';
  private static readonly USER_KEY = 'atl_user';

  // Store tokens securely
  static setTokens(accessToken: string, refreshToken: string, user: any) {
    try {
      // Encrypt tokens before storing (basic obfuscation)
      const encryptedAccessToken = btoa(accessToken);
      const encryptedRefreshToken = btoa(refreshToken);
      const encryptedUser = btoa(JSON.stringify(user));

      localStorage.setItem(this.ACCESS_TOKEN_KEY, encryptedAccessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedRefreshToken);
      localStorage.setItem(this.USER_KEY, encryptedUser);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  // Retrieve tokens securely
  static getTokens() {
    try {
      const encryptedAccessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      const encryptedRefreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      const encryptedUser = localStorage.getItem(this.USER_KEY);

      if (!encryptedAccessToken || !encryptedRefreshToken || !encryptedUser) {
        return null;
      }

      const accessToken = atob(encryptedAccessToken);
      const refreshToken = atob(encryptedRefreshToken);
      const user = JSON.parse(atob(encryptedUser));

      return { accessToken, refreshToken, user };
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      this.clearTokens();
      return null;
    }
  }

  // Clear all tokens
  static clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;

    try {
      // Check token expiration
      const tokenData = JSON.parse(atob(tokens.accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return tokenData.exp > currentTime;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  // Get current user
  static getCurrentUser() {
    const tokens = this.getTokens();
    return tokens?.user || null;
  }

  // Get access token
  static getAccessToken() {
    const tokens = this.getTokens();
    return tokens?.accessToken || null;
  }

  // Get refresh token
  static getRefreshToken() {
    const tokens = this.getTokens();
    return tokens?.refreshToken || null;
  }
}

// API client with automatic token handling
export class SecureApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const accessToken = SecureTokenStorage.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers if they exist
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401) {
      const refreshToken = SecureTokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshResponse = await fetch('/api/admin/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            SecureTokenStorage.setTokens(
              data.accessToken,
              data.refreshToken,
              data.user
            );

            // Retry original request with new token
            headers.Authorization = `Bearer ${data.accessToken}`;
            return fetch(url, {
              ...options,
              headers,
            });
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }

      // Refresh failed, clear tokens and redirect to login
      SecureTokenStorage.clearTokens();
      window.location.href = '/admin/login';
      throw new Error('Authentication failed');
    }

    return response;
  }

  async get(endpoint: string) {
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }
}
