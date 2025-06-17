import {Navigate, Outlet} from "react-router-dom";
import {useAuthStore} from "@/stores/useAuthStore";
import {navRoutes} from "@/lib/navRoutes.ts";

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuthStore();

    // If authenticated, the subroute is rendered, otherwise redirects to the login page
    return isAuthenticated ? <Outlet /> : <Navigate to={navRoutes.login} replace />;

}
