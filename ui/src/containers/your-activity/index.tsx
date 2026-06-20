import React, { useState } from 'react';
import { useGetUserLikesQuery, useUnlikePostMutation } from '../../redux/features/like/likeApiSlice';
import { useGetUserCommentsQuery, useDeleteCommentMutation } from '../../redux/features/comment/commentApiSlice';
import { Heart, MessageCircle, Trash2, HeartOff, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const YourActivityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'likes' | 'comments'>('likes');
  const navigate = useNavigate();

  // Queries
  const { data: likesRes, isLoading: likesLoading } = useGetUserLikesQuery();
  const { data: commentsRes, isLoading: commentsLoading } = useGetUserCommentsQuery();

  const [unlikePost] = useUnlikePostMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const likes = likesRes?.data || [];
  const comments = commentsRes?.data || [];

  const handleUnlike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    await unlikePost(postId).unwrap();
  };

  const handleDeleteComment = async (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();
    await deleteComment(commentId).unwrap();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-white">
            <h1 className="text-2xl font-bold text-gray-900">Your Activity</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your past interactions</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 px-4">
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'likes' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="w-4 h-4" />
              Likes
              {likes.length > 0 && (
                <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {likes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'comments' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Comments
              {comments.length > 0 && (
                <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {comments.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="divide-y divide-gray-100 min-h-[400px]">
            {/* LIKES TAB */}
            {activeTab === 'likes' && (
              <div>
                {likesLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : likes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Heart className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900">No likes yet</p>
                    <p className="text-sm">Posts you like will show up here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-1">
                    {likes.map((like: any) => (
                      <div 
                        key={like.ID} 
                        className="relative aspect-square group cursor-pointer overflow-hidden bg-gray-100"
                        onClick={() => navigate(`/`)} // Assuming click goes to post or home
                      >
                        {like.Post?.PostMedia && like.Post.PostMedia.length > 0 ? (
                           <img 
                              src={like.Post.PostMedia[0].MediaUrl} 
                              alt="Post" 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                           />
                        ) : (
                           <div className="w-full h-full p-4 flex items-center justify-center bg-gray-50 text-xs text-gray-500 overflow-hidden text-center">
                             {like.Post?.Content || 'Text Post'}
                           </div>
                        )}
                        
                        {/* Overlay with unlike button */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button
                                onClick={(e) => handleUnlike(e, like.PostID)}
                                className="bg-white/20 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition"
                                title="Unlike"
                            >
                                <HeartOff className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="absolute bottom-2 right-2 text-white text-[10px] bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                            {formatDistanceToNow(new Date(like.CreatedAt), { addSuffix: true })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COMMENTS TAB */}
            {activeTab === 'comments' && (
              <div>
                {commentsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900">No comments yet</p>
                    <p className="text-sm">Comments you make will show up here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {comments.map((comment: any) => (
                      <div
                        key={comment.ID}
                        className="flex items-start justify-between p-4 sm:p-6 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          {/* Post Thumbnail if available */}
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                             {comment.Post?.PostMedia && comment.Post.PostMedia.length > 0 ? (
                                <img src={comment.Post.PostMedia[0].MediaUrl} alt="Post" className="w-full h-full object-cover" />
                             ) : (
                                <span className="text-[10px] text-gray-400">Post</span>
                             )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-800 leading-relaxed">
                              {comment.Content}
                            </p>
                            <span className="text-xs text-gray-500 mt-1 block font-medium">
                              {formatDistanceToNow(new Date(comment.CreatedAt), { addSuffix: true })} on {comment.Post?.User?.UserName}'s post
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pl-4">
                          <button
                            onClick={(e) => handleDeleteComment(e, comment.ID)}
                            className="text-gray-400 hover:text-red-500 transition p-1.5 rounded-full hover:bg-red-50"
                            title="Delete comment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourActivityPage;
