import { apiSlice } from "../../apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/auth/signup",
        method: "POST",
        data: payload,
      }),
    }),
    login: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/auth/login",
        method: "POST",
        data: payload,
      }),
    }),
  }),
});

export const { useSignupMutation, useLoginMutation } = authApiSlice;
