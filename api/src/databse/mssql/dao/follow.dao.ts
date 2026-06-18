import { Injectable, Inject } from '@nestjs/common';
import { Follow } from '../models/follow.model';
import { MsSqlConstants } from '../connection/constant.mssql';
import { FollowAbstractSQLDao } from '../abstract/follow.abstract.mssql';

@Injectable()
export class FollowSQLDao implements FollowAbstractSQLDao {
    constructor(
        @Inject(MsSqlConstants.FOLLOW)
        private readonly followModel: typeof Follow,
    ) {}

    async create(data: Partial<Follow>): Promise<Follow> {
        return this.followModel.create(data as Follow);
    }

    async findOne(followerId: string, followingId: string): Promise<Follow | null> {
        return this.followModel.findOne({
            where: {
                FollowerID: followerId,
                FollowingID: followingId,
            },
        });
    }

    async delete(followerId: string, followingId: string): Promise<number> {
        return this.followModel.destroy({
            where: {
                FollowerID: followerId,
                FollowingID: followingId,
            },
        });
    }

    async getFollowers(userId: string): Promise<Follow[]> {
        return this.followModel.findAll({
            where: {
                FollowingID: userId,
            },
            include: ['Follower'],
            attributes: [
            'ID',
            'UserName',
            'FullName',
            'ProfilePictureUrl',
            'Bio',
        ],
        });
    }

    async getFollowing(userId: string): Promise<Follow[]> {
        return this.followModel.findAll({
            where: {
                FollowerID: userId,
            },
            include: ['Following'],
            attributes: [
            'ID',
            'UserName',
            'FullName',
            'ProfilePictureUrl',
            'Bio',
        ],
        });
    }

    async countFollowers(userId: string): Promise<number> {
        return this.followModel.count({
            where: {
                FollowingID: userId,
            },
        });
    }

    async countFollowing(userId: string): Promise<number> {
        return this.followModel.count({
            where: {
                FollowerID: userId,
            },
        });
    }

    async isFollowing(
        followerId: string,
        followingId: string,
    ): Promise<boolean> {
        const follow = await this.followModel.findOne({
            where: {
                FollowerID: followerId,
                FollowingID: followingId,
            },
        });

        return !!follow;
    }

    async getFollowingIds(
  userId: string,
): Promise<string[]> {

  const follows =
    await this.followModel.findAll({
      where: {
        FollowerID: userId,
      },
      attributes: [
        'FollowingID',
      ],
    });

  return follows.map(
    (follow) =>
      follow.FollowingID,
  );
}
}