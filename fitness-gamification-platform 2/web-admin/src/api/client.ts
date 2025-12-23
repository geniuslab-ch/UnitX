import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// 1. Centralisation de l'URL de base avec gestion robuste des préfixes
const getBaseUrl = () => {
  // Sur Railway, assurez-vous que VITE_API_URL est l'URL de votre backend (ex: https://...railway.app)
  const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  // Supprime les slashes de fin et ajoute le préfixe de versioning
  return `${rawUrl.replace(/\/+$/, '')}/api/v1`;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getBaseUrl(),
      timeout: 30000,
      headers: { 
        'Content-Type': 'application/json' 
      },
      withCredentials: true,
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    // Intercepteur de requête : Ajoute le Token JWT automatiquement
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse : Gère les erreurs globales (401, etc.)
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Redirection vers login si session expirée (401), sauf si on y est déjà
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        
        // Log de debug pour Railway
        if (error.response?.status === 404) {
          console.error(`Route non trouvée sur le serveur : ${error.config.url}`);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // --- AUTH ---
  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('access_token', data.token);
    }
    return data;
  }

  // --- CLUBS ---
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

  async deleteClub(id: string) {
    const { data } = await this.client.delete(`/clubs/${id}`);
    return data;
  }

  async importClubs(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.client.post('/clubs/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  // --- BRANDS ---
  async getBrands(params?: { search?: string }) {
    const { data } = await this.client.get('/brands', { params });
    return data;
  }

  async getBrand(id: string) {
    const { data } = await this.client.get(`/brands/${id}`);
    return data;
  }

  async createBrand(brandData: any) {
    const { data } = await this.client.post('/brands', brandData);
    return data;
  }

  async updateBrand(id: string, brandData: any) {
    const { data } = await this.client.put(`/brands/${id}`, brandData);
    return data;
  }

  async deleteBrand(id: string) {
    const { data } = await this.client.delete(`/brands/${id}`);
    return data;
  }

  // --- SEASONS ---
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

  async deleteSeason(id: string) {
    const { data } = await this.client.delete(`/seasons/${id}`);
    return data;
  }

  // --- MEMBERS ---
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

  // --- LEADERBOARD ---
  async getClubLeaderboard(params: { seasonId: string; week?: string; tier?: string }) {
    const { data } = await this.client.get('/leaderboard/clubs', { params });
    return data;
  }

  async getMemberLeaderboard(params: { clubId: string; week?: string }) {
    const { data } = await this.client.get('/leaderboard/members', { params });
    return data;
  }

  // --- QR CODES ---
  async getClubQRCode(clubId: string) {
    const { data } = await this.client.get(`/clubs/${clubId}/qr`);
    return data;
  }

  // --- DASHBOARD ---
  async getDashboardStats() {
    const { data } = await this.client.get('/admin/dashboard/stats');
    return data;
  }
}

// Export d'une instance unique (Singleton)
export const apiClient = new ApiClient();
export default apiClient;
