import React from 'react';
import { Alert, Button } from 'antd';
import { RefreshCw, Users, FileText, MessageSquare, HardDrive, MessageCircle, Heart, UserMinus, AlertTriangle } from 'lucide-react';
import { 
    useGetDashboardSummaryQuery, 
    useGetGrowthAnalyticsQuery, 
    useGetContentDistributionQuery, 
    useGetTopUsersQuery, 
    useGetRecentActivityQuery,
    useGetPendingFileRequestsQuery
} from '../../../redux/features/adminAnalytics/adminAnalyticsApiSlice';
import { useAppSelector } from '../../../redux/hooks';

import StatisticsCards from './components/StatisticsCards';
import GrowthCharts from './components/GrowthCharts';
import ReportsOverview from './components/ReportsOverview';
import TopUsers from './components/TopUsers';
import ActivityFeed from './components/ActivityFeed';
import EngagementChart from './components/EngagementChart';
import { AnalyticsCardSkeleton } from '../../../shared/shared-components/Skeleton';

interface AdminAnalyticsProps {
    /** Called when the user clicks "View All Reports →" inside the analytics panel */
    onNavigateToReports?: () => void;
    /** Called when the user clicks the Pending File Requests card */
    onNavigateToFileRequests?: () => void;
}

const toNumber = (value: unknown): number => {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : 0;
};

const toArray = <T,>(value: T[] | undefined | null): T[] => Array.isArray(value) ? value : [];

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ onNavigateToReports, onNavigateToFileRequests }) => {
    const onlineUserCount = useAppSelector((state) => state.onlineUsers.onlineUserIds.length);
    const { data: summary, isLoading: loadingSummary, isFetching: fetchingSummary, error: summaryError, refetch: refetchSummary } = useGetDashboardSummaryQuery(undefined, { pollingInterval: 60000 });
    const { data: growth, refetch: refetchGrowth } = useGetGrowthAnalyticsQuery(undefined, { pollingInterval: 60000 });
    const { data: contentDist, refetch: refetchContentDist } = useGetContentDistributionQuery(undefined, { pollingInterval: 60000 });
    const { data: topUsersData = [], refetch: refetchTopUsers } = useGetTopUsersQuery(undefined, { pollingInterval: 60000 });
    const { data: activity, refetch: refetchActivity } = useGetRecentActivityQuery(undefined, { pollingInterval: 60000 });
    const { data: fileRequestsData, refetch: refetchFileRequests } = useGetPendingFileRequestsQuery(undefined, { pollingInterval: 60000 });

    const loading = loadingSummary;
    const isFetching = fetchingSummary;
    const error = summaryError;

    const fetchData = () => {
        refetchSummary();
        refetchGrowth();
        refetchContentDist();
        refetchTopUsers();
        refetchActivity();
        refetchFileRequests();
    };

    if (loading && !summary) {
        return (
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AnalyticsCardSkeleton count={4} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AnalyticsCardSkeleton count={4} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert message="Error" description="Failed to load dashboard data. Please try again later." type="error" showIcon />
                <Button onClick={fetchData} className="mt-4" icon={<RefreshCw size={16} />}>Retry</Button>
            </div>
        );
    }

    const dashboardSummary = {
        totalUsers: toNumber(summary?.totalUsers),
        // Presence comes from the Socket.IO sync, rather than the persisted
        // IsActive account flag, so this always represents users online now.
        activeUsers: onlineUserCount,
        deletedUsers: toNumber(summary?.deletedUsers),
        newUsersToday: toNumber(summary?.newUsersToday),
        totalPosts: toNumber(summary?.totalPosts),
        newPostsToday: toNumber(summary?.newPostsToday),
        totalComments: toNumber(summary?.totalComments),
        totalLikes: toNumber(summary?.totalLikes),
        totalMessages: toNumber(summary?.totalMessages),
        totalReports: toNumber(summary?.totalReports),
        pendingReports: toNumber(summary?.pendingReports),
        resolvedReports: toNumber(summary?.resolvedReports),
        totalMediaUploaded: toNumber(summary?.totalMediaUploaded),
    };
    const mediaCounts = toArray<any>(contentDist?.mediaCounts);
    const topUsers = toArray<any>(topUsersData);
    const fileRequestCount = toNumber(fileRequestsData?.count);
    const textPostsCount = toNumber(contentDist?.textPostsCount);
    const totalMediaUploads = mediaCounts.reduce((acc: number, curr: any) => acc + toNumber(curr.count), 0);

    return (
        <div className="w-full h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 m-0">Platform Overview</h1>
                    <p className="text-gray-500 mt-1">Comprehensive view of your application's health and metrics.</p>
                </div>
                <Button
                    type="primary"
                    icon={<RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />}
                    onClick={fetchData}
                    loading={isFetching}
                    className="bg-blue-600 flex items-center gap-2"
                >
                    Refresh Dashboard
                </Button>
            </div>

            {/* ── Row 1: Users KPI cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatisticsCards
                    title="Total Users"
                    value={dashboardSummary.totalUsers}
                    icon={<Users className="text-blue-500" size={24} />}
                    trend={`+${dashboardSummary.newUsersToday} today`}
                    trendUp={true}
                    color="bg-blue-50"
                />
                <StatisticsCards
                    title="Users Online"
                    value={dashboardSummary.activeUsers}
                    icon={<Users className="text-green-500" size={24} />}
                    trend="Live now"
                    trendUp={true}
                    color="bg-green-50"
                />
                <StatisticsCards
                    title="Deleted Users"
                    value={dashboardSummary.deletedUsers}
                    icon={<UserMinus className="text-red-500" size={24} />}
                    color="bg-red-50"
                />
                {/* Pending Reports — Moderation Queue KPI (plan requirement) */}
                <StatisticsCards
                    title="Pending Reports"
                    value={dashboardSummary.pendingReports}
                    icon={<AlertTriangle className="text-amber-500" size={24} />}
                    trend={dashboardSummary.pendingReports > 0 ? 'Needs attention' : 'All clear'}
                    trendUp={false}
                    color="bg-amber-50"
                />
            </div>
            
            {/* ── Row 1.5: File Requests KPI ────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatisticsCards
                    title="Pending File Requests"
                    value={fileRequestCount}
                    icon={<HardDrive className="text-orange-500" size={24} />}
                    trend={fileRequestCount > 0 ? 'Review needed' : 'All clear'}
                    trendUp={false}
                    color="bg-orange-50"
                    onClick={onNavigateToFileRequests}
                />
            </div>

            {/* ── Row 2: Content Volume KPI cards ───────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatisticsCards
                    title="Total Posts"
                    value={dashboardSummary.totalPosts}
                    icon={<FileText className="text-indigo-500" size={24} />}
                    trend={`+${dashboardSummary.newPostsToday} today`}
                    trendUp={true}
                    color="bg-indigo-50"
                />
                <StatisticsCards
                    title="Total Comments"
                    value={dashboardSummary.totalComments}
                    icon={<MessageSquare className="text-purple-500" size={24} />}
                    color="bg-purple-50"
                />
                <StatisticsCards
                    title="Total Likes"
                    value={dashboardSummary.totalLikes}
                    icon={<Heart className="text-pink-500" size={24} />}
                    color="bg-pink-50"
                />
                <StatisticsCards
                    title="Total Messages"
                    value={dashboardSummary.totalMessages}
                    icon={<MessageCircle className="text-teal-500" size={24} />}
                    color="bg-teal-50"
                />
            </div>

            {/* ── Row 3: Growth chart + Moderation status ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Growth Line Chart — spanning 2 cols */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">User & Post Growth (Last 30 Days)</h2>
                    <GrowthCharts growthData={growth} />
                </div>

                {/* Moderation Status */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Moderation Status</h2>
                    <ReportsOverview
                        total={dashboardSummary.totalReports}
                        pending={dashboardSummary.pendingReports}
                        resolved={dashboardSummary.resolvedReports}
                        onViewAllReports={onNavigateToReports}
                    />
                </div>
            </div>

            {/* ── Row 4: Engagement Doughnut Chart + Top Users ──────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Top Users Table — spanning 2 cols */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Most Active Users</h2>
                    <TopUsers users={topUsers} />
                </div>

                {/* Engagement Doughnut Chart — plan requirement */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">Engagement Breakdown</h2>
                    <p className="text-xs text-gray-400 mb-4">Split between Posts, Comments & Likes</p>
                    <EngagementChart
                        totalPosts={dashboardSummary.totalPosts}
                        totalComments={dashboardSummary.totalComments}
                        totalLikes={dashboardSummary.totalLikes}
                    />
                </div>
            </div>

            {/* ── Row 5: Content Distribution (chart) + Activity Feed ─────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Live Activity Feed</h2>
                    <ActivityFeed activity={activity} />
                </div>

                {/* Content Distribution + Storage */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Distribution</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FileText className="text-blue-500" size={16} />
                                    <span className="text-sm text-gray-700 font-medium">Text Posts</span>
                                </div>
                                    <span className="text-lg font-bold text-blue-600">{textPostsCount}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="text-indigo-500" size={16} />
                                    <span className="text-sm text-gray-700 font-medium">Media Uploads</span>
                                </div>
                                <span className="text-lg font-bold text-indigo-600">{totalMediaUploads}</span>
                            </div>
                            {mediaCounts.map((m: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <span className="text-sm text-gray-700 font-medium capitalize">{m.MediaType?.toLowerCase() || 'Unknown'}</span>
                                    <span className="text-sm font-bold text-purple-600">{toNumber(m.count)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-600 mb-3">Azure Storage</h3>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-full">
                                <HardDrive size={28} className="text-blue-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{dashboardSummary.totalMediaUploaded}</div>
                                <div className="text-xs text-gray-500 mt-0.5">Total Files in Azure Blob</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
