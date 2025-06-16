import { useAuthStore } from "@/stores/useAuthStore";

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
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    options.headers = { ...defaultHeaders, ...options.headers };

    const response = await fetch(url, options);

    // First, check for errors at the HTTP level (e.g. 404 Not Found, 500 Server Error)
    if (!response.ok) {
        // For HTTP states that are not 2xx, we try to parse possible error bodies
        try {
            const errorBody = await response.json();
            throw new ApiError(errorBody.message || response.statusText, response.status, errorBody.data);
        } catch (e) {
            // If the error body is not in JSON format, an error based on HTTP state is thrown
            throw new ApiError(response.statusText, response.status);
        }
    }

    // If the HTTP status is OK (2xx), we parse our custom business layer encapsulation
    const responseData = await response.json();

    // Checking the Service Layer Status Code 'code'
    if (responseData.code === 200) {
        // Business success, go straight back to the 'data' part of the core
        return responseData.data as T;
    } else {
        // If a service fails to verify a parameter and an error containing backend information is thrown
        throw new ApiError(
            responseData.message || 'An error occurred',
            responseData.code,
            responseData.data
        );
    }
}

export const api = {
    get: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'GET' }),
    post: <T>(url:string, body: any, options?: RequestInit) => request<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: <T>(url: string, body: any, options?: RequestInit) => request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'DELETE' }),
};
