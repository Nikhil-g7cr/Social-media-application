import React from 'react';
import type { PopupPayload } from '../types';
import { useViewPost } from '../hooks/useViewPost';
import PostCard from '../../../post/PostCard';

interface ViewPostScreenProps {
  payload?: PopupPayload;
  onClose: () => void;
}

const ViewPostScreen: React.FC<ViewPostScreenProps> = ({ payload }) => {
  const { post, isLoading, error, user, onlineUserIds, toggleLike } = useViewPost(payload?.postId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Failed to load post. It may have been deleted.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 p-0 sm:p-4 h-full">
      <PostCard
        post={post}
        user={user}
        onlineUserIds={onlineUserIds}
        toggleLike={toggleLike}
        compact={true}
      />
    </div>
  );
};

export default ViewPostScreen;
