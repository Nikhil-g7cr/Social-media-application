import React, { memo, useState } from "react";
import { MoreHorizontal, Heart, Share2, MessageCircle } from "lucide-react";
import CommentSection from "../../features/Comment/CommentSection";
import Avatar from "../../../shared/shared-components/Avatar";
import MediaCarousel from "../../media/MediaCarousel";
import { usePostPopup, PostPopupMode } from "../../layout/post-popup";

interface PostCardProps {
  post: any;
  user: any;
  onlineUserIds: string[];
  toggleLike: (postId: string, isLikedByMe: boolean | undefined) => void;
  compact?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  user,
  onlineUserIds,
  toggleLike,
  compact,
}) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const isLiked = post.likedBy?.includes(user?.id) || post.isLikedByMe;
  const { open } = usePostPopup();

  const handleCardClick = () => {
    open(PostPopupMode.VIEW, { postId: post.id });
  };

  // Normalize media for the carousel
  let mediaToRender = post.media || [];
  if (mediaToRender.length === 0 && post.mediaUrl) {
    mediaToRender = [{ mediaUrl: post.mediaUrl, mediaType: "IMAGE" }]; // fallback for very old text+single image posts
  }

  return (
    <div
      className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <Avatar
              url={post.author.avatarUrl}
              name={post.author.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            {onlineUserIds.includes(post.author.id) && (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
            )}
          </div>

          <div>
            <h3 className="font-semibold">{post.author.name}</h3>
            <p className="text-sm text-gray-500">
              {post.author.username} • {post.timestamp}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            open(PostPopupMode.REPORT, { postId: post.id });
          }}
        >
          <MoreHorizontal className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <p className="mt-4 text-gray-800 whitespace-pre-wrap">{post.content}</p>

      {mediaToRender.length > 0 && (
        <div
          className={`mt-4 rounded-xl overflow-hidden ${compact ? "max-h-[300px]" : ""}`}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => {
            e.stopPropagation();
            toggleLike(post.id, isLiked);
          }}
        >
          <MediaCarousel
            media={mediaToRender}
            className={`${compact ? "h-[250px] sm:h-[300px]" : "h-[350px] sm:h-[500px]"} bg-black`}
          />
        </div>
      )}

      <div className="flex justify-between pt-4 mt-4 border-t">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(post.id, isLiked);
          }}
          className={`flex items-center gap-2 p-2 rounded-full transition-colors duration-200 ${
            isLiked ? "text-red-500" : "text-gray-500"
          }`}
        >
          <Heart
            className={`h-5 w-5 ${isLiked ? "fill-current text-red-500" : ""}`}
          />
          <span>{post.likes}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setCommentsOpen((o) => !o);
          }}
          className="flex items-center gap-2 p-2 rounded-full text-gray-500"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{post.comments}</span>
        </button>

        <button
          className="flex items-center gap-2 p-2 rounded-full text-gray-500"
          onClick={(e) => {
            e.stopPropagation();
            open(PostPopupMode.SHARE, { postId: post.id });
          }}
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <CommentSection
          postId={post.id}
          initialCommentCount={post.comments}
          isOpen={commentsOpen}
          hideTrigger
        />
      </div>
    </div>
  );
};

export default memo(PostCard);
