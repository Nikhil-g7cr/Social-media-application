import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Send, MoreHorizontal } from 'lucide-react';
// import API from '../../api/axiosConfig'; // Your Axios instance

// --- Types ---
interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  time: string;
  likes: number;
  isLiked: boolean;
}

interface CommentSectionProps {
  postId: string;
  initialCommentCount?: number;
}

const CURRENT_USER = {
  name: 'Nikhil Developer',
  avatar: 'https://ui-avatars.com/api/?name=Nikhil+Developer&background=0D8ABC&color=fff',
};

const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialCommentCount = 3 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  // --- Fetch Comments when opened ---
  useEffect(() => {
    if (isOpen && comments.length === 0) {
      setIsLoading(true);
      // Simulate API Call: API.get(`/posts/${postId}/comments`)
      setTimeout(() => {
        setComments([
          {
            id: 'c1',
            authorName: 'Sarah Smith',
            authorAvatar: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=FCE7F3&color=9D174D',
            content: 'This is exactly what I was looking for! Great post.',
            time: '2h',
            likes: 12,
            isLiked: false,
          },
          {
            id: 'c2',
            authorName: 'Alex Johnson',
            authorAvatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=EBF4FF&color=1E3A8A',
            content: 'Could you share more details about how you built this?',
            time: '45m',
            likes: 3,
            isLiked: true,
          }
        ]);
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen, postId, comments.length]);

  // --- Handlers ---
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      authorName: CURRENT_USER.name,
      authorAvatar: CURRENT_USER.avatar,
      content: newComment,
      time: 'Just now',
      likes: 0,
      isLiked: false,
    };

    // Optimistic UI Update
    setComments((prev) => [...prev, newCommentObj]);
    setCommentCount((prev) => prev + 1);
    setNewComment('');

    // TODO: Send to backend
    // API.post(`/posts/${postId}/comments`, { content: newComment });
  };

  const toggleLike = (commentId: string) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          isLiked: !c.isLiked,
          likes: c.isLiked ? c.likes - 1 : c.likes + 1
        };
      }
      return c;
    }));
    // TODO: API.post(`/comments/${commentId}/like`)
  };

  return (
    <div className="w-full border-t border-gray-100 mt-2 pt-2">
      
      {/* --- Toggle Button --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-medium text-gray-500 hover:text-gray-700 transition flex items-center gap-1.5 py-2"
      >
        <MessageCircle className="w-4 h-4" />
        {isOpen ? 'Hide Comments' : `View all ${commentCount} comments`}
      </button>

      {/* --- Expandable Comment Area --- */}
      {isOpen && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Comment List */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    {/* Avatar */}
                    <img 
                      src={comment.authorAvatar} 
                      alt={comment.authorName} 
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                    />
                    
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
                ))}
              </div>

              {/* Add Comment Input */}
              <div className="flex gap-3 items-center pt-2 mt-2 border-t border-gray-50">
                <img 
                  src={CURRENT_USER.avatar} 
                  alt="Your avatar" 
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <form onSubmit={handleAddComment} className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..." 
                    className="w-full bg-gray-100 text-sm border-transparent rounded-full pl-4 pr-10 py-2 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 disabled:text-gray-300 hover:bg-blue-50 rounded-full transition"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
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