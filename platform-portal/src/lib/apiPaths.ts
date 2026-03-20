export const apiPaths = {

    logout: '/api/auth/logout',
    login: '/api/auth/public/login',

    register: '/api/users/public/register',
    verify: '/api/users/public/verify',
    resendVerification: '/api/users/public/resend-verification',
    forgotPassword: '/api/users/public/forgot-password',
    resetPassword: '/api/users/public/reset-password',
    requestUnlock: '/api/users/public/request-unlock',
    performUnlock: '/api/users/public/perform-unlock',

    me: '/api/users/me',

    createProject: '/api/projects',
    getAllProjects: '/api/projects',
    deleteProject: (projectId: number) => `/api/projects/${projectId}`,
    updateProject: (projectId: number) => `/api/projects/${projectId}`,

    createPageSession: (projectId: string) => `/api/mcp/projects/${projectId}/sessions/create`,
    adjustPageSession: (projectId: string) => `/api/mcp/projects/${projectId}/sessions/adjust`,

    sendMessage: (sessionId: string) => `/api/mcp/sessions/${sessionId}/messages`,
    getProjectSessions: (projectId: string) => `/api/mcp/projects/${projectId}/sessions`,
    getSessionMessages: (sessionId: string) => `/api/mcp/sessions/${sessionId}/messages`,
    deleteSession: (sessionId: string) => `/api/mcp/sessions/${sessionId}`,
}
