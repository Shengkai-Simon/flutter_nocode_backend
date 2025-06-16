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
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    options.headers = { ...defaultHeaders, ...options.headers };

    const response = await fetch(url, options);

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
    delete: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'DELETE' }),
};
