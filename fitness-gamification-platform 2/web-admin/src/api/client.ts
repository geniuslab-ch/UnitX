import axios, { AxiosInstance } from 'axios';

const RAW_API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_ROOT = RAW_API_ROOT.trim().replace(/\/+$/, '');
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'https://rare-contentment-production.up.railway.app'}/api/v1`;


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

  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    return data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
