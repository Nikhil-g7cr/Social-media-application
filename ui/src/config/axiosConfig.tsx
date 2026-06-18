import axios from "axios";
import { environment } from "../environment/environment";
import { notification } from 'antd';
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

// Request Interceptor: Attach the accessToken from sessionStorage
API.interceptors.request.use(
    (config: any) => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

// Response Interceptor: Catch 401s and automatically refresh the token
API.interceptors.response.use(
    (response) => response,
    async (error: any) => {
        const originalRequest = error.config;

        // If the error is 401 (Unauthorized) and we haven't already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // If a refresh is already happening, queue this request to wait for the new token
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return API(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call your refresh endpoint. 
                // The browser AUTOMATICALLY sends the HttpOnly refreshToken cookie here!
                // Make sure to use basic axios (not the interceptor API instance) to avoid infinite loops
                const result = await axios.post(`${environment.APP_API_URL}/auth/refresh`, {}, {
                    withCredentials: true 
                });

                // Assuming your backend returns { accessToken: 'new_token' }
                const newAccessToken = result.data.accessToken;
                
                // Update sessionStorage with the new token
                sessionStorage.setItem('accessToken', newAccessToken);

                // Update the failed request with the new token and retry it
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                processQueue(null, newAccessToken);
                
                return API(originalRequest);
                
            } catch (refreshError) {
                // If the refresh token is also expired/invalid, force logout
                processQueue(refreshError, null);
                sessionStorage.clear();
                
                notification.warning({
                    message: 'Session Expired',
                    description: 'Please login again.',
                    duration: 3,
                    onClose: () => {
                        window.location.href = '/login';
                    },
                });
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        } 
        // Handle Forbidden errors
        else if (error.response?.status === 403) {
            window.location.href = '/403';
        }
        
        return Promise.reject(error);
    }
);

export default API;
