import axios, { AxiosInstance } from 'axios';

// Base backend Railway (sans /api/v1)
const API_ROOT =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Backend expose /api/v1/...
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

  // =====================
  // AUTH
  // =====================
  async login(email: string, password: string) {
    // 👉 POST https://rare-contentment-productio
