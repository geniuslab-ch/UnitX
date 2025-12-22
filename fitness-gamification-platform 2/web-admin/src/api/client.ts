import axios, { AxiosInstance } from 'axios';

// IMPORTANT:
// - VITE_API_URL doit être la base du backend (domaine uniquement), ex:
//   https://rare-contentment-production.up.railway.app
// - PAS de /api, PAS de /api/v1, PAS de /auth/login
const RAW_API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Normalise: enlève espaces + slash final
const API_ROOT = RAW_API_ROOT.trim().replace(/\/+$/, '');

// Base API versionnée
const API_BASE_URL = `${API_ROOT}/api/v1`;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

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

  // =====================
  // AUTH
  // =====================
  async login(email: string, password: string) {
    // ✅ Résultat final attendu :
    // POST https://rare-contentment-production.up.railway.app/api/v1/auth/login
    const { data } = await this.client.post('/auth/login', { email, password });
    return data;
  }

  // (le reste de tes méthodes peut rester identique)
}

export const apiClient = new ApiClient();
export default apiClient;
