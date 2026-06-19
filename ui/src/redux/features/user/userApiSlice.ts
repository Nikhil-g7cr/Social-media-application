import { apiSlice } from '../../apiSlice';

export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    image_url?: string;
    bio?: string;
}

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => ({ url: '/user' }),
            providesTags: ['User'],
        }),
        getUserById: builder.query<User, string>({
            query: (id) => ({ url: `/user/${id}` }),
            providesTags: (_result, _error, id) => [{ type: 'User', id }],
        }),
        updateUserProfile: builder.mutation<User, Partial<User> & { id: string }>({
            query: (profile) => ({
                url: `/user/${profile.id}`,
                method: 'PATCH',
                data: profile,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserProfileMutation,
} = userApiSlice;
