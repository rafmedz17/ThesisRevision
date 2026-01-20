import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'student-assistant' | 'student';
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, loginType: string) => Promise<void>;
  logout: () => void;
  updateUsername: (newUsername: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (username: string, password: string, loginType: string) => {
        try {
          const response = await api.post('/auth/login', { username, password, loginType });
          const { token, user } = response.data;
          set({ user, token, isAuthenticated: true });
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Login failed');
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUsername: async (newUsername: string) => {
        try {
          const response = await api.put('/auth/username', { username: newUsername });
          const { user } = response.data;
          set({ user });
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Failed to update username');
        }
      },
      updatePassword: async (currentPassword: string, newPassword: string) => {
        try {
          await api.put('/auth/password', { currentPassword, newPassword });
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Failed to update password');
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
