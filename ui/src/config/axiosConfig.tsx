import axios from "axios";
import { environment } from "../environment/environment";
import { notification } from 'antd';
import { updateSocketToken } from "../utils/socket";
import { login } from "../redux/features/auth/AuthSlice";

// We declare a variable to hold the Redux store without importing store.ts directly.
// This breaks the circular dependency deadlock!
let store: any;
export const injectStore = (_store: any) => {
    store = _store;
};
// Note: Removed react-jwt and manual date-fns checks. 
// It is safer to let the backend tell us (via a 401) when a token is expired.

const API = axios.create({
    baseURL: environment.APP_API_URL,
    withCredentials: true 
});

let isRefreshing = false;
let failedQueue: any[] = [];

// Helper to process queued requests after a token refresh
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Check if a JWT token is expired or expiring within 5 seconds
const isTokenExpired = (token: string): boolean => {
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return true;
        const decodedJson = JSON.parse(atob(payloadBase64));
        return decodedJson.exp * 1000 < Date.now() + 5000;
    } catch (e) {
        return true;
    }
};

// Centralized helper to refresh access token and update store + socket
const refreshAccessToken = async (): Promise<string> => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;
    try {
        const email = store.getState()?.auth?.user?.email;
        const result = await axios.post(`${environment.APP_API_URL}auth/refresh-token`, {
            email,
        }, {
            withCredentials: true,
        });

        const newAccessToken = result.data?.data?.accessToken || result.data?.accessToken;
        if (!newAccessToken) {
            throw new Error('Failed to retrieve new access token');
        }

        sessionStorage.setItem('accessToken', newAccessToken);
        updateSocketToken(newAccessToken);
        store.dispatch(login({ accessToken: newAccessToken }));

        processQueue(null, newAccessToken);
        return newAccessToken;
    } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.clear();
        if (!['/login', '/signup'].includes(window.location.pathname)) {
            notification.warning({
                message: 'Session Expired',
                description: 'Please login again.',
                duration: 3,
                onClose: () => {
                    window.location.href = '/login';
                },
            });
        }
        throw refreshError;
    } finally {
        isRefreshing = false;
    }
};

// Request Interceptor: Proactively refresh if token is expired before sending request
API.interceptors.request.use(
    async (config: any) => {
        const requestUrl = String(config?.url || '');
        const isAuthRequest = /auth\/(login|signup|refresh-token)/.test(requestUrl);

        let token = sessionStorage.getItem('accessToken');

        if (token && !isAuthRequest && isTokenExpired(token)) {
            try {
                token = await refreshAccessToken();
            } catch (err) {
                return Promise.reject(err);
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

// Response Interceptor: Catch unexpected 401s as a reactive safety net
API.interceptors.response.use(
    (response) => response,
    async (error: any) => {
        const originalRequest = error.config;
        const requestUrl = String(originalRequest?.url || '');
        const isAuthRequest = /auth\/(login|signup|refresh-token)/.test(requestUrl);

        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRequest) {
            originalRequest._retry = true;
            try {
                const newAccessToken = await refreshAccessToken();
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        } 
        else if (error.response?.status === 403) {
            window.location.href = '/403';
        }
        
        return Promise.reject(error);
    }
);

export default API;
