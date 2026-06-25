import React, { useState } from "react";
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
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import { useAppSelector } from "../../redux/hooks";
import ExplorePage from "../Explore";
import { useGetPostsQuery, useGetTrendingHashtagsQuery } from "../../redux/features/post/postApiSlice";
import { useLikePostMutation, useUnlikePostMutation } from "../../redux/features/like/likeApiSlice";
import CreatePost from "../../shared/shared-components/CreatePost";
import PostCard from "../../components/post/PostCard";
import InfiniteScroll from "../../shared/shared-components/InfiniteScroll/index";
import ErrorDisplay from "../../components/errors/ErrorDisplay";

export default function HomePage() {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  
  // RTK Query hooks
  const [page, setPage] = useState(1);
  const { data, isLoading: isPostsLoading, isFetching, isError: isPostsError, error: postsError, refetch: refetchPosts } = useGetPostsQuery({ page, limit: 10 }, { skip: !isAuthenticated });
  const posts = data?.posts || [];
  const hasMore = data?.hasMore || false;
  const { data: trendingHashtags = [], isLoading: isTrendingLoading, isError: isTrendingError, error: trendingError, refetch: refetchTrending } = useGetTrendingHashtagsQuery(undefined, { skip: !isAuthenticated });
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
          <LeftSidebar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />

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
                {isPostsLoading && page === 1 ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : isPostsError && page === 1 ? (
                  <ErrorDisplay 
                    title="Failed to load posts" 
                    error={postsError} 
                    onRetry={refetchPosts} 
                  />
                ) : (
                  <InfiniteScroll
                    onLoadMore={() => setPage((prev) => prev + 1)}
                    hasMore={hasMore}
                    isLoading={isFetching}
                  >
                    {posts.map((post: any) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        user={user}
                        onlineUserIds={onlineUserIds}
                        toggleLike={toggleLike}
                      />
                    ))}
                  </InfiniteScroll>
                )}
              </div>

              {/* Right Sidebar */}
              <RightSidebar 
                trendingHashtags={trendingHashtags} 
                isTrendingLoading={isTrendingLoading}
                isTrendingError={isTrendingError}
                trendingError={trendingError}
                onRetry={refetchTrending}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
