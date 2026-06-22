import { Spin, Alert, Typography, Button } from 'antd';
import { RefreshCw, Users, FileText, MessageSquare, HardDrive, MessageCircle, Heart, UserMinus } from 'lucide-react';
import { 
    useGetDashboardSummaryQuery, 
    useGetGrowthAnalyticsQuery, 
    useGetContentDistributionQuery, 
    useGetTopUsersQuery, 
    useGetRecentActivityQuery 
} from '../../../redux/features/adminAnalytics/adminAnalyticsApiSlice';

import StatisticsCards from './components/StatisticsCards';
import GrowthCharts from './components/GrowthCharts';
import ReportsOverview from './components/ReportsOverview';
import TopUsers from './components/TopUsers';
import ActivityFeed from './components/ActivityFeed';


const { Title } = Typography;

const AdminAnalytics = () => {
    const { data: summary, isLoading: loadingSummary, isFetching: fetchingSummary, error: summaryError, refetch: refetchSummary } = useGetDashboardSummaryQuery(undefined, { pollingInterval: 60000 });
    const { data: growth, refetch: refetchGrowth } = useGetGrowthAnalyticsQuery(undefined, { pollingInterval: 60000 });
    const { data: contentDist, refetch: refetchContentDist } = useGetContentDistributionQuery(undefined, { pollingInterval: 60000 });
    const { data: topUsers = [], refetch: refetchTopUsers } = useGetTopUsersQuery(undefined, { pollingInterval: 60000 });
    const { data: activity, refetch: refetchActivity } = useGetRecentActivityQuery(undefined, { pollingInterval: 60000 });

    const loading = loadingSummary;
    const isFetching = fetchingSummary;
    const error = summaryError;

    const fetchData = () => {
        refetchSummary();
        refetchGrowth();
        refetchContentDist();
        refetchTopUsers();
        refetchActivity();
    };

    if (loading && !summary) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px]">
                <Spin size="large" />
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

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
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

            {/* Top Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatisticsCards
                    title="Total Users"
                    value={summary?.totalUsers || 0}
                    icon={<Users className="text-blue-500" size={24} />}
                    trend={`+${summary?.newUsersToday || 0} today`}
                    trendUp={true}
                    color="bg-blue-50"
                />
                <StatisticsCards
                    title="Active Users"
                    value={summary?.activeUsers || 0}
                    icon={<Users className="text-green-500" size={24} />}
                    color="bg-green-50"
                />
                <StatisticsCards
                    title="Deleted Users"
                    value={summary?.deletedUsers || 0}
                    icon={<UserMinus className="text-red-500" size={24} />}
                    color="bg-red-50"
                />
                <StatisticsCards
                    title="Total Posts"
                    value={summary?.totalPosts || 0}
                    icon={<FileText className="text-indigo-500" size={24} />}
                    trend={`+${summary?.newPostsToday || 0} today`}
                    trendUp={true}
                    color="bg-indigo-50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatisticsCards
                    title="Total Comments"
                    value={summary?.totalComments || 0}
                    icon={<MessageSquare className="text-purple-500" size={24} />}
                    color="bg-purple-50"
                />
                <StatisticsCards
                    title="Total Likes"
                    value={summary?.totalLikes || 0}
                    icon={<Heart className="text-pink-500" size={24} />}
                    color="bg-pink-50"
                />
                <StatisticsCards
                    title="Total Conversations"
                    value={summary?.totalConversations || 0}
                    icon={<MessageCircle className="text-yellow-500" size={24} />}
                    color="bg-yellow-50"
                />
                <StatisticsCards
                    title="Total Messages"
                    value={summary?.totalMessages || 0}
                    icon={<MessageSquare className="text-teal-500" size={24} />}
                    color="bg-teal-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Growth Charts spanning 2 columns */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Growth & Engagement</h2>
                    <GrowthCharts growthData={growth} />
                </div>

                {/* Reports Overview spanning 1 column */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Moderation Status</h2>
                    <ReportsOverview
                        total={summary?.totalReports || 0}
                        pending={summary?.pendingReports || 0}
                        resolved={summary?.resolvedReports || 0}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Top Users */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Most Active Users</h2>
                    <TopUsers users={topUsers} />
                </div>

                {/* Activity Feed */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Live Activity Feed</h2>
                    <ActivityFeed activity={activity} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Content Distribution (just a simple stat card for now, or pie chart) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Distribution</h2>
                    <div className="flex justify-around items-center h-48">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{contentDist?.textPostsCount || 0}</div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider mt-1">Text Posts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-indigo-600">
                                {contentDist?.mediaCounts?.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0) || 0}
                            </div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider mt-1">Media Uploads</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Storage Overview</h2>
                    <div className="flex items-center gap-6 h-48">
                        <div className="p-4 bg-blue-50 rounded-full">
                            <HardDrive size={48} className="text-blue-500" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-800">{summary?.totalMediaUploaded || 0}</div>
                            <div className="text-sm text-gray-500 mt-1">Total Files in Azure Blob Storage</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminAnalytics;
