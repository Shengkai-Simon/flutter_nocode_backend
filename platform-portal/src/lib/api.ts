import {useAuthStore} from "@/stores/useAuthStore";

export class ApiError extends Error {
    status: number;
    errorData?: any[];

    constructor(message: string, status: number, errorData?: any[]) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errorData = errorData;
    }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const { token } = useAuthStore.getState();
    const defaultHeaders: HeadersInit = { 'Content-Type': 'application/json' };

    if (token && !url.includes('/public/')) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    options.headers = { ...defaultHeaders, ...options.headers };

    const response = await fetch(url, options);

    if (response.status === 204) {
        return {} as T; // An empty object is returned because there is no response body
    }

    let responseData;
    try {
        responseData = await response.json();
    } catch (error) {
        console.error("Failed to parse JSON response:", error);
        throw new ApiError(
            `Request failed with status ${response.status}: ${response.statusText}`,
            response.status
        );
    }

    // **At the time of token invalidation**
    // If the response code is 401 and the message clearly states that the token is invalid, log out
    if (responseData?.code === 401 && responseData?.message === "Authentication token is invalid or has expired.") {
        // Call the logout method in the Zustand store
        useAuthStore.getState().logout();
        // ProtectedRoute listens for changes in the isAuthenticated status and automatically redirects to the login page
    }


    if (responseData && responseData.code === 200) {
        return responseData.data as T;
    } else {
        throw new ApiError(
            responseData.message || `An error occurred with code ${responseData.code}`,
            responseData.code || response.status,
            responseData.data
        );
    }
}

export const api = {
    get: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'GET' }),
    post: <T>(url:string, body: any, options?: RequestInit) => request<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: <T>(url: string, body: any, options?: RequestInit) => request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(url: string, body: any, options?: RequestInit) => request<T>(url, { ...options, method: 'PATCH', body: JSON.stringify(body), headers: {'Content-Type': 'application/json-patch+json'} }),
    delete: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'DELETE' }),
};
