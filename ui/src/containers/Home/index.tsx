import React from "react";
import {
  Home,
  Search,
  MessageSquare,
  User,
  LogOut,
  Image as ImageIcon,
  Heart,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import CommentSection from "../../shared/shared-components/CommentSection";
import { useAppSelector } from "../../redux/hooks";
import ExplorePage from "../Explore";
import { useGetPostsQuery, useGetTrendingHashtagsQuery } from "../../redux/features/post/postApiSlice";
import { useLikePostMutation, useUnlikePostMutation } from "../../redux/features/like/likeApiSlice";
import CreatePost from "../../shared/shared-components/CreatePost";
import PostImage from "../../shared/shared-components/PostImage";
import PostCard from "./PostCard";
export default function HomePage() {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  
  // RTK Query hooks
  const { data: posts = [], isLoading: isPostsLoading } = useGetPostsQuery(undefined, { skip: !isAuthenticated });
  const { data: trendingHashtags = [], isLoading: isTrendingLoading } = useGetTrendingHashtagsQuery(undefined, { skip: !isAuthenticated });
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  
  const onlineUserIds = useAppSelector((state: any) => state.onlineUsers?.onlineUserIds || []);

  const handleLogout = React.useCallback(() => {
    sessionStorage.removeItem("accessToken");
    window.location.href = "/login";
  }, []);

  const toggleLike = React.useCallback(async (postId: string, isLikedByMe: boolean | undefined) => {
    try {
      if (isLikedByMe) {
        await unlikePost(postId).unwrap();
      } else {
        await likePost(postId).unwrap();
      }
    } catch (error) {
      console.error("Error toggling like", error);
    }
  }, [likePost, unlikePost]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Sidebar / Bottom Nav on Mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 md:relative md:block md:border-none md:bg-transparent md:z-auto">
            <div className="flex justify-around p-2 md:sticky md:top-24 md:flex-col md:space-y-2 md:p-0 md:justify-start">
              {!isAuthenticated ? (
                <>
                  <Link to="/explore" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
                    <Search className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
                    <span className="text-xs mt-1 md:text-base md:mt-0 font-medium">Explore</span>
                  </Link>
                  <Link to="/login" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
                    <LogOut className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
                    <span className="text-xs mt-1 md:text-base md:mt-0 font-medium">Login</span>
                  </Link>
                  <Link to="/signup" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
                    <User className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
                    <span className="text-xs mt-1 md:text-base md:mt-0 font-medium">Signup</span>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl md:bg-blue-50 text-blue-600 font-medium flex-1 md:flex-none cursor-pointer">
                    <Home className="h-6 w-6 md:h-5 md:w-5 md:mr-3" />
                    <span className="text-xs mt-1 md:text-base md:mt-0">Home</span>
                  </div>
                  <Link to="/explore" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
                    <Search className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
                    <span className="text-xs mt-1 md:text-base md:mt-0 text-gray-700">Explore</span>
                  </Link>
                  <Link to="/message" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
                    <MessageSquare className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
                    <span className="text-xs mt-1 md:text-base md:mt-0 text-gray-700">Messages</span>
                  </Link>
                  <Link to="/activity" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
                    <Heart className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
                    <span className="text-xs mt-1 md:text-base md:mt-0 text-gray-700">Activity</span>
                  </Link>
                  <Link to="/profile" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
                    <User className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
                    <span className="text-xs mt-1 md:text-base md:mt-0 text-gray-700">Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex flex-col md:flex-row items-center justify-center p-2 md:px-4 md:py-3 rounded-xl text-red-600 hover:bg-red-50 flex-1 md:flex-none md:justify-start"
                  >
                    <LogOut className="h-6 w-6 md:h-5 md:w-5 md:mr-3" />
                    <span className="text-xs mt-1 md:text-base md:mt-0">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="md:col-span-3">
              {/* Show Explore instead of Feed when not logged in */}
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <ExplorePage />
              </div>
            </div>
          ) : (
            <>
              {/* Feed */}
              <div className="md:col-span-2 space-y-6">
                <CreatePost />

                {/* Posts */}
                {isPostsLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  posts.map((post: any) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      user={user}
                      onlineUserIds={onlineUserIds}
                      toggleLike={toggleLike}
                    />
                  ))
                )}
              </div>

              {/* Right Sidebar */}
              <div className="hidden lg:block">
                <div className="sticky top-24 bg-white rounded-2xl border p-5 shadow-sm">
                  <h2 className="font-bold mb-4">Trending For You</h2>

                  <div className="space-y-4">
                    {isTrendingLoading ? (
                      <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-4 py-1">
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </div>
                    ) : trendingHashtags.length > 0 ? (
                      trendingHashtags.map((item, index) => (
                        <div key={index}>
                          <p className="text-xs text-gray-500">{item.category || 'Trending'}</p>
                          <p className="font-semibold">{item.hashtag}</p>
                          <p className="text-xs text-gray-500">
                            {item.postCount} {item.postCount === 1 ? 'post' : 'posts'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No trending topics right now.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
