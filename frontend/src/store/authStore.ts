// frontend/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginCredentials, RegisterCredentials } from '../../../shared/types/auth';
import { api } from '../utils/api';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  resetAuthState: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await api.login(credentials.email, credentials.password);
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
            loading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            loading: false 
          });
          throw error;
        }
      },

      register: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await api.register(
            credentials.email,
            credentials.password,
            credentials.name
          );
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            loading: false
          });
          throw error;
        }
      },

      logout: () => {
        api.logout();
        get().resetAuthState();
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      resetAuthState: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);