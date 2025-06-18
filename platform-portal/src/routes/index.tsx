import {Route, Routes} from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard/Dashboard.tsx";
import EditorLayout from "@/layouts/editor/Editor.tsx";
import {navRoutes} from "@/lib/navRoutes.ts";
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
                <Route path={navRoutes.login} element={<LoginPage />} />
                <Route path={navRoutes.register} element={<RegisterPage />} />
                <Route path={navRoutes.verify} element={<VerifyPage />} />
            </Route>

            {/* Protected navRoutes */}
            <Route element={<ProtectedRoute />}>
                <Route path={navRoutes.dashboard} element={<DashboardLayout />} />
                <Route path={navRoutes.editorPath} element={<EditorLayout />} />
            </Route>
        </Routes>
    );
}
