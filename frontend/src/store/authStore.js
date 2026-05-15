import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      unreadNotifications: 0,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),

      setUnreadNotifications: (count) =>
        set({ unreadNotifications: count }),

      incrementUnread: () =>
        set((state) => ({
          unreadNotifications: state.unreadNotifications + 1,
        })),

      decrementUnread: () =>
        set((state) => ({
          unreadNotifications: Math.max(0, state.unreadNotifications - 1),
        })),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
