import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./features/auth/AuthSlice"
import onlineUsersReducer from "./features/onlineUsers/onlineUsersSlice"
import { apiSlice } from "./apiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onlineUsers: onlineUsersReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch = typeof store.dispatch;
