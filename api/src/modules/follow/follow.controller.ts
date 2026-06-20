import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { FollowService } from './follow.service';



@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
    constructor(
        private readonly followService: FollowService,
    ) {}

    @Post(':userId')
    async followUser(
        @Req() req,
        @Param('userId') userId: string,
    ) {

        console.log('Current User:', req.user);
console.log('Target User:', userId);
        return this.followService.followUser(
            req.user.sub,
            userId,
        );
    }

    @Delete(':userId')
    async unfollowUser(
        @Req() req,
        @Param('userId') userId: string,
    ) {
        return this.followService.unfollowUser(
            req.user.sub,
            userId,
        );
    }

    @Get('followers/:userId')
    async getFollowers(
        @Param('userId') userId: string,
    ) {
        return this.followService.getFollowers(
            userId,
        );
    }

    @Get('following/:userId')
    async getFollowing(
        @Param('userId') userId: string,
    ) {
        return this.followService.getFollowing(
            userId,
        );
    }

    @Get('status/:userId')
    async isFollowing(
        @Req() req,
        @Param('userId') userId: string,
    ) {
        return this.followService.isFollowing(
            req.user.sub,
            userId,
        );
    }

    @Get('profile/:userId')
    async getProfileFollowInfo(
        @Req() req,
        @Param('userId') userId: string,
    ) {
        return this.followService.getProfileFollowInfo(
            req.user.sub,
            userId,
        );
    }

    @Post('accept/:followerId')
    async acceptFollowRequest(
        @Req() req,
        @Param('followerId') followerId: string,
    ) {
        return this.followService.acceptFollowRequest(
            followerId,
            req.user.sub,
        );
    }

    @Post('reject/:followerId')
    async rejectFollowRequest(
        @Req() req,
        @Param('followerId') followerId: string,
    ) {
        return this.followService.rejectFollowRequest(
            followerId,
            req.user.sub,
        );
    }

    @Get('requests')
    async getPendingRequests(
        @Req() req,
    ) {
        return this.followService.getPendingRequests(
            req.user.sub,
        );
    }
}