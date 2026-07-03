import { apiSlice } from "../../apiSlice";

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
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface ProfileFollowInfo {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isRequested?: boolean;
}

export interface UsernameAvailabilityResponse {
  available: boolean;
}

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], { showDeleted?: boolean } | void>({
      query: (args) => {
        const showDeleted =
          args && "showDeleted" in args ? args.showDeleted : false;
        return { url: showDeleted ? "user?showDeleted=true" : "user" };
      },
      transformResponse: (response: any) => {
        const rawUsers = response?.data || response || [];
        return rawUsers.map((u: any) => ({
          id: u.ID || u.id,
          username: u.UserName || u.username,
          name: u.FullName || u.name,
          email: u.EmailAddress || u.Email || u.email || "",
          role: u.Role || u.role,
          isActive: u.IsActive !== undefined ? u.IsActive : u.isActive,
          isDeleted: u.IsDeleted ?? u.isDeleted ?? false,
          deletedAt: u.DeletedAt || u.deletedAt || null,
          avatarUrl:
            u.ProfilePictureUrl ||
            u.avatarUrl ||
            `https://ui-avatars.com/api/?name=${u.FullName || u.name || "User"}&background=random`,
        }));
      },
      providesTags: ["User"],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => ({ url: `user/${id}` }),
      transformResponse: (response: any) => {
        const u = response?.data || response;
        return {
          id: u.ID || u.id,
          username: u.UserName || u.username,
          name: u.FullName || u.name,
          email: u.Email || u.email || "",
          avatarUrl:
            u.ProfilePictureUrl ||
            u.avatarUrl ||
            `https://ui-avatars.com/api/?name=${u.FullName || u.name || "User"}&background=random`,
          bio: u.Bio || u.bio,
          isDeleted: u.IsDeleted ?? false,
          deletedAt: u.DeletedAt || null,
        };
      },
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    // ======check if user alredy exist=========
    checkUsernameAvailability: builder.query<UsernameAvailabilityResponse,string>({
      query: (username) => ({
        url: `user/check-username/${encodeURIComponent(username)}`,
      }),

      transformResponse: (response: any) => response.data,

      providesTags: ["User"],
    }),

    updateUserProfile: builder.mutation<User, Partial<User> & { id: string }>({
      query: ({ id, ...profile }) => {
        const payload: any = {};
        if (profile.name !== undefined) payload.FullName = profile.name;
        if (profile.username !== undefined) payload.UserName = profile.username;
        if (profile.bio !== undefined) payload.Bio = profile.bio;
        if (profile.avatarUrl !== undefined)
          payload.ProfilePictureUrl = profile.avatarUrl;
        if (profile.isActive !== undefined) payload.IsActive = profile.isActive;
        if (profile.role !== undefined) payload.Role = profile.role;

        return {
          url: `user/${id}`,
          method: "PATCH",
          data: payload,
        };
      },
      async onQueryStarted({ id, ...profile }, { dispatch, queryFulfilled }) {
        const patchResult1 = dispatch(
          userApiSlice.util.updateQueryData("getUsers", undefined, (draft) => {
            const user = draft.find((u) => u.id === id);
            if (user) {
              if (profile.name !== undefined) user.name = profile.name;
              if (profile.username !== undefined)
                user.username = profile.username;
              if (profile.bio !== undefined) user.bio = profile.bio;
              if (profile.avatarUrl !== undefined)
                user.avatarUrl = profile.avatarUrl;
              if (profile.isActive !== undefined)
                user.isActive = profile.isActive;
              if (profile.role !== undefined) user.role = profile.role;
            }
          }),
        );
        const patchResult2 = dispatch(
          userApiSlice.util.updateQueryData("getUserById", id, (draft) => {
            if (draft) {
              if (profile.name !== undefined) draft.name = profile.name;
              if (profile.username !== undefined)
                draft.username = profile.username;
              if (profile.bio !== undefined) draft.bio = profile.bio;
              if (profile.avatarUrl !== undefined)
                draft.avatarUrl = profile.avatarUrl;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult1.undo();
          patchResult2.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        "User",
        "Profile",
        "Post",
        "Comment",
        "Notification",
        "Conversation",
        "Chat",
      ],
    }),
    softDeleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `user/${id}/soft-delete`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
    restoreUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `user/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
    hardDeleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    /** @deprecated Use hardDeleteUser. Kept for backward compatibility. */
    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
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
          avatarUrl:
            u.ProfilePictureUrl ||
            `https://ui-avatars.com/api/?name=${u.FullName || "User"}&background=random`,
          bio: u.Bio,
        }));
      },
      providesTags: ["User"],
    }),
    getProfileFollowInfo: builder.query<ProfileFollowInfo, string>({
      query: (userId) => ({
        url: `follow/profile/${userId}`,
      }),
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, userId) => [
        { type: "Profile", id: userId },
      ],
    }),
    followUser: builder.mutation<{ success: boolean }, string>({
      query: (userId) => ({
        url: `follow/${userId}`,
        method: "POST",
      }),
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          userApiSlice.util.updateQueryData(
            "getProfileFollowInfo",
            userId,
            (draft) => {
              if (draft) {
                draft.isRequested = true;
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, userId) => [
        { type: "Profile", id: userId },
        { type: "User" },
      ],
    }),
    unfollowUser: builder.mutation<{ success: boolean }, string>({
      query: (userId) => ({
        url: `follow/${userId}`,
        method: "DELETE",
      }),
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          userApiSlice.util.updateQueryData(
            "getProfileFollowInfo",
            userId,
            (draft) => {
              if (draft) {
                if (draft.isFollowing) {
                  draft.isFollowing = false;
                  draft.followersCount = Math.max(0, draft.followersCount - 1);
                }
                draft.isRequested = false;
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, userId) => [
        { type: "Profile", id: userId },
        { type: "User" },
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
          email: u.Follower?.Email || u.Email || u.email || "",
          avatarUrl:
            u.Follower?.ProfilePictureUrl ||
            u.ProfilePictureUrl ||
            u.avatarUrl ||
            `https://ui-avatars.com/api/?name=${u.Follower?.FullName || u.FullName || u.name || "User"}&background=random`,
          bio: u.Follower?.Bio || u.Bio || u.bio,
        }));
      },
      providesTags: ["User"],
    }),
    getFollowing: builder.query<User[], string>({
      query: (userId) => ({ url: `follow/following/${userId}` }),
      transformResponse: (response: any) => {
        const rawUsers = response?.data || response || [];
        return rawUsers.map((u: any) => ({
          id: u.FollowingID || u.ID || u.id,
          username: u.Following?.UserName || u.UserName || u.username,
          name: u.Following?.FullName || u.FullName || u.name,
          email: u.Following?.Email || u.Email || u.email || "",
          avatarUrl:
            u.Following?.ProfilePictureUrl ||
            u.ProfilePictureUrl ||
            u.avatarUrl ||
            `https://ui-avatars.com/api/?name=${u.Following?.FullName || u.FullName || u.name || "User"}&background=random`,
          bio: u.Following?.Bio || u.Bio || u.bio,
        }));
      },
      providesTags: ["User"],
    }),
    acceptFollowRequest: builder.mutation<{ success: boolean }, string>({
      query: (followerId) => ({
        url: `follow/accept/${followerId}`,
        method: "POST",
      }),
      invalidatesTags: ["User", "Profile", "Notification"],
    }),
    rejectFollowRequest: builder.mutation<{ success: boolean }, string>({
      query: (followerId) => ({
        url: `follow/reject/${followerId}`,
        method: "POST",
      }),
      invalidatesTags: ["User", "Profile", "Notification"],
    }),
    getPendingRequests: builder.query<User[], void>({
      query: () => ({ url: "follow/requests" }),
      transformResponse: (response: any) => {
        const rawUsers = response?.data || response || [];
        return rawUsers.map((u: any) => ({
          id: u.FollowerID || u.ID || u.id,
          username: u.Follower?.UserName || u.UserName || u.username,
          name: u.Follower?.FullName || u.FullName || u.name,
          email: u.Follower?.Email || u.Email || u.email || "",
          avatarUrl:
            u.Follower?.ProfilePictureUrl ||
            u.ProfilePictureUrl ||
            u.avatarUrl ||
            `https://ui-avatars.com/api/?name=${u.Follower?.FullName || u.FullName || u.name || "User"}&background=random`,
          bio: u.Follower?.Bio || u.Bio || u.bio,
        }));
      },
      providesTags: ["User"],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const { initializeSocket } = await import("../../../utils/socket");
        const socket = initializeSocket();
        try {
          await cacheDataLoaded;
          const listener = (newNotification: any) => {
            if (newNotification && newNotification.NotificationType === "FOLLOW_REQUEST") {
              const newUser: User = {
                id: newNotification.ActorUserID || newNotification.Actor?.ID,
                username: newNotification.Actor?.UserName || "user",
                name: newNotification.Actor?.UserName || "User",
                email: "",
                avatarUrl:
                  newNotification.Actor?.ProfilePictureUrl ||
                  newNotification.Actor?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${newNotification.Actor?.UserName || "User"}&background=random`,
                bio: "",
              };
              updateCachedData((draft) => {
                if (!draft.find((u) => u.id === newUser.id)) {
                  draft.unshift(newUser);
                }
              });
            }
          };
          socket.on("newNotification", listener);
        } catch {}
        await cacheEntryRemoved;
      },
    }),
    getSentRequests: builder.query<User[], void>({
      query: () => ({ url: "follow/sent-requests" }),
      transformResponse: (response: any) => {
        const rawUsers = response?.data || response || [];
        return rawUsers.map((u: any) => ({
          id: u.FollowingID || u.ID || u.id,
          username: u.Following?.UserName || u.UserName || u.username,
          name: u.Following?.FullName || u.FullName || u.name,
          email: u.Following?.Email || u.Email || u.email || "",
          avatarUrl:
            u.Following?.ProfilePictureUrl ||
            u.ProfilePictureUrl ||
            u.avatarUrl ||
            `https://ui-avatars.com/api/?name=${u.Following?.FullName || u.FullName || u.name || "User"}&background=random`,
          bio: u.Following?.Bio || u.Bio || u.bio,
        }));
      },
      providesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserProfileMutation,
  useSoftDeleteUserMutation,
  useRestoreUserMutation,
  useHardDeleteUserMutation,
  useDeleteUserMutation,
  useSearchUsersQuery,
  useCheckUsernameAvailabilityQuery,
  useLazyCheckUsernameAvailabilityQuery,
  useGetProfileFollowInfoQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
  useGetPendingRequestsQuery,
  useGetSentRequestsQuery,
} = userApiSlice;
