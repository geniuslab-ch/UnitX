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

  // --- MÉTHODES API ---

  async login(email: string, password: string) {
    // Appelera : POST [BASE_URL]/api/v1/auth/login
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

  // Exemple pour vos stats du Dashboard
  async getDashboardStats() {
    const { data } = await this.client.get('/health-check'); // Route de santé
    return data;
  }
}

// Export d'une instance unique (Singleton)
export const apiClient = new ApiClient();
export default apiClient;
