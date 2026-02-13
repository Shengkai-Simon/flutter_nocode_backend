import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { navRoutes } from "@/lib/navRoutes.ts";

/**
 * A route guard for public pages like login and register.
 * If the user is authenticated, it redirects them to the dashboard.
 * Otherwise, it renders the public page.
 */
export default function PublicRoute() {
    const { isAuthenticated } = useAuthStore();

    return isAuthenticated ? <Navigate to={navRoutes.dashboard} replace /> : <Outlet />;
}
