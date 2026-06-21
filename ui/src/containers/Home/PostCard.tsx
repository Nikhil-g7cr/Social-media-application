import React, { memo } from "react";
import { MoreHorizontal, Heart, Share2 } from "lucide-react";
import PostImage from "../../shared/shared-components/PostImage";
import CommentSection from "../../shared/shared-components/CommentSection";

interface PostCardProps {
  post: any;
  user: any;
  onlineUserIds: string[];
  toggleLike: (postId: string, isLikedByMe: boolean | undefined) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, user, onlineUserIds, toggleLike }) => {
  const isLiked = post.likedBy?.includes(user?.id) || post.isLikedByMe;

  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <PostImage
              mediaUrl={post.author.avatarUrl}
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

        <button>
          <MoreHorizontal className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <p className="mt-4 text-gray-800 whitespace-pre-wrap">{post.content}</p>

      {post.mediaUrl && (
        <div
          className="mt-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
          onDoubleClick={() => toggleLike(post.id, isLiked)}
        >
          <PostImage
            mediaUrl={post.mediaUrl}
            className="w-full max-h-[500px] object-contain cursor-pointer"
          />
        </div>
      )}

      <div className="flex justify-between pt-4 mt-4 border-t">
        <button
          onClick={() => toggleLike(post.id, isLiked)}
          className={`flex items-center gap-2 p-2 rounded-full transition-colors duration-200 ${
            isLiked ? "text-red-500" : "text-gray-500"
          }`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-current text-red-500" : ""}`} />
          <span>{post.likes}</span>
        </button>

        <div className="flex items-center gap-2 p-2 rounded-full text-gray-500">
          <CommentSection postId={post.id} initialCommentCount={post.comments} />
        </div>

        <button className="flex items-center gap-2 p-2 rounded-full text-gray-500">
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default memo(PostCard);
