import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type User, type Session } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';

// Custom error type for auth operations
class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Type guard for user roles
type UserRole = 'admin' | 'user';
const isUserRole = (role: unknown): role is UserRole => 
  role === 'admin' || role === 'user';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isUser: boolean;
  sessionExpiration: number | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  checkSessionExpiration: () => void;
  resetError: () => void;
}

interface AuthStore extends AuthState, AuthActions {}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  session: null,
  isAdmin: false,
  isUser: false,
  sessionExpiration: null,
};

const handleAuthError = (error: unknown): AuthError => {
  if (error instanceof AuthError) return error;
  if (error instanceof Error) {
    return new AuthError(error.message, undefined, error);
  }
  return new AuthError('An unexpected error occurred', undefined, error);
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get, store) => {
      let authListener: (() => void) | null = null;

      // Cleanup subscription when auth state changes
      store.subscribe((state, prevState) => {
        if (!state.isAuthenticated && prevState.isAuthenticated) {
          authListener?.();
          authListener = null;
        }
      });

      const updateAuthState = (session: Session | null) => {
        const userRole = session?.user?.user_metadata?.role;
        const validRole = isUserRole(userRole) ? userRole : null;

        set({
          isAuthenticated: !!session,
          user: session?.user ?? null,
          session,
          isAdmin: validRole === 'admin',
          isUser: validRole === 'user',
          sessionExpiration: session?.expires_at || null,
        });
      };

      return {
        ...initialState,

        checkSessionExpiration: () => {
          const { session, logout } = get();
          if (session?.expires_at) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (session.expires_at <= currentTime) {
              console.warn('Session expired. Logging out.');
              logout();
            }
          }
        },

        checkAuth: async () => {
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            updateAuthState(session);

            // Clean up existing listener
            if (authListener) {
              authListener();
            }

            // Set up new auth state listener
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
              (_event, session) => {
                updateAuthState(session);
              }
            );

            authListener = () => subscription.unsubscribe();
          } catch (error) {
            const authError = handleAuthError(error);
            console.error('Auth check error:', authError);
            set({
              ...initialState,
              error: authError,
            });
          }
        },

        signup: async (email: string, password: string) => {
          try {
            set({ isLoading: true, error: null });

            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  role: 'user',
                },
              },
            });

            if (error) throw error;

            if (!data.session) {
              set({
                error: new AuthError('Please check your email for verification link'),
                isLoading: false,
              });
              return;
            }

            updateAuthState(data.session);
          } catch (error) {
            const authError = handleAuthError(error);
            console.error('Signup error:', authError);
            set({
              ...initialState,
              error: authError,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        resetPassword: async (email: string) => {
          try {
            set({ isLoading: true, error: null });

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
          } catch (error) {
            const authError = handleAuthError(error);
            console.error('Password reset error:', authError);
            set({ error: authError });
          } finally {
            set({ isLoading: false });
          }
        },

        login: async (email: string, password: string) => {
          try {
            set({ isLoading: true, error: null });

            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) throw error;

            if (!data.session) {
              throw new AuthError('No session returned from login');
            }

            updateAuthState(data.session);
          } catch (error) {
            const authError = handleAuthError(error);
            console.error('Login error:', authError);
            set({
              ...initialState,
              error: authError,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        logout: async () => {
          try {
            set({ isLoading: true, error: null });

            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            set(initialState);
          } catch (error) {
            const authError = handleAuthError(error);
            console.error('Logout error:', authError);
            set({
              error: authError,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        resetError: () => set({ error: null }),
      };
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        session: state.session,
        isAdmin: state.isAdmin,
        isUser: state.isUser,
        sessionExpiration: state.sessionExpiration,
      }),
    }
  )
);