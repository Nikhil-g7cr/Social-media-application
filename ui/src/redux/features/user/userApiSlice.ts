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
    isRequested?: boolean;
}

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<User[], void>({
            query: () => ({ url: 'user' }),
            providesTags: ['User'],
        }),
        getUserById: builder.query<User, string>({
            query: (id) => ({ url: `user/${id}` }),
            transformResponse: (response: any) => {
                const u = response?.data || response;
                return {
                    id: u.ID || u.id,
                    username: u.UserName || u.username,
                    name: u.FullName || u.name,
                    email: u.Email || u.email || '',
                    avatarUrl: u.ProfilePictureUrl || u.avatarUrl || `https://ui-avatars.com/api/?name=${u.FullName || u.name || 'User'}&background=random`,
                    bio: u.Bio || u.bio,
                };
            },
            providesTags: (_result, _error, id) => [{ type: 'User', id }],
        }),
        updateUserProfile: builder.mutation<User, Partial<User> & { id: string }>({
            query: ({ id, ...profile }) => ({
                url: `user/${id}`,
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
                            draft.isRequested = true;
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
                            if (draft.isFollowing) {
                                draft.isFollowing = false;
                                draft.followersCount = Math.max(0, draft.followersCount - 1);
                            }
                            draft.isRequested = false;
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
        getFollowers: builder.query<User[], string>({
            query: (userId) => ({ url: `follow/followers/${userId}` }),
            transformResponse: (response: any) => {
                const rawUsers = response?.data || response || [];
                return rawUsers.map((u: any) => ({
                    id: u.FollowerID || u.ID || u.id,
                    username: u.Follower?.UserName || u.UserName || u.username,
                    name: u.Follower?.FullName || u.FullName || u.name,
                    email: u.Follower?.Email || u.Email || u.email || '',
                    avatarUrl: u.Follower?.ProfilePictureUrl || u.ProfilePictureUrl || u.avatarUrl || `https://ui-avatars.com/api/?name=${u.Follower?.FullName || u.FullName || u.name || 'User'}&background=random`,
                    bio: u.Follower?.Bio || u.Bio || u.bio,
                }));
            },
            providesTags: ['User'],
        }),
        getFollowing: builder.query<User[], string>({
            query: (userId) => ({ url: `follow/following/${userId}` }),
            transformResponse: (response: any) => {
                const rawUsers = response?.data || response || [];
                return rawUsers.map((u: any) => ({
                    id: u.FollowingID || u.ID || u.id,
                    username: u.Following?.UserName || u.UserName || u.username,
                    name: u.Following?.FullName || u.FullName || u.name,
                    email: u.Following?.Email || u.Email || u.email || '',
                    avatarUrl: u.Following?.ProfilePictureUrl || u.ProfilePictureUrl || u.avatarUrl || `https://ui-avatars.com/api/?name=${u.Following?.FullName || u.FullName || u.name || 'User'}&background=random`,
                    bio: u.Following?.Bio || u.Bio || u.bio,
                }));
            },
            providesTags: ['User'],
        }),
        acceptFollowRequest: builder.mutation<{ success: boolean }, string>({
            query: (followerId) => ({
                url: `follow/accept/${followerId}`,
                method: 'POST',
            }),
            invalidatesTags: ['User', 'Profile'],
        }),
        rejectFollowRequest: builder.mutation<{ success: boolean }, string>({
            query: (followerId) => ({
                url: `follow/reject/${followerId}`,
                method: 'POST',
            }),
            invalidatesTags: ['User', 'Profile'],
        }),
        getPendingRequests: builder.query<User[], void>({
            query: () => ({ url: 'follow/requests' }),
            transformResponse: (response: any) => {
                const rawUsers = response?.data || response || [];
                return rawUsers.map((u: any) => ({
                    id: u.FollowerID || u.ID || u.id,
                    username: u.Follower?.UserName || u.UserName || u.username,
                    name: u.Follower?.FullName || u.FullName || u.name,
                    email: u.Follower?.Email || u.Email || u.email || '',
                    avatarUrl: u.Follower?.ProfilePictureUrl || u.ProfilePictureUrl || u.avatarUrl || `https://ui-avatars.com/api/?name=${u.Follower?.FullName || u.FullName || u.name || 'User'}&background=random`,
                    bio: u.Follower?.Bio || u.Bio || u.bio,
                }));
            },
            providesTags: ['User'],
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
    useGetFollowersQuery,
    useGetFollowingQuery,
    useAcceptFollowRequestMutation,
    useRejectFollowRequestMutation,
    useGetPendingRequestsQuery,
} = userApiSlice;
