import React, { memo } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import MediaCarousel from '../../media/MediaCarousel';
import { usePostPopup, PostPopupMode } from '../../layout/post-popup';

interface ExplorePostCardProps {
  post: any;
}

const ExplorePostCard: React.FC<ExplorePostCardProps> = ({ post }) => {
  const { open } = usePostPopup();

  let mediaToRender = post.media || [];
  if (mediaToRender.length === 0 && post.mediaUrl) {
    mediaToRender = [{ mediaUrl: post.mediaUrl, mediaType: 'IMAGE' }];
  }

  return (
    <div 
      className="break-inside-avoid relative group rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow h-full"
      onClick={() => open(PostPopupMode.VIEW, { postId: post.id })}
    >
      {/* Post Media or Text Fallback */}
      {mediaToRender.length > 0 ? (
        <div className="transform transition-transform duration-500 group-hover:scale-105 h-full">
          {/* Use MediaCarousel, hide arrows/dots for cleaner Explore look if desired, or keep them */}
          <MediaCarousel 
            media={mediaToRender} 
            showArrows={false} 
            showDots={true} 
            className="w-full h-full min-h-[160px]" 
          />
        </div>
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4 text-center transition-transform duration-500 group-hover:scale-105">
          <p className="text-sm font-medium text-gray-700 line-clamp-4">
            {post.content}
          </p>
        </div>
      )}

      {/* Hover Overlay: Darkens image and shows stats */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end pointer-events-none">
        
        {/* Central Stats */}
        <div className="absolute inset-0 flex items-center justify-center gap-6 text-white font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-200">
          <div className="flex items-center gap-1.5">
            <Heart className="w-6 h-6 fill-white" /> 
            <span>{post.likes > 999 ? (post.likes/1000).toFixed(1) + 'k' : post.likes}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-6 h-6 fill-white" /> 
            <span>{post.comments}</span>
          </div>
        </div>

        {/* Author Info at the bottom */}
        <div className="p-4 flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-200 delay-75">
          <img 
            src={post.author.avatarUrl} 
            alt={post.author.name} 
            className="w-6 h-6 rounded-full border border-white/50 bg-white"
          />
          <span className="text-white text-sm font-medium truncate drop-shadow-md">
            {post.author.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(ExplorePostCard);
