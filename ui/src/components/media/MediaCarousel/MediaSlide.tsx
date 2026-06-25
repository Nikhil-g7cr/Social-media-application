import React, { memo, useEffect, useRef } from 'react';
import type { UploadedMedia } from './types';
import PostImage from '../../../shared/shared-components/PostImage';
import { useGetReadUrlQuery } from '../../../redux/features/post/postApiSlice';

interface MediaSlideProps {
  media: UploadedMedia;
  isActive: boolean;
  autoPlayVideos?: boolean;
}

const MediaSlide: React.FC<MediaSlideProps> = ({ media, isActive, autoPlayVideos = false }) => {
  const isVideo = media.mediaType === 'VIDEO' || media.mimeType?.startsWith('video/');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const isHttp = media.mediaUrl?.startsWith('http') || media.mediaUrl?.startsWith('blob:');
  const { data, isLoading } = useGetReadUrlQuery(media.mediaUrl, {
    skip: isHttp || !media.mediaUrl || !isVideo,
  });

  const finalVideoUrl = isHttp ? media.mediaUrl : data?.url;

  // To handle intersection observation or active state changes for video playback
  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (isActive && autoPlayVideos) {
        // Attempt to play, catch any auto-play restrictions
        videoRef.current.play().catch((e) => console.log('Autoplay blocked:', e));
      } else if (!isActive) {
        videoRef.current.pause();
      }
    }
  }, [isActive, isVideo, autoPlayVideos]);

  return (
    <div className="w-full h-full flex-shrink-0 flex items-center justify-center bg-gray-50/50">
      {isVideo ? (
        isLoading && !isHttp ? (
           <div className="animate-pulse bg-gray-200 w-full h-full max-h-[500px]"></div>
        ) : finalVideoUrl ? (
          <video
            ref={videoRef}
            src={finalVideoUrl}
            className="w-full h-full max-h-[500px] object-contain"
            controls
            preload="metadata"
            playsInline
          />
        ) : null
      ) : (
        <PostImage 
          mediaUrl={media.mediaUrl} 
          className="w-full h-full max-h-[500px] object-contain"
        />
      )}
    </div>
  );
};

export default memo(MediaSlide);
