import { Injectable, Inject } from '@nestjs/common';
import { Follow, FollowStatus } from '../models/follow.model';
import { MsSqlConstants } from '../connection/constant.mssql';
import { FollowAbstractSQLDao } from '../abstract/follow.abstract.mssql';
import { FollowMessage } from '../../../core/enums/follow.message.enum';

@Injectable()
export class FollowSQLDao implements FollowAbstractSQLDao {
  constructor(
    @Inject(MsSqlConstants.FOLLOW)
    private readonly followModel: typeof Follow,
  ) {}

  async create(data: Partial<Follow>): Promise<Follow> {
    try {
      return await this.followModel.create(data as Follow);
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E1);
    }
  }

  async findOne(
    followerId: string,
    followingId: string,
  ): Promise<Follow | null> {
    try {
      return await this.followModel.findOne({
        where: {
          FollowerID: followerId,
          FollowingID: followingId,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E2);
    }
  }

  async delete(followerId: string, followingId: string): Promise<number> {
    try {
      return await this.followModel.destroy({
        where: {
          FollowerID: followerId,
          FollowingID: followingId,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E3);
    }
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    try {
      return await this.followModel.findAll({
        where: {
          FollowingID: userId,
          Status: FollowStatus.ACCEPTED,
        },
        include: ['Follower'],
      });
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E4);
    }
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    try {
      return await this.followModel.findAll({
        where: {
          FollowerID: userId,
          Status: FollowStatus.ACCEPTED,
        },
        include: ['Following'],
      });
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E5);
    }
  }

  async countFollowers(userId: string): Promise<number> {
    try {
      return await this.followModel.count({
        where: {
          FollowingID: userId,
          Status: FollowStatus.ACCEPTED,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E6);
    }
  }

  async countFollowing(userId: string): Promise<number> {
    try {
      return await this.followModel.count({
        where: {
          FollowerID: userId,
          Status: FollowStatus.ACCEPTED,
        },
      });
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E7);
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const follow = await this.followModel.findOne({
        where: {
          FollowerID: followerId,
          FollowingID: followingId,
          Status: FollowStatus.ACCEPTED,
        },
      });

      return !!follow;
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E8);
    }
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    try {
      const follows = await this.followModel.findAll({
        where: {
          FollowerID: userId,
          Status: FollowStatus.ACCEPTED,
        },
        attributes: ['FollowingID'],
      });

      return follows.map((follow) => follow.FollowingID);
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E9);
    }
  }

  async updateStatus(
    followerId: string,
    followingId: string,
    status: string,
  ): Promise<number> {
    try {
      const [affectedCount] = await this.followModel.update(
        { Status: status },
        {
          where: {
            FollowerID: followerId,
            FollowingID: followingId,
          },
        },
      );
      return affectedCount;
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E10);
    }
  }

  async getPendingRequests(userId: string): Promise<Follow[]> {
    try {
      return await this.followModel.findAll({
        where: {
          FollowingID: userId,
          Status: FollowStatus.PENDING,
        },
        include: ['Follower'],
      });
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E11);
    }
  }

  async getSentRequests(userId: string): Promise<Follow[]> {
    try {
      return await this.followModel.findAll({
        where: {
          FollowerID: userId,
          Status: FollowStatus.PENDING,
        },
        include: ['Following'],
      });
    } catch (error: any) {
      throw new Error(error?.message || FollowMessage.E12);
    }
  }
}
