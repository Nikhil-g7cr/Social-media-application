import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Inject,
} from '@nestjs/common';
import { UserAbsSQLDAO } from 'src/databse/mssql/abstract/user.abstract.mssql';
import { FollowSQLDao } from 'src/databse/mssql/dao/follow.dao';
import { UserSQLDao } from 'src/databse/mssql/dao/user.dao';
import { NotificationService } from '../notification/notification.service';



@Injectable()
export class FollowService {
    constructor(
        private readonly followDao: FollowSQLDao,
        @Inject(UserAbsSQLDAO)private readonly userDao: UserSQLDao,
        private readonly notificationService: NotificationService,
    ) {}

    async followUser(
        followerId: string,
        followingId: string,
    ) {
      
        if (followerId === followingId) {
            throw new BadRequestException(
                'You cannot follow yourself',
            );
        }

        const user = await this.userDao.getUserByID(followingId);

        if (!user) {
            throw new NotFoundException(
                'User not found',
            );
        }

        const alreadyFollowing =
            await this.followDao.findOne(
                followerId,
                followingId,
            );

        if (alreadyFollowing) {
            throw new BadRequestException(
                'Already following this user',
            );
        }

        const followRecord = await this.followDao.create({
            FollowerID: followerId,
            FollowingID: followingId,
        });

        // Notify the followed user
        await this.notificationService.createNotification({
            userId: followingId,
            actorUserId: followerId,
            type: 'FOLLOW'
        });

        return followRecord;
    }

    async unfollowUser(
        followerId: string,
        followingId: string,
    ) {
        const follow =
            await this.followDao.findOne(
                followerId,
                followingId,
            );

        if (!follow) {
            throw new BadRequestException(
                'You are not following this user',
            );
        }

        await this.followDao.delete(
            followerId,
            followingId,
        );

        return {
            success: true,
            message: 'User unfollowed successfully',
        };
    }

    async getFollowers(userId: string) {
      
        return this.followDao.getFollowers(userId);
    }

    async getFollowing(userId: string) {
        return this.followDao.getFollowing(userId);
    }

    async getFollowCounts(userId: string) {
        const [followersCount, followingCount] =
            await Promise.all([
                this.followDao.countFollowers(userId),
                this.followDao.countFollowing(userId),
            ]);

        return {
            followersCount,
            followingCount,
        };
    }

    async isFollowing(
        followerId: string,
        followingId: string,
    ) {
        const isFollowing =
            await this.followDao.isFollowing(
                followerId,
                followingId,
            );

        return {
            isFollowing,
        };
    }

    async getProfileFollowInfo(
    currentUserId: string,
    profileUserId: string,
) {
    const [
        followersCount,
        followingCount,
        isFollowing,
    ] = await Promise.all([
        this.followDao.countFollowers(profileUserId),
        this.followDao.countFollowing(profileUserId),
        this.followDao.isFollowing(
            currentUserId,
            profileUserId,
        ),
    ]);

    return {
        followersCount,
        followingCount,
        isFollowing,
    };
}
}