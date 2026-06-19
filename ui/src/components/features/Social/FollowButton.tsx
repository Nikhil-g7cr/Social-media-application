import React from 'react';
import { useGetProfileFollowInfoQuery, useFollowUserMutation, useUnfollowUserMutation } from '../../../redux/features/user/userApiSlice';
import { useAppSelector } from '../../../redux/hooks';

interface FollowButtonProps {
  userId: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: profileFollowInfo, isLoading } = useGetProfileFollowInfoQuery(userId, {
    skip: !userId,
  });

  const [followUser, { isLoading: isFollowingMutationLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingMutationLoading }] = useUnfollowUserMutation();

  const isFollowing = profileFollowInfo?.isFollowing || false;
  const isMe = user?.id === userId;

  if (isMe) {
    return null; // Don't show follow button for your own profile
  }

  const handleToggleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(userId).unwrap();
      } else {
        await followUser(userId).unwrap();
      }
    } catch (error) {
      console.error('Failed to toggle follow status:', error);
    }
  };

  const isButtonLoading = isLoading || isFollowingMutationLoading || isUnfollowingMutationLoading;

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isButtonLoading}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isFollowing
          ? 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
      }`}
    >
      {isButtonLoading ? (
        <span className="opacity-70">Wait...</span>
      ) : isFollowing ? (
        <span className="group-hover:hidden">Following</span>
      ) : (
        <span>Follow</span>
      )}
    </button>
  );
};

export default FollowButton;
