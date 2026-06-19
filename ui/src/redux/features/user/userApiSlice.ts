import { apiSlice } from '../../apiSlice';

export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    image_url?: string;
    bio?: string;
    username?: string;
    avatarUrl?: string;
    isFollowing?: boolean;
}

export interface ProfileFollowInfo {
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
}

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => ({ url: 'user' }),
            providesTags: ['User'],
        }),
        getUserById: builder.query<User, string>({
            query: (id) => ({ url: `user/${id}` }),
            providesTags: (_result, _error, id) => [{ type: 'User', id }],
        }),
        updateUserProfile: builder.mutation<User, Partial<User> & { id: string }>({
            query: (profile) => ({
                url: `user/${profile.id}`,
                method: 'PATCH',
                data: profile,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
        }),
        searchUsers: builder.query<User[], string>({
            query: (searchQuery) => ({
                url: `user/search?q=${searchQuery}`,
            }),
            transformResponse: (response: any) => {
                const rawUsers = response?.data || [];
                return rawUsers.map((u: any) => ({
                    id: u.ID,
                    username: u.UserName,
                    name: u.FullName,
                    avatarUrl: u.ProfilePictureUrl || `https://ui-avatars.com/api/?name=${u.FullName || 'User'}&background=random`,
                    bio: u.Bio,
                }));
            },
            providesTags: ['User'],
        }),
        getProfileFollowInfo: builder.query<ProfileFollowInfo, string>({
            query: (userId) => ({
                url: `follow/profile/${userId}`,
            }),
            transformResponse: (response: any) => response.data || response,
            // Assuming Profile gets its own tag type or reuse 'User'
            providesTags: (_result, _error, userId) => [{ type: 'Profile', id: userId }],
        }),
        followUser: builder.mutation<{ success: boolean }, string>({
            query: (userId) => ({
                url: `follow/${userId}`,
                method: 'POST',
            }),
            async onQueryStarted(userId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    userApiSlice.util.updateQueryData('getProfileFollowInfo', userId, (draft) => {
                        if (draft) {
                            draft.isFollowing = true;
                            draft.followersCount += 1;
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (_result, _error, userId) => [
                { type: 'Profile', id: userId },
                { type: 'User' }
            ],
        }),
        unfollowUser: builder.mutation<{ success: boolean }, string>({
            query: (userId) => ({
                url: `follow/${userId}`,
                method: 'DELETE',
            }),
            async onQueryStarted(userId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    userApiSlice.util.updateQueryData('getProfileFollowInfo', userId, (draft) => {
                        if (draft) {
                            draft.isFollowing = false;
                            draft.followersCount -= 1;
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (_result, _error, userId) => [
                { type: 'Profile', id: userId },
                { type: 'User' }
            ],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserProfileMutation,
    useSearchUsersQuery,
    useGetProfileFollowInfoQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
} = userApiSlice;
