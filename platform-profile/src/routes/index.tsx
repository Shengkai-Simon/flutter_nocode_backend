import {Route, Routes} from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard/Dashboard.tsx";
import EditorLayout from "@/layouts/editor/Editor.tsx";
import {routes} from "@/lib/routes.ts";
import AuthLayout from "@/layouts/auth/AuthLayout.tsx";
import LoginPage from "@/layouts/login/LoginPage.tsx";
import RegisterPage from "@/layouts/register/RegisterPage.tsx";
import ProtectedRoute from "@/routes/ProtectedRoute.tsx";
import VerifyPage from "@/layouts/verify/VerifyPage.tsx";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Login and registration */}
            <Route element={<AuthLayout />}>
                <Route path={routes.login} element={<LoginPage />} />
                <Route path={routes.register} element={<RegisterPage />} />
                <Route path={routes.verify} element={<VerifyPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route path={routes.dashboard} element={<DashboardLayout />} />
                <Route path={routes.editor} element={<EditorLayout />} />
            </Route>
        </Routes>
    );
}
