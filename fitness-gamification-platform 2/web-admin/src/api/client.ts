import axios, { AxiosInstance } from 'axios';

// IMPORTANT : VITE_API_URL doit être la base du backend (sans /api/v1)
// Exemple Railway : https://unitx-production.up.railway.app
const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Ton backend expose /api/v1/...
const API_BASE_URL = `${API_ROOT.replace(/\/+$/, '')}/api/v1`;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      // utile si tu utilises des cookies un jour, sinon tu peux laisser
      withCredentials: true,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email: string, password: string) {
    // -> POST https://unitx-production.up.railway.app/api/v1/auth/login
    const { data } = await this.client.post('/auth/login', { email, password });
    return data;
  }

  // Clubs
  async getClubs(params?: { search?: string; brandId?: string }) {
    const { data } = await this.client.get('/clubs', { params });
    return data;
  }

  async getClub(id: string) {
    const { data } = await this.client.get(`/clubs/${id}`);
    return data;
  }

  async createClub(clubData: any) {
    const { data } = await this.client.post('/clubs', clubData);
    return data;
  }

  async updateClub(id: string, clubData: any) {
    const { data } = await this.client.put(`/clubs/${id}`, clubData);
    return data;
  }

  async importClubs(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.client.post('/clubs/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  // Members
  async getMembers(params?: { clubId?: string; search?: string; page?: number; limit?: number }) {
    const { data } = await this.client.get('/members', { params });
    return data;
  }

  async getMember(id: string) {
    const { data } = await this.client.get(`/members/${id}`);
    return data;
  }

  async importMembers(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.client.post('/members/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  // Seasons
  async getSeasons(params?: { status?: string; brandId?: string }) {
    const { data } = await this.client.get('/seasons', { params });
    return data;
  }

  async getSeason(id: string) {
    const { data } = await this.client.get(`/seasons/${id}`);
    return data;
  }

  async createSeason(seasonData: any) {
    const { data } = await this.client.post('/seasons', seasonData);
    return data;
  }

  async updateSeason(id: string, seasonData: any) {
    const { data } = await this.client.put(`/seasons/${id}`, seasonData);
    return data;
  }

  // Leaderboard
  async getClubLeaderboard(params: { seasonId: string; week?: string; tier?: string }) {
    const { data } = await this.client.get('/leaderboard/clubs', { params });
    return data;
  }

  async getMemberLeaderboard(params: { clubId: string; week?: string }) {
    const { data } = await this.client.get('/leaderboard/members', { params });
    return data;
  }

  // QR Codes
  async getClubQRCode(clubId: string) {
    const { data } = await this.client.get(`/clubs/${clubId}/qr`);
    return data;
  }

  // Dashboard Stats
  async getDashboardStats() {
    const { data } = await this.client.get('/admin/dashboard/stats');
    return data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
