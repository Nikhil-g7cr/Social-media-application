import { apiSlice } from '../../apiSlice';

export const adminAnalyticsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardSummary: builder.query<any, void>({
            query: () => ({ url: 'admin-analytics/summary' }),
            transformResponse: (response: any) => response?.data || response,
            providesTags: ['AdminAnalytics'] as any,
        }),
        getGrowthAnalytics: builder.query<any, void>({
            query: () => ({ url: 'admin-analytics/growth' }),
            transformResponse: (response: any) => response?.data || response,
            providesTags: ['AdminAnalytics'] as any,
        }),
        getContentDistribution: builder.query<any, void>({
            query: () => ({ url: 'admin-analytics/content-distribution' }),
            transformResponse: (response: any) => response?.data || response,
            providesTags: ['AdminAnalytics'] as any,
        }),
        getTopUsers: builder.query<any, void>({
            query: () => ({ url: 'admin-analytics/users/top' }),
            transformResponse: (response: any) => response?.data || response,
            providesTags: ['AdminAnalytics'] as any,
        }),
        getRecentActivity: builder.query<any, void>({
            query: () => ({ url: 'admin-analytics/activity' }),
            transformResponse: (response: any) => response?.data || response,
            providesTags: ['AdminAnalytics'] as any,
        }),
        getPendingFileRequests: builder.query<any, void>({
            query: () => ({ url: 'gallery/requests/pending-count' }),
            transformResponse: (response: any) => response?.data || response,
        }),
    }),
});

export const {
    useGetDashboardSummaryQuery,
    useGetGrowthAnalyticsQuery,
    useGetContentDistributionQuery,
    useGetTopUsersQuery,
    useGetRecentActivityQuery,
    useGetPendingFileRequestsQuery,
} = adminAnalyticsApiSlice;
