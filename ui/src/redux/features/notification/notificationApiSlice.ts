import { apiSlice } from '../../apiSlice';

export interface Notification {
    ID: string;
    UserID: string;
    ActorUserID: string;
    PostID?: string;
    NotificationType: 'LIKE' | 'MESSAGE' | 'FOLLOW' | 'SYSTEM';
    IsRead: boolean;
    CreatedAt: string;
    Actor?: {
        ID: string;
        UserName: string;
        ProfilePictureUrl?: string;
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
            providesTags: ['Notification'],
        }),
        markAsRead: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `notifications/${id}/read`,
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllAsRead: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: `notifications/read-all`,
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} = notificationApiSlice;
