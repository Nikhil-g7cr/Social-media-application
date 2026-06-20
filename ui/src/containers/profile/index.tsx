import React, { useState } from 'react';
import { Settings, MapPin, Calendar, Grid, Heart, Bookmark } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import PostImage from '../../shared/shared-components/PostImage';
import { useAppSelector } from '../../redux/hooks';
import { 
  useGetUserByIdQuery, 
  useGetProfileFollowInfoQuery,
  useGetFollowersQuery,
  useGetFollowingQuery
} from '../../redux/features/user/userApiSlice';
import { useGetPostsByUserIdQuery, useGetLikedPostsByUserIdQuery } from '../../redux/features/post/postApiSlice';
import { Edit3 } from 'lucide-react';

const UsersModal = ({ isOpen, onClose, title, userId, type }: { isOpen: boolean, onClose: () => void, title: string, userId: string, type: 'followers' | 'following' }) => {
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
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
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
                <img src={u.avatarUrl || u.image_url || `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=random`} alt={u.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-gray-900">{u.name}</div>
                  <div className="text-sm text-gray-500">@{u.username || u.name.toLowerCase().replace(/\s+/g, '')}</div>
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
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAppSelector((state: any) => state.auth.user);
  const onlineUserIds = useAppSelector((state: any) => state.onlineUsers?.onlineUserIds || []);
  
  const targetUserId = userId || (currentUser?.id);

  const { data: userProfile, isLoading: isUserLoading } = useGetUserByIdQuery(targetUserId, { skip: !targetUserId });
  const { data: followInfo, isLoading: isFollowInfoLoading } = useGetProfileFollowInfoQuery(targetUserId, { skip: !targetUserId });
  const { data: userPosts, isLoading: isPostsLoading } = useGetPostsByUserIdQuery(targetUserId, { skip: !targetUserId });
  const { data: likedPosts, isLoading: isLikedPostsLoading } = useGetLikedPostsByUserIdQuery(targetUserId, { skip: !targetUserId });

  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts');
  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'followers' | 'following'}>({ isOpen: false, type: 'followers' });

  const isCurrentUser = currentUser?.id === targetUserId;
  const isLoading = isUserLoading || isFollowInfoLoading;

  if (isLoading || !userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const profile = {
    id: userProfile.id,
    fullName: userProfile.name || 'Unknown User',
    userName: userProfile.username ? `@${userProfile.username}` : `@${(userProfile.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
    bio: userProfile.bio || 'No bio available',
    avatarUrl: userProfile.avatarUrl || userProfile.image_url || `https://ui-avatars.com/api/?name=${userProfile.name || 'User'}&background=random`,
    stats: {
      posts: userPosts ? userPosts.length : 0,
      followers: followInfo?.followersCount || 0,
      following: followInfo?.followingCount || 0,
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 pt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mt-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative h-32 w-32 rounded-full border-4 border-white bg-white sm:h-40 sm:w-40 shadow-md">
              <PostImage mediaUrl={profile.avatarUrl} className="h-full w-full rounded-full object-cover" />
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
            {isCurrentUser && (
              <button 
                onClick={() => navigate('/profile/update')}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:flex-none transition"
              >
                Edit Profile
              </button>
            )}
            <button className="rounded-md bg-white p-2 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
              <Settings className="h-5 w-5" />
            </button>
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
          <div className="flex flex-col items-center sm:flex-row sm:gap-2">
            <span className="font-bold text-gray-900">{likedPosts?.length || 0}</span>
            <span className="text-sm text-gray-500">Liked</span>
          </div>
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
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === 'posts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
            >
              <Grid className="h-4 w-4" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === 'liked' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
            >
              <Heart className="h-4 w-4" />
              Liked
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === 'saved' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
            >
              <Bookmark className="h-4 w-4" />
              Saved
            </button>
          </div>

          {/* Grid Content Area */}
          <div className="mt-6 grid grid-cols-3 gap-1 sm:gap-4 lg:grid-cols-4">
            {activeTab === 'posts' && isPostsLoading ? (
              <div className="col-span-3 lg:col-span-4 text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : activeTab === 'posts' && (!userPosts || userPosts.length === 0) ? (
              <div className="col-span-3 lg:col-span-4 text-center py-10 text-gray-500">
                No posts to show.
              </div>
            ) : activeTab === 'posts' && userPosts ? (
              userPosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square bg-gray-200 rounded-md overflow-hidden group cursor-pointer relative"
                >
                  {post.mediaUrl ? (
                    <PostImage mediaUrl={post.mediaUrl} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full p-4 flex items-center justify-center text-center bg-gray-100 text-sm text-gray-700 font-medium">
                      {post.content && post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center gap-4 text-white">
                    <div className="flex items-center gap-4 font-semibold">
                      <span className="flex items-center gap-1"><Heart className="w-5 h-5 fill-white" /> {post.likes || 0}</span>
                    </div>
                    {isCurrentUser && (
                      <button 
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/40 px-3 py-1 rounded-full text-sm font-medium transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          // navigate or open edit modal
                        }}
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : activeTab === 'liked' && isLikedPostsLoading ? (
              <div className="col-span-3 lg:col-span-4 text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : activeTab === 'liked' && (!likedPosts || likedPosts.length === 0) ? (
              <div className="col-span-3 lg:col-span-4 text-center py-10 text-gray-500">
                No liked posts yet.
              </div>
            ) : activeTab === 'liked' && likedPosts ? (
              likedPosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square bg-gray-200 rounded-md overflow-hidden group cursor-pointer relative"
                >
                  {post.mediaUrl ? (
                    <PostImage mediaUrl={post.mediaUrl} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full p-4 flex items-center justify-center text-center bg-gray-100 text-sm text-gray-700 font-medium">
                      {post.content && post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center gap-4 text-white">
                    <div className="flex items-center gap-4 font-semibold">
                      <span className="flex items-center gap-1"><Heart className="w-5 h-5 fill-white text-red-500" /> {post.likes || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 lg:col-span-4 text-center py-10 text-gray-500">
                Feature coming soon.
              </div>
            )}
          </div>
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
    </div>
  );
};

export default ProfilePage;