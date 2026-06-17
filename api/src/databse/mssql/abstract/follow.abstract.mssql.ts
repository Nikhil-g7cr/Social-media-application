import { Follow } from '../models';

export abstract class FollowAbstractSQLDao {
  abstract create(data: Partial<Follow>): Promise<Follow>;
  abstract findOne(
    followerId: string,
    followingId: string,
  ): Promise<Follow | null>;
  abstract delete(followerId: string, followingId: string): Promise<number>;
  abstract getFollowers(userId: string): Promise<Follow[]>;
  abstract getFollowing(userId: string): Promise<Follow[]>;
  abstract countFollowers(userId: string): Promise<number>;
  abstract countFollowing(userId: string): Promise<number>;
  abstract isFollowing(
    followerId: string,
    followingId: string,
  ): Promise<boolean>;
}
