import {Navigate, Outlet} from "react-router-dom";
import {useAuthStore} from "@/stores/useAuthStore";
import {routes} from "@/lib/routes.ts";

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuthStore();

    // If authenticated, the subroute is rendered, otherwise redirects to the login page
    return isAuthenticated ? <Outlet /> : <Navigate to={routes.login} replace />;

}
