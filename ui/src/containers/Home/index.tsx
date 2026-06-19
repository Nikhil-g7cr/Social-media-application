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
import { useAppSelector } from "../../redux/hooks";
import ExplorePage from "../Explore";
import { useGetPostsQuery, useCreatePostMutation } from "../../redux/features/post/postApiSlice";
import { useLikePostMutation, useUnlikePostMutation } from "../../redux/features/like/likeApiSlice";
export default function HomePage() {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  
  // RTK Query hooks
  const { data: posts = [], isLoading: isPostsLoading } = useGetPostsQuery(undefined, { skip: !isAuthenticated });
  const [createPost, { isLoading: isSubmitting }] = useCreatePostMutation();
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();

  const [newPostContent, setNewPostContent] = useState("");

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      await createPost({ content: newPostContent, type: 'TEXT' } as any).unwrap();
      setNewPostContent("");
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="hidden md:block">
            <div className="sticky top-24 space-y-2">
              {!isAuthenticated ? (
                <>
                  <div className="flex items-center px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium">
                    <Search className="h-5 w-5 mr-3" />
                    <Link to="/explore">Explore</Link>
                  </div>
                  <div className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-100">
                    <LogOut className="h-5 w-5 mr-3" />
                    <Link to="/login">Login</Link>
                  </div>
                  <div className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-100">
                    <User className="h-5 w-5 mr-3" />
                    <Link to="/signup">Signup</Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium">
                    <Home className="h-5 w-5 mr-3" />
                    Home
                  </div>
                  <div className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-100">
                    <Search className="h-5 w-5 mr-3" />
                    <Link to="/explore">Explore</Link>
                  </div>
                  <div className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-100">
                    <MessageSquare className="h-5 w-5 mr-3" />
                    <Link to="/message">Messages</Link>
                  </div>
                  <div className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-100">
                    <User className="h-5 w-5 mr-3" />
                    <Link to="/profile">Profile</Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
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
                {/* Create Post */}
                <div className="bg-white rounded-2xl border p-5 shadow-sm">
                  <div className="flex gap-4">
                    <img
                      src={user?.image_url || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />

                    <form onSubmit={handleCreatePost} className="flex-1">
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={3}
                        placeholder="What's on your mind?"
                        className="w-full bg-gray-50 rounded-xl p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />

                      <div className="flex justify-between items-center mt-3">
                        <button
                          type="button"
                          className="p-2 rounded-full hover:bg-blue-50"
                        >
                          <ImageIcon className="h-5 w-5 text-gray-500" />
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting || !newPostContent.trim()}
                          className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSubmitting ? "Posting..." : "Post"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

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
