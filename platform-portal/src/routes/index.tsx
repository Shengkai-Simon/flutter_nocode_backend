import {Route, Routes} from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard/Dashboard.tsx";
import {navRoutes} from "@/lib/navRoutes.ts";
import AuthLayout from "@/layouts/auth/AuthLayout.tsx";
import LoginPage from "@/layouts/auth/LoginPage.tsx";
import RegisterPage from "@/layouts/auth/RegisterPage.tsx";
import ProtectedRoute from "@/routes/ProtectedRoute.tsx";
import VerifyPage from "@/layouts/auth/VerifyPage.tsx";
import ForgotPasswordPage from "@/layouts/auth/ForgotPasswordPage.tsx";
import ResetPasswordPage from "@/layouts/auth/ResetPasswordPage.tsx";
import RequestUnlockPage from "@/layouts/auth/RequestUnlockPage.tsx";
import PerformUnlockPage from "@/layouts/auth/PerformUnlockPage.tsx";
import PublicRoute from "@/routes/PublicRoute.tsx";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Login and registration */}
            <Route element={<PublicRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path={navRoutes.login} element={<LoginPage />} />
                    <Route path={navRoutes.register} element={<RegisterPage />} />
                    <Route path={navRoutes.verify} element={<VerifyPage />} />
                    <Route path={navRoutes.forgotPassword} element={<ForgotPasswordPage />} />
                    <Route path={navRoutes.resetPassword} element={<ResetPasswordPage />} />
                    <Route path={navRoutes.requestUnlock} element={<RequestUnlockPage />} />
                    <Route path={navRoutes.performUnlock} element={<PerformUnlockPage />} />
                </Route>
            </Route>

            {/* Protected navRoutes */}
            <Route element={<ProtectedRoute />}>
                <Route path={navRoutes.dashboard} element={<DashboardLayout />} />
            </Route>
        </Routes>
    );
}
