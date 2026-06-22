import { AppResponse } from 'src/shared/appresponse.shared';

export abstract class AdminAnalyticsAbsSQLDAO {
  abstract getDashboardSummary(): Promise<AppResponse>;
  abstract getGrowthAnalytics(): Promise<AppResponse>;
  abstract getContentDistribution(): Promise<AppResponse>;
  abstract getTopUsers(): Promise<AppResponse>;
  abstract getRecentActivity(): Promise<AppResponse>;
}
