import React, { useState, useMemo, useCallback } from 'react';
import { MessageCircle, Heart, Send, MoreHorizontal } from 'lucide-react';
import { useGetCommentsByPostIdQuery, useCreatePostCommentMutation } from '../../redux/features/post/postApiSlice';
import { useSelector } from 'react-redux';
import PostImage from './PostImage';
import Avatar from './Avatar';

interface CommentSectionProps {
  postId: string;
  initialCommentCount?: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialCommentCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Use user slice for avatar if possible, or just skip it if not needed directly.
  const authUser = useSelector((state: any) => state.auth?.user);
  
  const onlineUserIds = useSelector((state: any) => state.onlineUsers?.onlineUserIds || []);

  const { data: comments = [], isLoading, isFetching } = useGetCommentsByPostIdQuery(postId, {
    skip: !isOpen, // Only fetch when opened
  });

  const [createComment, { isLoading: isCreating }] = useCreatePostCommentMutation();

  // We can just use the length of comments if fetched, otherwise use initialCommentCount
  const displayCount = isOpen && !isLoading && !isFetching ? comments.length : initialCommentCount;

  // --- Handlers ---
  const handleAddComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isCreating) return;

    try {
        await createComment({ postId, commentText: newComment }).unwrap();
        setNewComment('');
    } catch (err) {
        console.error('Failed to create comment:', err);
    }
  }, [newComment, isCreating, createComment, postId]);

  const toggleLike = useCallback((commentId: string) => {
    // TODO: implement comment likes if backend supports it
  }, []);

  return (
    <div className="w-full border-t border-gray-100 mt-2 pt-2">
      
      {/* --- Toggle Button --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-medium text-gray-500 hover:text-gray-700 transition flex items-center gap-1.5 py-2"
      >
        <MessageCircle className="w-4 h-4" />
        {isOpen ? 'Hide Comments' : (displayCount === 0 ? '0 comments' : `View all ${displayCount} comments`)}
      </button>

      {/* --- Expandable Comment Area --- */}
      {isOpen && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Loading State */}
          {isLoading || isFetching ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Comment List */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 group">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar 
                          url={comment.authorAvatar}
                          name={comment.authorName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                        />
                        {onlineUserIds.includes(comment.authorId) && (
                          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                        )}
                      </div>
                      
                      {/* Comment Body */}
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2 inline-block">
                          <span className="font-semibold text-sm text-gray-900 cursor-pointer hover:underline">
                            {comment.authorName}
                          </span>
                          <p className="text-sm text-gray-800 break-words mt-0.5">{comment.content}</p>
                        </div>
                        
                        {/* Comment Actions (Like / Reply / Time) */}
                        <div className="flex items-center gap-4 mt-1 ml-2 text-xs font-medium text-gray-500">
                          <span>{comment.time}</span>
                          <button className="hover:text-gray-900 transition">Reply</button>
                          <button className="hover:text-gray-900 transition flex items-center gap-1">
                             <MoreHorizontal className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                          </button>
                        </div>
                      </div>

                      {/* Like Button for Comment */}
                      <button 
                        onClick={() => toggleLike(comment.id)}
                        className="flex flex-col items-center mt-2 flex-shrink-0"
                      >
                        <Heart className={`w-3.5 h-3.5 transition ${comment.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                        {comment.likes > 0 && <span className="text-[10px] text-gray-500 mt-1">{comment.likes}</span>}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <div className="flex gap-3 items-center pt-2 mt-2 border-t border-gray-50">
                <Avatar 
                  url={authUser?.image_url}
                  name={authUser?.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <form onSubmit={handleAddComment} className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..." 
                    className="w-full bg-gray-100 text-sm border-transparent rounded-full pl-4 pr-10 py-2 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    disabled={isCreating}
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim() || isCreating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 disabled:text-gray-300 hover:bg-blue-50 rounded-full transition"
                  >
                    {isCreating ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent ml-0.5"></div>
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;