import React, { useState, useMemo, useCallback } from "react";
import { MessageCircle, Heart, Send, MoreHorizontal } from "lucide-react";
import {
  useGetCommentsByPostIdQuery,
  useCreatePostCommentMutation,
} from "../../../redux/features/post/postApiSlice";
import { useGetUserByIdQuery } from "../../../redux/features/user/userApiSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PostImage from "../../../shared/shared-components/PostImage";
import Avatar from "../../../shared/shared-components/Avatar";
import ErrorDisplay from "../../errors/ErrorDisplay";
import Spinner from "../../../shared/shared-components/Spinner";

const COMMENT_MAX_LENGTH = 2000;

interface CommentSectionProps {
  postId: string;
  initialCommentCount?: number;
  isOpen?: boolean; // NEW
  hideTrigger?: boolean; // NEW
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  initialCommentCount = 0,
  isOpen: controlledOpen,
  hideTrigger = false,
}) => {
  const navigate = useNavigate();
  // const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [createError, setCreateError] = useState<any>(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = hideTrigger ? !!controlledOpen : internalOpen;

  // Use user slice for avatar if possible, or just skip it if not needed directly.
  const authUser = useSelector((state: any) => state.auth?.user);
  const { data: userProfile } = useGetUserByIdQuery(authUser?.id as string, {
    skip: !authUser?.id,
  });

  const onlineUserIds = useSelector(
    (state: any) => state.onlineUsers?.onlineUserIds || [],
  );

  const {
    data: comments = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCommentsByPostIdQuery(postId, {
    skip: !isOpen, // Only fetch when opened
  });

  const [createComment, { isLoading: isCreating }] =
    useCreatePostCommentMutation();

  // We can just use the length of comments if fetched, otherwise use initialCommentCount
  const displayCount =
    isOpen && !isLoading && !isFetching ? comments.length : initialCommentCount;

  // --- Handlers ---
  const handleAddComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || isCreating) return;
      if (newComment.length > COMMENT_MAX_LENGTH) {
        setCreateError(`Comment cannot exceed ${COMMENT_MAX_LENGTH} characters.`);
        return;
      }

      try {
        setCreateError(null);
        await createComment({ postId, commentText: newComment }).unwrap();
        setNewComment("");
      } catch (err) {
        console.error("Failed to create comment:", err);
        setCreateError(err);
      }
    },
    [newComment, isCreating, createComment, postId],
  );

  const toggleLike = useCallback((commentId: string) => {
    // TODO: implement comment likes if backend supports it
  }, []);

  return (
    <div className="w-full border-t border-gray-100 mt-2 pt-2">
      {/* --- Toggle Button (hidden when controlled externally) --- */}
      {!hideTrigger && (
        <button
          onClick={() => setInternalOpen((prev) => !prev)}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition flex items-center gap-1.5 py-2"
        >
          <MessageCircle className="w-4 h-4" />
          {isOpen
            ? "Hide Comments"
            : displayCount === 0
              ? "0 comments"
              : `View all ${displayCount} comments`}
        </button>
      )}

      {/* --- Expandable Comment Area --- */}
      {isOpen && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Loading State */}
          {isLoading || isFetching ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : isError ? (
            <div className="py-2">
              <ErrorDisplay
                title="Failed to load comments"
                error={error}
                onRetry={refetch}
                compact={true}
              />
            </div>
          ) : (
            <>
              {/* Comment List */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 group">
                      {/* Avatar */}
                      <button
                        type="button"
                        onClick={() => navigate(`/profile/${comment.authorId}`)}
                        className="relative shrink-0"
                        aria-label={`View ${comment.authorName}'s profile`}
                      >
                        <Avatar
                          url={comment?.authorAvatar}
                          name={comment?.authorName}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        {onlineUserIds.includes(comment.authorId) && (
                          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                        )}
                      </button>

                      {/* Comment Body */}
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2 inline-block">
                          <button
                            type="button"
                            onClick={() => navigate(`/profile/${comment.authorId}`)}
                            className="font-semibold text-sm text-gray-900 hover:underline"
                          >
                            {comment.authorName}
                          </button>
                          <p className="text-sm text-gray-800 wrap-break-word mt-0.5">
                            {comment.content}
                          </p>
                        </div>

                        {/* Comment Actions (Like / Reply / Time) */}
                        <div className="flex items-center gap-4 mt-1 ml-2 text-xs font-medium text-gray-500">
                          <span>{comment.time}</span>
                          <button className="hover:text-gray-900 transition">
                            Reply
                          </button>
                          <button className="hover:text-gray-900 transition flex items-center gap-1">
                            <MoreHorizontal className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                          </button>
                        </div>
                      </div>

                      {/* Like Button for Comment */}
                      <button
                        onClick={() => toggleLike(comment.id)}
                        className="flex flex-col items-center mt-2 shrink-0"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition ${comment.isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`}
                        />
                        {comment.likes > 0 && (
                          <span className="text-[10px] text-gray-500 mt-1">
                            {comment.likes}
                          </span>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <div className="flex gap-3 items-center pt-2 mt-2 border-t border-gray-50">
                <Avatar
                  url={userProfile?.avatarUrl}
                  name={userProfile?.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <form onSubmit={handleAddComment} className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      if (e.target.value.length <= COMMENT_MAX_LENGTH) {
                        setCreateError(null);
                      }
                    }}
                    placeholder="Add a comment..."
                    className="w-full bg-gray-100 text-sm border-transparent rounded-full pl-4 pr-10 py-2 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    disabled={isCreating}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || newComment.length > COMMENT_MAX_LENGTH || isCreating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 disabled:text-gray-300 hover:bg-blue-50 rounded-full transition"
                  >
                    {isCreating ? (
                      <Spinner size="xs" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </form>
              </div>
              <div className={`text-xs text-right ${newComment.length > COMMENT_MAX_LENGTH ? "text-red-500" : "text-gray-400"}`}>
                {newComment.length}/{COMMENT_MAX_LENGTH}
              </div>
              {createError && (
                <ErrorDisplay
                  title="Comment failed"
                  error={createError}
                  compact
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
