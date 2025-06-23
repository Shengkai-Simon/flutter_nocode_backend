import {create} from 'zustand';
import {api} from '@/lib/api';
import {apiPaths} from "@/lib/apiPaths.ts";

interface User {
    id: number;
    email: string;
    roles: Set<string>;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: () => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    isAuthenticated: false,
    login: async () => {
        // After successful login, directly obtain the user information to confirm the session
        try {
            const userData = await api.get<User>(apiPaths.me);
            set({ user: userData, isAuthenticated: true });
        } catch (error) {
            console.error("Failed to fetch user info after login:", error);
            set({ user: null, isAuthenticated: false });
        }
    },
    logout: () => {
        // Clear the front-end state, and the back-end interface will take care of clearing cookies
        set({ user: null, isAuthenticated: false });
    },
    checkAuth: async () => {
        try {
            const userData = await api.get<User>(apiPaths.me);
            set({ user: userData, isAuthenticated: true });
        } catch (error) {
            // If getting the user information fails (usually a 401), confirm that the user is not logged in
            set({ user: null, isAuthenticated: false });
        }
    }
}));
