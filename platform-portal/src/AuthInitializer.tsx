import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

// The sole responsibility of this component is to check the user's authentication status when the app loads
export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        const initializeAuth = async () => {
            await checkAuth();
            setIsLoading(false);
        };
        initializeAuth();
    }, [checkAuth]);

    // Until the check is complete, display a global load indicator, or none at all
    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <p>Loading session...</p>
            </div>
        );
    }

    return <>{children}</>;
}
