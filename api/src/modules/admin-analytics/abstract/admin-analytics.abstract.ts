import { AppResponse } from '../../../shared/appresponse.shared';

export abstract class AdminAnalyticsAbstractSvc {
    abstract getDashboardSummary(): Promise<AppResponse>;
    abstract getGrowthAnalytics(): Promise<AppResponse>;
    abstract getContentDistribution(): Promise<AppResponse>;
    abstract getTopUsers(): Promise<AppResponse>;
    abstract getRecentActivity(): Promise<AppResponse>;
}
