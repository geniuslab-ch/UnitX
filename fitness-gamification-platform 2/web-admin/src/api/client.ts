import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// 1. Centralisation de l'URL de base avec gestion robuste des préfixes
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
      headers: { 
        'Content-Type': 'application/json' 
      },
      withCredentials: true,
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
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

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        
        if (error.response?.status === 404) {
          console.error(`Route non trouvée sur le serveur : ${error.co
