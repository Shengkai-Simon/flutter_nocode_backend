import {useAuthStore} from "@/stores/useAuthStore";

// Wrong data structure type definition returned by the backend
interface ApiErrorData {
    field: string;
    message: string;
}

// Custom error classes to carry richer error messages
export class ApiError extends Error {
    status: number;
    errorData?: ApiErrorData[];

    constructor(message: string, status: number, errorData?: ApiErrorData[]) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errorData = errorData;
    }
}

// API request function
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    // Get the token from the Zustand store
    const { token } = useAuthStore.getState();

    // Prepare the default request header
    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // If a token exists, it is added to the Authorization header
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Merge the default header and the user's incoming header
    options.headers = { ...defaultHeaders, ...options.headers };

    // Initiate a fetch request
    const response = await fetch(url, options);

    // Try to parse the response body
    let responseData;
    try {
        responseData = await response.json();
    } catch (error) {
        // If the response body is not valid JSON (e.g. an empty response), but the status code is successful
        if (response.ok) {
            return {} as T; // Succeeds but has no content, returns an empty object
        }
        // If the status code fails and there is no JSON, a generic error is thrown
        throw new ApiError(response.statusText, response.status);
    }

    // Check if the response was successful
    if (response.ok) {
        return responseData as T;
    } else {
        const detailedMessage = responseData?.data?.[0]?.message;
        const errorMessage = detailedMessage || responseData.message || 'An unknown error occurred';
        throw new ApiError(errorMessage, response.status, responseData.data);
    }
}

export const api = {
    get: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'GET' }),
    post: <T>(url:string, body: any, options?: RequestInit) => request<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: <T>(url: string, body: any, options?: RequestInit) => request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'DELETE' }),
};
