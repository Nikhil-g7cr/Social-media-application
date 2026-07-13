import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AdminAnalyticsAbstractSvc } from './abstract/admin-analytics.abstract';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/role.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRoles } from '../../core/enums/user.enum';

@ApiTags('Admin Analytics')
@Controller('admin-analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN)
export class AdminAnalyticsController {
    constructor(
        @Inject(AdminAnalyticsAbstractSvc) private _analyticsSvc: AdminAnalyticsAbstractSvc
    ) {}

    @Get('summary')
    @ApiOperation({ summary: 'Get overall dashboard summary statistics' })
    async getDashboardSummary() {
        return await this._analyticsSvc.getDashboardSummary();
    }

    @Get('growth')
    @ApiOperation({ summary: 'Get growth analytics for charts' })
    async getGrowthAnalytics() {
        return await this._analyticsSvc.getGrowthAnalytics();
    }

    @Get('content-distribution')
    @ApiOperation({ summary: 'Get content distribution statistics' })
    async getContentDistribution() {
        return await this._analyticsSvc.getContentDistribution();
    }

    @Get('users/top')
    @ApiOperation({ summary: 'Get top users based on activity' })
    async getTopUsers() {
        return await this._analyticsSvc.getTopUsers();
    }

    @Get('activity')
    @ApiOperation({ summary: 'Get recent activity feed' })
    async getRecentActivity() {
        return await this._analyticsSvc.getRecentActivity();
    }
}
