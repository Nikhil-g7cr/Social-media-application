import React from "react";
import ErrorDisplay from "../../components/errors/ErrorDisplay";

interface TrendingHashtag {
  hashtag: string;
  postCount: number;
  category?: string;
}

interface RightSidebarProps {
  trendingHashtags: TrendingHashtag[];
  isTrendingLoading: boolean;
  isTrendingError?: boolean;
  trendingError?: any;
  onRetry?: () => void;
}

export default function RightSidebar({ 
  trendingHashtags, 
  isTrendingLoading, 
  isTrendingError, 
  trendingError, 
  onRetry 
}: RightSidebarProps) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-24 bg-white rounded-2xl border p-5 shadow-sm">
        <h2 className="font-bold mb-4">Trending For You</h2>

        <div className="space-y-4">
          {isTrendingLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : isTrendingError ? (
            <ErrorDisplay 
              title="Couldn't load trending" 
              error={trendingError} 
              onRetry={onRetry}
              compact={true} 
            />
          ) : trendingHashtags.length > 0 ? (
            trendingHashtags.map((item, index) => (
              <div key={index}>
                <p className="text-xs text-gray-500">{item.category || 'Trending'}</p>
                <p className="font-semibold">{item.hashtag}</p>
                <p className="text-xs text-gray-500">
                  {item.postCount} {item.postCount === 1 ? 'post' : 'posts'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No trending topics right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
