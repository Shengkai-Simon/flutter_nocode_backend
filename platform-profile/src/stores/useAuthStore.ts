import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {api} from '@/lib/api';

interface User {
    id: number;
    email: string;
    roles: Set<string>;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            login: async (token: string) => {
                set({ token, isAuthenticated: true });
                try {
                    console.log('/auth-service/api/public/login: token ->',token);
                    const userData = await api.get<User>('/user-service/api/me');
                    set({ user: userData });
                } catch (error) {
                    console.error("Failed to fetch user info:", error);
                    set({ token: null, isAuthenticated: false, user: null });
                }
            },
            // logout, clear the user information
            logout: () => {
                set({ token: null, isAuthenticated: false, user: null });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
)
