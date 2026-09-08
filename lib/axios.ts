import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";

// 1. Standardized API Response Interfaces
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
        [key: string]: any;
    };
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[] | string>;
    statusCode?: number;
}

// 2. Base Axios Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BASE_URL || "http://localhost:5000/api";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// 3. Request Interceptor: Attach Auth Token Automatically
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Attach JWT Token if present in local storage or cookies (client-side)
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// 4. Response Interceptor: Unwraps Data & Normalizes Errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        // Return standard response body directly
        return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
        // Standardize error handling across the frontend
        const errorPayload: ApiErrorResponse = {
            success: false,
            message:
                error.response?.data?.message ||
                error.message ||
                "An unexpected error occurred. Please try again.",
            statusCode: error.response?.status || 500,
            errors: error.response?.data?.errors,
        };

        // Handle Token Expiration (401 Unauthorized)
        if (error.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("token");
            // Optional: Redirect to login page if unauthenticated
            // window.location.href = "/login";
        }

        return Promise.reject(errorPayload);
    }
);

// 5. Type-Safe Request Wrapper Helpers
export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
        axiosInstance.get(url, config).then((res) => res.data),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
        axiosInstance.post(url, data, config).then((res) => res.data),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
        axiosInstance.put(url, data, config).then((res) => res.data),

    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
        axiosInstance.patch(url, data, config).then((res) => res.data),

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
        axiosInstance.delete(url, config).then((res) => res.data),
};

export default axiosInstance;