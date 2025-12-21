import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1'
  : 'https://api.yourdomain.com/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh or logout
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      // Navigate to login (handled by navigation state)
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  signup: async (data: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    club_code?: string;
  }) => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  loginWithApple: async (identityToken: string) => {
    const response = await apiClient.post('/auth/apple', { identity_token: identityToken });
    return response.data;
  },

  loginWithGoogle: async (idToken: string) => {
    const response = await apiClient.post('/auth/google', { id_token: idToken });
    return response.data;
  },
};

// ============================================================================
// HEALTH API
// ============================================================================

export const healthAPI = {
  syncHealthData: async (data: {
    date: string;
    active_calories: number;
    steps?: number;
    workout_minutes?: number;
    source: string;
    timezone: string;
    device_info?: any;
  }) => {
    const response = await apiClient.post('/health/sync', data);
    return response.data;
  },

  getMemberScore: async (range: 'today' | 'week' | 'month' = 'week') => {
    const response = await apiClient.get(`/health/members/me/score?range=${range}`);
    return response.data;
  },

  getMemberStats: async () => {
    const response = await apiClient.get('/health/members/me/stats');
    return response.data;
  },

  updateHealthConsent: async (granted: boolean) => {
    const response = await apiClient.post('/health/members/me/health-consent', { granted });
    return response.data;
  },
};

// ============================================================================
// CHECK-IN API
// ============================================================================

export const checkinAPI = {
  checkIn: async (data: {
    club_id: string;
    qr_token: string;
    timestamp: number;
    device_info?: any;
  }) => {
    const response = await apiClient.post('/health/checkin', data);
    return response.data;
  },
};

// ============================================================================
// CLUB API
// ============================================================================

export const clubAPI = {
  searchClubs: async (query: string) => {
    const response = await apiClient.get(`/clubs?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  getClubDetails: async (clubId: string) => {
    const response = await apiClient.get(`/clubs/${clubId}`);
    return response.data;
  },

  getClubLeaderboard: async (clubId: string, range: 'week' | 'month' = 'week') => {
    const response = await apiClient.get(`/leaderboard/members?club_id=${clubId}&range=${range}`);
    return response.data;
  },
};

// ============================================================================
// SEASON API
// ============================================================================

export const seasonAPI = {
  getActiveSeasons: async (clubId?: string) => {
    const url = clubId ? `/seasons/active?club_id=${clubId}` : '/seasons/active';
    const response = await apiClient.get(url);
    return response.data;
  },

  getSeasonLeaderboard: async (seasonId: string, tier?: string) => {
    const url = tier 
      ? `/leaderboard/clubs?season_id=${seasonId}&tier=${tier}`
      : `/leaderboard/clubs?season_id=${seasonId}`;
    const response = await apiClient.get(url);
    return response.data;
  },
};

// ============================================================================
// STORAGE HELPERS
// ============================================================================

export const storage = {
  saveToken: async (token: string, refreshToken: string) => {
    await AsyncStorage.setItem('access_token', token);
    await AsyncStorage.setItem('refresh_token', refreshToken);
  },

  getToken: async () => {
    return await AsyncStorage.getItem('access_token');
  },

  clearTokens: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
  },

  saveUser: async (user: any) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },

  getUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearUser: async () => {
    await AsyncStorage.removeItem('user');
  },
};

export default apiClient;
