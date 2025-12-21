import { create } from 'zustand';
import { storage } from '../api/client';

interface User {
  id: string;
  email?: string;
  role: string;
  member_id?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  user: User | null;
  token: string | null;
  
  // Actions
  setAuth: (token: string, user: User) => Promise<void>;
  setOnboarded: (onboarded: boolean) => void;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isOnboarded: false,
  user: null,
  token: null,

  setAuth: async (token: string, user: User) => {
    await storage.saveToken(token, ''); // Refresh token handled separately
    await storage.saveUser(user);
    set({
      isAuthenticated: true,
      token,
      user,
    });
  },

  setOnboarded: (onboarded: boolean) => {
    set({ isOnboarded: onboarded });
  },

  logout: async () => {
    await storage.clearTokens();
    await storage.clearUser();
    set({
      isAuthenticated: false,
      isOnboarded: false,
      user: null,
      token: null,
    });
  },

  loadStoredAuth: async () => {
    try {
      const token = await storage.getToken();
      const user = await storage.getUser();

      if (token && user) {
        set({
          isAuthenticated: true,
          isOnboarded: true, // Assume onboarded if token exists
          token,
          user,
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  },
}));
