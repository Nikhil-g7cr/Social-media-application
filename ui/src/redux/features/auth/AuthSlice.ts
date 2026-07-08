import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import API from "../../../config/axiosConfig";

interface User {
    id?: string;
    email: string;
    role?: string|undefined;
}

interface AuthState {
    user: User | undefined|null;
    token: string | null;
    isAuthenticated: boolean;
}

// 1. NEW: Helper function to safely decode the JWT token
const parseJwt = (token: string): User | null => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode token", e);
        return null;
    }
};

// 2. Initialize Redux state exclusively by reading and parsing the token
const storedToken = sessionStorage.getItem('accessToken');
const rawDecodedUser = storedToken ? parseJwt(storedToken) : null;
const decodedUser = rawDecodedUser ? {
    id: rawDecodedUser.id || (rawDecodedUser as any).sub,
    email: rawDecodedUser.email,
    role: rawDecodedUser.role || (rawDecodedUser as any).roles?.[0],
} : null;

const initialState: AuthState = {
    user: decodedUser,
    token: storedToken,
    isAuthenticated: !!storedToken && !!decodedUser,
};

export const performLogout = createAsyncThunk(
    'auth/performLogout',
    async (_, { dispatch }) => {
        try {
            // Call the backend endpoint to clear the HttpOnly cookie and revoke the session
            await API.post('/auth/logout');
        } catch (error) {
            console.error("Backend logout failed, but clearing local state anyway.", error);
        } finally {
            // Always clear the local Redux/SessionStorage state
            dispatch(logout());
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // We now accept the token and extract the user from it directly
        login: (state, action: PayloadAction<{ user?: User, token?: string, accessToken?: string }>) => {
            // Accommodate 'token' or 'accessToken' depending on what the API returns
            const token = action.payload.token || action.payload.accessToken;
            
            if (!token) return;

            const decoded = parseJwt(token);

            if (decoded) {
                // Set the user purely from the JWT data
                state.user = {
                    id: decoded.id || (decoded as any).sub,
                    email: decoded.email,
                    role: decoded.role || (decoded as any).roles?.[0],
                };
            } else if (action.payload.user) {
                // Fallback if token decoding fails
                state.user = action.payload.user;
            }

            state.token = token;
            state.isAuthenticated = true;

            sessionStorage.setItem('accessToken', token);
            sessionStorage.removeItem('refreshToken'); // Clean up legacy item if present
            
            // Clean up the old, insecure 'user' key if it exists from older sessions
            sessionStorage.removeItem('user');
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;

            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
        },
    }
})

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;