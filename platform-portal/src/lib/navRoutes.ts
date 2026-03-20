export const navRoutes = {
    dashboard: "/",
    editor: (projectId: string | number) => `/flutter/?id=${projectId}`,
    editorPath: "/editor",
    login: "/login",
    register: "/register",
    verify: "/verify",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    requestUnlock: "/request-unlock",
    performUnlock: "/perform-unlock",
}
