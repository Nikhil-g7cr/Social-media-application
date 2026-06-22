import { Module } from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsAbstractSvc } from './abstract/admin-analytics.abstract';

@Module({
    imports: [],
    controllers: [AdminAnalyticsController],
    providers: [
        {
            provide: AdminAnalyticsAbstractSvc,
            useClass: AdminAnalyticsService
        }
    ],
    exports: [AdminAnalyticsAbstractSvc]
})
export class AdminAnalyticsModule {}
