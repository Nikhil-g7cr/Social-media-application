import { apiSlice } from '../../apiSlice';

export interface Notification {
    ID: string;
    UserID: string;
    ActorUserID: string;
    PostID?: string;
    NotificationType: 'LIKE' | 'MESSAGE' | 'FOLLOW' | 'SYSTEM' | 'FOLLOW_REQUEST' | 'FOLLOW_ACCEPTED';
    IsRead: boolean;
    CreatedAt: string;
    Actor?: {
        ID: string;
        UserName: string;
        avatarUrl?: string;
    };
    Post?: {
        ID: string;
        Content?: string;
    };
}

export const notificationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<Notification[], void>({
            query: () => ({ url: 'notifications' }),
            transformResponse: (response: any) => {
                const notifications = response?.data || response || [];
                return notifications.map((n: any) => ({
                    ...n,
                    Actor: n.Actor ? {
                        ...n.Actor,
                        avatarUrl: n.Actor.ProfilePictureUrl || n.Actor.avatarUrl
                    } : undefined
                }));
            },
            providesTags: ['Notification'],
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const { initializeSocket } = await import('../../../utils/socket');
                const socket = initializeSocket();
                try {
                    await cacheDataLoaded;
                    const listener = (newNotification: Notification) => {
                        updateCachedData((draft) => {
                            if (!draft.find(n => n.ID === newNotification.ID)) {
                                draft.unshift(newNotification);
                            }
                        });
                    };
                    socket.on('newNotification', listener);
                } catch {}
                await cacheEntryRemoved;
            }
        }),
        markAsRead: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `notifications/${id}/read`,
                method: 'PUT',
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationApiSlice.util.updateQueryData('getNotifications', undefined, (draft) => {
                        const notification = draft.find(n => n.ID === id);
                        if (notification) {
                            notification.IsRead = true;
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        markAllAsRead: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: `notifications/read-all`,
                method: 'PUT',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationApiSlice.util.updateQueryData('getNotifications', undefined, (draft) => {
                        draft.forEach(n => { n.IsRead = true; });
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        deleteNotification: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `notifications/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationApiSlice.util.updateQueryData('getNotifications', undefined, (draft) => {
                        const index = draft.findIndex(n => n.ID === id);
                        if (index !== -1) draft.splice(index, 1);
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        clearAllNotifications: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: `notifications/clear-all`,
                method: 'DELETE',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationApiSlice.util.updateQueryData('getNotifications', undefined, (draft) => {
                        draft.splice(0, draft.length);
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
    useClearAllNotificationsMutation,
} = notificationApiSlice;
