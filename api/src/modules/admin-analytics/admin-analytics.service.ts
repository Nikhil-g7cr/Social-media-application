import { Injectable, Inject } from '@nestjs/common';
import { AdminAnalyticsAbstractSvc } from './abstract/admin-analytics.abstract';
import { AdminAnalyticsAbsSQLDAO } from 'src/databse/mssql/abstract/admin-analytics.abstract.mssql';
import { AppResponse } from 'src/shared/appresponse.shared';

@Injectable()
export class AdminAnalyticsService implements AdminAnalyticsAbstractSvc {
    constructor(
        @Inject(AdminAnalyticsAbsSQLDAO) private _analyticsDAO: AdminAnalyticsAbsSQLDAO
    ) {}

    async getDashboardSummary(): Promise<AppResponse> {
        return await this._analyticsDAO.getDashboardSummary();
    }

    async getGrowthAnalytics(): Promise<AppResponse> {
        return await this._analyticsDAO.getGrowthAnalytics();
    }

    async getContentDistribution(): Promise<AppResponse> {
        return await this._analyticsDAO.getContentDistribution();
    }

    async getTopUsers(): Promise<AppResponse> {
        return await this._analyticsDAO.getTopUsers();
    }

    async getRecentActivity(): Promise<AppResponse> {
        return await this._analyticsDAO.getRecentActivity();
    }
}
