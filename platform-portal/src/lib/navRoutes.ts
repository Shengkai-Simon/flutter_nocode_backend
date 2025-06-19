export const navRoutes = {
    dashboard: "/",
    editor: (projectId: string | number) => `/editor/${projectId}`,
    editorPath: "/editor/:projectId",
    login: "/login",
    register: "/register",
    verify: "/verify",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    requestUnlock: "/request-unlock",
    performUnlock: "/perform-unlock",
}
