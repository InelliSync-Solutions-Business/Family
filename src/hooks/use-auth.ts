import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Permission, LoginCredentials, AuthResponse } from '@/types/auth';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  isAdmin: () => boolean;
  isCurator: () => boolean;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const { user, token }: AuthResponse = await response.json();
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false 
          });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${get().token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Logout failed');
          }

          set({ user: null, token: null, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false 
          });
        }
      },

      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        
        return user.permissions.some(
          (p) => p.action === permission.action && p.resource === permission.resource
        );
      },

      isAdmin: () => {
        return get().user?.role === 'admin';
      },

      isCurator: () => {
        return get().user?.role === 'curator';
      },
    }),
    {
      name: 'family-legacy-auth',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
      }),
    }
  )
);

// Custom hook for protected routes
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  
  if (!isLoading && !user) {
    // Redirect to login if not authenticated
    window.location.href = '/login';
  }
  
  return { user, isLoading };
}
