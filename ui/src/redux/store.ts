import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./features/auth/AuthSlice"
import onlineUsersReducer from "./features/onlineUsers/onlineUsersSlice"
import { apiSlice } from "./apiSlice";
import { injectStore } from "../config/axiosConfig";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onlineUsers: onlineUsersReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Pass the fully initialized store into Axios so interceptors can dispatch actions
injectStore(store);

export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch = typeof store.dispatch;
