import React from 'react';
import { useGetReadUrlQuery } from '../../../redux/features/post/postApiSlice';

interface PostImageProps {
  mediaUrl: string;
  className?: string;
}

export default function PostImage({ mediaUrl, className = '' }: PostImageProps) {
  // Only query if mediaUrl is a relative blob path (doesn't start with http)
  // If it already starts with http, we don't need to fetch a new SAS url.
  const isHttp = mediaUrl.startsWith('http');
  
  const { data, isLoading, isError } = useGetReadUrlQuery(mediaUrl, {
    skip: isHttp || !mediaUrl,
  });

  const finalUrl = isHttp ? mediaUrl : data?.url;

  if (!isHttp && isLoading) {
    return <div className={`animate-pulse bg-gray-200 ${className}`}></div>;
  }

  if ((!isHttp && isError) || !finalUrl) {
    return null;
  }

  return (
    <img 
      src={finalUrl} 
      alt="Post media" 
      className={className} 
      loading="lazy" 
    />
  );
}
