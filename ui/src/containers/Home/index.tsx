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
import { useGetPostsQuery } from "../../redux/features/post/postApiSlice";
import { useLikePostMutation, useUnlikePostMutation } from "../../redux/features/like/likeApiSlice";
import CreatePost from "../../shared/shared-components/CreatePost";
export default function HomePage() {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  
  // RTK Query hooks
  const { data: posts = [], isLoading: isPostsLoading } = useGetPostsQuery(undefined, { skip: !isAuthenticated });
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  const toggleLike = async (postId: string, isLikedByMe: boolean | undefined) => {
    try {
      if (isLikedByMe) {
        await unlikePost(postId).unwrap();
      } else {
        await likePost(postId).unwrap();
      }
    } catch (error) {
      console.error("Error toggling like", error);
    }
  };

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
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between">
                        <div className="flex gap-3">
                          <img
                            src={post.author.avatarUrl}
                            alt=""
                            className="h-10 w-10 rounded-full"
                          />

                          <div>
                            <h3 className="font-semibold">{post.author.name}</h3>

                            <p className="text-sm text-gray-500">
                              {post.author.username} • {post.timestamp}
                            </p>
                          </div>
                        </div>

                        <button>
                          <MoreHorizontal className="h-5 w-5 text-gray-400" />
                        </button>
                      </div>

                      <p className="mt-4 text-gray-800 whitespace-pre-wrap">
                        {post.content}
                      </p>

                      <div className="flex justify-between pt-4 mt-4 border-t">
                        <button
                          onClick={() => toggleLike(post.id, post.isLikedByMe)}
                          className={`flex items-center gap-2 p-2 rounded-full ${
                            post.isLikedByMe ? "text-red-500" : "text-gray-500"
                          }`}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              post.isLikedByMe ? "fill-current" : ""
                            }`}
                          />
                          <span>{post.likes}</span>
                        </button>

                        <div className="flex items-center gap-2 p-2 rounded-full text-gray-500">
                          <CommentSection postId={post.id} initialCommentCount={post.commentsCount} />
                        </div>

                        <button className="flex items-center gap-2 p-2 rounded-full text-gray-500">
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Right Sidebar */}
              <div className="hidden lg:block">
                <div className="sticky top-24 bg-white rounded-2xl border p-5 shadow-sm">
                  <h2 className="font-bold mb-4">Trending For You</h2>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500">Technology • Trending</p>
                      <p className="font-semibold">#ReactJS</p>
                      <p className="text-xs text-gray-500">12.5K posts</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Programming • Trending
                      </p>
                      <p className="font-semibold">#NestJS</p>
                      <p className="text-xs text-gray-500">8.2K posts</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Web Development</p>
                      <p className="font-semibold">#TypeScript</p>
                      <p className="text-xs text-gray-500">15K posts</p>
                    </div>
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
