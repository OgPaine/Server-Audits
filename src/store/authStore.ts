import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type User, type Session } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';

interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isUser: boolean;
  sessionExpiration: number | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  checkSessionExpiration: () => void;
  resetError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      let authListener: (() => void) | null = null;

      return {
        isAuthenticated: false,
        isLoading: false,
        error: null,
        user: null,
        session: null,
        isAdmin: false,
        isUser: false,
        sessionExpiration: null,

        checkSessionExpiration: () => {
          const { session, logout } = get();
          if (session && session.expires_at) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (session.expires_at < currentTime) {
              console.warn('Session expired. Logging out.');
              logout();
            }
          }
        },

        checkAuth: async () => {
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            const userRole = session?.user?.user_metadata?.role || null;

            set({
              isAuthenticated: !!session,
              user: session?.user ?? null,
              session,
              isAdmin: userRole === 'admin',
              isUser: userRole === 'user',
              sessionExpiration: session?.expires_at || null,
            });

            if (authListener) {
              authListener();
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange(
              (_event, session) => {
                const userRole = session?.user?.user_metadata?.role || null;
                set({
                  isAuthenticated: !!session,
                  user: session?.user ?? null,
                  session,
                  isAdmin: userRole === 'admin',
                  isUser: userRole === 'user',
                  sessionExpiration: session?.expires_at || null,
                });
              }
            );

            authListener = () => subscription.unsubscribe();
          } catch (error) {
            if (error instanceof Error) {
              console.error('Auth check error:', error.message);
              set({
                error: error.message,
                isAuthenticated: false,
                user: null,
                session: null,
                isAdmin: false,
                isUser: false,
                sessionExpiration: null,
              });
            } else {
              console.error('Unexpected error:', error);
            }
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
                error: 'Please check your email for verification link',
                isLoading: false,
              });
              return;
            }

            set({
              isAuthenticated: true,
              user: data.user,
              session: data.session,
              isAdmin: false,
              isUser: true,
              sessionExpiration: data.session.expires_at || null,
              error: null,
            });
          } catch (error) {
            if (error instanceof Error) {
              console.error('Signup error:', error.message);
              set({
                error: error.message,
                isAuthenticated: false,
                user: null,
                session: null,
                isAdmin: false,
                isUser: false,
                sessionExpiration: null,
              });
            } else {
              console.error('Unexpected signup error:', error);
            }
            throw error;
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
            if (error instanceof Error) {
              console.error('Password reset error:', error.message);
              set({ error: error.message });
            } else {
              console.error('Unexpected password reset error:', error);
            }
            throw error;
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
              throw new Error('No session returned from login');
            }

            const userRole = data.user?.user_metadata?.role || null;

            set({
              isAuthenticated: true,
              user: data.user,
              session: data.session,
              isAdmin: userRole === 'admin',
              isUser: userRole === 'user',
              sessionExpiration: data.session.expires_at || null,
              error: null,
            });
          } catch (error) {
            if (error instanceof Error) {
              console.error('Login error:', error.message);
              set({
                error: error.message,
                isAuthenticated: false,
                user: null,
                session: null,
                isAdmin: false,
                isUser: false,
                sessionExpiration: null,
              });
            } else {
              console.error('Unexpected login error:', error);
            }
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        logout: async () => {
          try {
            set({ isLoading: true, error: null });

            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            set({
              isAuthenticated: false,
              user: null,
              session: null,
              error: null,
              isAdmin: false,
              isUser: false,
              sessionExpiration: null,
            });
          } catch (error) {
            if (error instanceof Error) {
              console.error('Logout error:', error.message);
              set({
                error: error.message,
              });
            } else {
              console.error('Unexpected logout error:', error);
            }
            throw error;
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

// Periodically check session expiration
setInterval(() => {
  const authStore = useAuthStore.getState();
  authStore.checkSessionExpiration();
}, 60 * 1000);
