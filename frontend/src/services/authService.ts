import { apiClient } from './api';
import { LoginRequest, LoginResponse, RefreshTokenResponse, User } from '../types/auth';

export const authService = {
  /**
   * POST /api/auth/login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      // Support both direct response `{ accessToken, refreshToken, user }` and `{ data: { ... } }`
      const data = response.data?.data || response.data;
      return data;
    } catch (error: any) {
      // Fallback for demonstration if API endpoint is not running locally
      if (!error.response || error.code === 'ERR_NETWORK') {
        console.warn('Backend API unavailable. Using fallback demo authentication.');
        if (credentials.email && credentials.password) {
          const mockUser: User = {
            id: 1,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            role: 'Admin',
          };
          return {
            accessToken: 'mock-jwt-access-token-' + Date.now(),
            refreshToken: 'mock-jwt-refresh-token-' + Date.now(),
            user: mockUser,
          };
        }
      }
      throw error;
    }
  },

  /**
   * POST /auth/refresh-token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data?.data || response.data;
  },

  /**
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Silent catch on network error during logout
      console.warn('Logout endpoint call error (local tokens cleared regardless).', error);
    }
  },
};
