import React, { useMemo } from 'react';
import PostImage from '../PostImage';

interface AvatarProps {
  url?: string;
  name?: string;
  className?: string;
  fallbackBackground?: string;
}

export default function Avatar({ 
  url, 
  name = 'User', 
  className = 'w-10 h-10 rounded-full object-cover',
  fallbackBackground = 'random' 
}: AvatarProps) {
  const finalUrl = useMemo(() => {
    if (url) return url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${fallbackBackground}`;
  }, [url, name, fallbackBackground]);

  // If the url is a blob/SAS url it will be handled by PostImage,
  // If it's an http url, PostImage will also just render an img tag.
  return (
    <PostImage
      mediaUrl={finalUrl}
      className={className}
    />
  );
}
