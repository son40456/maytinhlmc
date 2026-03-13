import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    databaseId: number;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
    setAuth: (user: User, token: string, refreshToken: string) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            _hasHydrated: false,

            setAuth: (user, token, refreshToken) => {
                set({ user, token, refreshToken, isAuthenticated: true });
            },

            logout: () => {
                set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
            },

            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            },
        }),
        {
            name: 'storenext-auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
