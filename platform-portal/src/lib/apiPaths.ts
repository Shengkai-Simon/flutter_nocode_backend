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

    createProject: '/api/project/create-project',
}
