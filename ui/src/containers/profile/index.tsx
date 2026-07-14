import React, { useState, useMemo, memo, useEffect } from 'react';
import { Settings, Grid, Heart, Bookmark, Edit3, Trash2 } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Avatar from '../../shared/shared-components/Avatar';
import FollowButton from '../../components/features/Social/FollowButton';
import { useAppSelector } from '../../redux/hooks';
import {
  useGetUserByIdQuery,
  useGetProfileFollowInfoQuery,
  useGetFollowersQuery,
  useGetFollowingQuery
} from '../../redux/features/user/userApiSlice';
import { useGetPostsByUserIdQuery, useGetLikedPostsByUserIdQuery, useDeletePostMutation } from '../../redux/features/post/postApiSlice';
import InfiniteScroll from '../../shared/shared-components/InfiniteScroll/index';
import ErrorDisplay from '../../components/errors/ErrorDisplay';
import ConfirmationModal from '../../components/shared/ConfirmationModal';
import { ProfileHeaderSkeleton, UserItemSkeleton, PostGridItemSkeleton } from '../../shared/shared-components/Skeleton';
import ExplorePostCard from '../../components/post/ExplorePostCard';

const UsersModal = memo(({ isOpen, onClose, title, userId, type }: { isOpen: boolean, onClose: () => void, title: string, userId: string, type: 'followers' | 'following' }) => {
  const navigate = useNavigate();

  const { data: followers, isLoading: loadingFollowers } = useGetFollowersQuery(userId, { skip: !isOpen || type !== 'followers' });
  const { data: following, isLoading: loadingFollowing } = useGetFollowingQuery(userId, { skip: !isOpen || type !== 'following' });

  if (!isOpen) return null;

  const users = type === 'followers' ? followers : following;
  const isLoading = type === 'followers' ? loadingFollowers : loadingFollowing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-lg leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {isLoading ? (
            <UserItemSkeleton count={4} />
          ) : users && users.length > 0 ? (
            users.map(u => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-md transition"
                onClick={() => {
                  onClose();
                  navigate(`/profile/${u.id}`);
                }}
              >
                <Avatar url={u.avatarUrl} name={u.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{u.name}</div>
                  <div className="text-sm text-gray-500">@{u.username || u.name.toLowerCase().replace(/\s+/g, '')}</div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <FollowButton userId={u.id} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No {type} found.</div>
          )}
        </div>
      </div>
    </div>
  );
});

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAppSelector((state: any) => state.auth.user);
  const onlineUserIds = useAppSelector((state: any) => state.onlineUsers?.onlineUserIds || []);

  const targetUserId = userId || (currentUser?.id);
  const isCurrentUser = currentUser?.id === targetUserId;

  const { data: userProfile, isLoading: isUserLoading, isError: isUserError, error: userError, refetch: refetchUser } = useGetUserByIdQuery(targetUserId, { skip: !targetUserId });
  const { data: followInfo, isLoading: isFollowInfoLoading, isError: isFollowInfoError, error: followInfoError, refetch: refetchFollowInfo } = useGetProfileFollowInfoQuery(targetUserId, { skip: !targetUserId });

  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts');
  const [page, setPage] = useState(1);
  const likedPostsPage = activeTab === 'liked' ? page : 1;

  const { data: userPostsData, isLoading: isPostsLoading, isFetching: isPostsFetching, isError: isPostsError, error: postsError, refetch: refetchPosts } = useGetPostsByUserIdQuery(
    { userId: targetUserId, page, limit: 10 },
    {
      skip: !targetUserId || activeTab !== 'posts',
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: likedPostsData, isLoading: isLikedPostsLoading, isFetching: isLikedPostsFetching, isError: isLikedPostsError, error: likedPostsError, refetch: refetchLikedPosts } = useGetLikedPostsByUserIdQuery({ userId: targetUserId, page: likedPostsPage, limit: 10 }, { skip: !targetUserId || !isCurrentUser });
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete).unwrap();
      setPostToDelete(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };
  const userPosts = userPostsData?.posts || [];
  const likedPosts = likedPostsData?.posts || [];
  const likedPostsCount = likedPostsData?.totalRecords ?? likedPosts.length;
  const hasMore = activeTab === 'posts' ? (userPostsData?.hasMore || false) : (likedPostsData?.hasMore || false);
  const isFetching = activeTab === 'posts' ? isPostsFetching : isLikedPostsFetching;

  const [modalState, setModalState] = useState<{ isOpen: boolean, type: 'followers' | 'following' }>({ isOpen: false, type: 'followers' });
  // Do not render a temporary "0 Posts" while the first page, containing the
  // API's totalRecords count, is still being fetched.
  const isLoading =
    isUserLoading ||
    isFollowInfoLoading ||
    (activeTab === 'posts' && isPostsLoading);

  const handleTabChange = (tab: 'posts' | 'liked' | 'saved') => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setPage(1);
    }
  };

  useEffect(() => {
    if (!isCurrentUser && activeTab !== 'posts') {
      setActiveTab('posts');
      setPage(1);
    }
  }, [isCurrentUser, activeTab]);

  const profile = useMemo(() => {
    if (!userProfile) return null;
    return {
      id: userProfile.id,
      fullName: userProfile.name || 'Unknown User',
      userName: userProfile.username ? `@${userProfile.username}` : `@${(userProfile.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
      bio: userProfile.bio || 'No bio available',
      avatarUrl: userProfile.avatarUrl,
      stats: {
        // The list is paginated; the API's totalRecords is the full post count.
        posts: userPostsData?.totalRecords ?? 0,
        followers: followInfo?.followersCount || 0,
        following: followInfo?.followingCount || 0,
      }
    };
  }, [userProfile, userPostsData, followInfo]);

  if (isUserError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <ErrorDisplay title="Profile Not Found" error={userError} onRetry={refetchUser} />
      </div>
    );
  }

  if (isLoading || !userProfile || !profile) {
    return <ProfileHeaderSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 pt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Profile Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mt-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative h-32 w-32 rounded-full border-4 border-white bg-white sm:h-40 sm:w-40 shadow-md">
              <Avatar url={profile.avatarUrl} name={profile.fullName} className="h-full w-full rounded-full object-cover" />
              {onlineUserIds.includes(profile.id) && (
                <span className="absolute bottom-2 right-2 block h-6 w-6 rounded-full bg-green-500 ring-4 ring-white"></span>
              )}
            </div>

            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
              <p className="text-gray-500">{profile.userName}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-3 sm:mb-2 sm:mt-0">
            {isCurrentUser ? (
              <>
                <button
                  onClick={() => navigate('/your-activity')}
                  className="flex-1 rounded-md bg-gray-100 text-gray-700 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-200 sm:flex-none transition"
                >
                  Your Activity
                </button>
              </>
            ) : (
              <FollowButton userId={profile.id} />
            )}
          </div>
        </div>

        {/* Name for Mobile View */}
        <div className="mt-4 sm:hidden">
          <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
          <p className="text-gray-500">{profile.userName}</p>
        </div>

        {/* Bio */}
        <div className="mt-4 max-w-2xl">
          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-6 border-y border-gray-200 py-4">
          <div className="flex flex-col items-center sm:flex-row sm:gap-2">
            <span className="font-bold text-gray-900">{profile.stats.posts}</span>
            <span className="text-sm text-gray-500">Posts</span>
          </div>
          {isCurrentUser && (
            <div className="flex flex-col items-center sm:flex-row sm:gap-2">
              <span className="font-bold text-gray-900">{likedPostsCount}</span>
              <span className="text-sm text-gray-500">Liked</span>
            </div>
          )}
          <div
            className="flex flex-col items-center sm:flex-row sm:gap-2 cursor-pointer hover:underline"
            onClick={() => setModalState({ isOpen: true, type: 'followers' })}
          >
            <span className="font-bold text-gray-900">{profile.stats.followers.toLocaleString()}</span>
            <span className="text-sm text-gray-500">Followers</span>
          </div>
          <div
            className="flex flex-col items-center sm:flex-row sm:gap-2 cursor-pointer hover:underline"
            onClick={() => setModalState({ isOpen: true, type: 'following' })}
          >
            <span className="font-bold text-gray-900">{profile.stats.following.toLocaleString()}</span>
            <span className="text-sm text-gray-500">Following</span>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mt-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('posts')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === 'posts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
            >
              <Grid className="h-4 w-4" />
              Posts
            </button>
            {isCurrentUser && (
              <>
                <button
                  onClick={() => handleTabChange('liked')}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === 'liked' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <Heart className="h-4 w-4" />
                  Liked
                </button>
                <button
                  onClick={() => handleTabChange('saved')}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === 'saved' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <Bookmark className="h-4 w-4" />
                  Saved
                </button>
              </>
            )}
          </div>

          {/* Grid Content Area */}
          <InfiniteScroll
            onLoadMore={() => setPage(p => p + 1)}
            hasMore={hasMore}
            isLoading={isFetching}
          >
            <div className="mt-6 columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {activeTab === 'posts' && isPostsError && page === 1 ? (
                <div className="col-span-3 lg:col-span-4 py-10">
                  <ErrorDisplay title="Failed to load posts" error={postsError} onRetry={refetchPosts} />
                </div>
              ) : activeTab === 'posts' && isPostsLoading && page === 1 ? (
                <PostGridItemSkeleton count={6} />
              ) : activeTab === 'posts' && (!userPosts || userPosts.length === 0) ? (
                <div className="col-span-3 lg:col-span-4 text-center py-10 text-gray-500">
                  No posts to show.
                </div>
              ) : activeTab === 'posts' && userPosts ? (
                userPosts.map((post) => (
                  <ExplorePostCard
                    key={post.id}
                    post={post}
                    actions={isCurrentUser ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label="Edit post"
                          className="rounded-full bg-white/90 p-2 text-gray-700 hover:bg-white"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/post/update/${post.id}`);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete post"
                          className="rounded-full bg-red-500/90 p-2 text-white hover:bg-red-600"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPostToDelete(post.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : undefined}
                  />
                ))
              ) : activeTab === 'liked' && isLikedPostsError && page === 1 ? (
                <div className="col-span-3 lg:col-span-4 py-10">
                  <ErrorDisplay title="Failed to load liked posts" error={likedPostsError} onRetry={refetchLikedPosts} />
                </div>
              ) : activeTab === 'liked' && isLikedPostsLoading && page === 1 ? (
                <PostGridItemSkeleton count={6} />
              ) : activeTab === 'liked' && (!likedPosts || likedPosts.length === 0) ? (
                <div className="col-span-3 lg:col-span-4 text-center py-10 text-gray-500">
                  No liked posts yet.
                </div>
              ) : activeTab === 'liked' && likedPosts ? (
                likedPosts.map((post) => (
                  <ExplorePostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="col-span-3 lg:col-span-4 text-center py-10 text-gray-500">
                  Feature coming soon.
                </div>
              )}
            </div>
          </InfiniteScroll>
        </div>
      </div>

      {targetUserId && (
        <UsersModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          title={modalState.type === 'followers' ? 'Followers' : 'Following'}
          userId={targetUserId}
          type={modalState.type}
        />
      )}

      <ConfirmationModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDeletePost}
        title="Delete Post"
        description="Are you sure you want to permanently delete this post and its associated media?"
        confirmText="Delete Post"
        cancelText="Cancel"
        icon="warning"
        isLoading={isDeletingPost}
      />

    </div>
  );
};

export default ProfilePage;
