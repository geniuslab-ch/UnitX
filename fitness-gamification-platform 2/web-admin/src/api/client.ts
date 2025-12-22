import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// 1. Centralisation de l'URL de base
const getBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${rawUrl.replace(/\/+$/, '')}/api/v1`;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getBaseUrl(),
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    // Intercepteur de requête
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

    // Intercepteur de réponse
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('access_token', data.token);
    }
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
} // <--- Fin de la classe

export const apiClient = new ApiClient();
export default apiClient;
