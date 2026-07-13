import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { PopupPayload } from '../types';
import { useViewPost } from '../hooks/useViewPost';
import PostCard from '../../../post/PostCard';
import { PostCardSkeleton } from '../../../../shared/shared-components/Skeleton';

interface ViewPostScreenProps {
  payload?: PopupPayload;
  onClose: () => void;
}

const ViewPostScreen: React.FC<ViewPostScreenProps> = ({
  payload,
  onClose,
}) => {
  const {
    post,
    isLoading,
    error,
    user,
    onlineUserIds,
    toggleLike,
  } = useViewPost(payload?.postId, payload?.initialPost);

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">
          Post
        </h2>

        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 active:scale-95"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        {isLoading ? (
          <PostCardSkeleton count={1} />
        ) : error || !post ? (
          <div className="flex h-72 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <AlertCircle className="h-7 w-7 text-gray-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Post unavailable
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              We couldn't load this post. It may have been deleted or is no
              longer available.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl animate-in fade-in duration-150">
            <PostCard
              post={post}
              user={user}
              onlineUserIds={onlineUserIds}
              toggleLike={toggleLike}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPostScreen;