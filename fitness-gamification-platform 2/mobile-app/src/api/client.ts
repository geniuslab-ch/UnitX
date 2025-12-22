import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { 
  LoginRequest, 
  AuthResponse, 
  SignupRequest, 
  HealthSyncRequest, 
  CheckInRequest,
  UserRole
} from '../types/api'; // Assure-toi que le chemin vers ton fichier de types est correct

// 1. Configuration de l'URL de base
const getBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${rawUrl.replace(/\/+$/, '')}/api/v1`;
};

// 2. Création de l'instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 3. Intercepteur de Requête (Ajout du Token)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Intercepteur de Réponse (Gestion des erreurs 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================
export const authAPI = {
  signup: async (data: SignupRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    if (response.data.token) {
      storage.saveToken(response.data.token, response.data.refresh_token);
      storage.saveUser(response.data.user);
    }
    return response.data;
  },
};

// ============================================================================
// CLUB API (incluant l'import manquant)
// ============================================================================
export const clubAPI = {
  importClubs: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/clubs/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  searchClubs: async (query: string) => {
    const response = await apiClient.get(`/clubs?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  getClubDetails: async (clubId: string) => {
    const response = await apiClient.get(`/clubs/${clubId}`);
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
    const params = new URLSearchParams();
    params.append('season_id', seasonId);
    if (tier) params.append('tier', tier);
    
    const response = await apiClient.get(`/leaderboard/clubs?${params.toString()}`);
    return response.data;
  },
};

// ============================================================================
// STORAGE HELPERS (Adapté pour le Web)
// ============================================================================
export const storage = {
  saveToken: (token: string, refreshToken: string) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  },

  getToken: () => localStorage.getItem('access_token'),

  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  saveUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearUser: () => localStorage.removeItem('user'),
};

export default apiClient;
