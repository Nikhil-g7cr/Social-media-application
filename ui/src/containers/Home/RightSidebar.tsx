import React from "react";
import ErrorDisplay from "../../components/errors/ErrorDisplay";
import { TrendingHashtagSkeleton } from "../../shared/shared-components/Skeleton";

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
  const formatTrendingText = (text: string, maxLength: number = 20) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-24 bg-white rounded-2xl border p-5 shadow-sm">
        <h2 className="font-bold mb-4">Trending For You</h2>

        <div className="space-y-4">
          {isTrendingLoading ? (
            <TrendingHashtagSkeleton />
          ) : isTrendingError ? (
            <ErrorDisplay
              title="Couldn't load trending"
              error={trendingError}
              onRetry={onRetry}
              compact={true}
            />
          ) : trendingHashtags.length > 0 ? (
            trendingHashtags.map((item, index) => (
              <div key={index} className="group">
                <p className="text-xs text-gray-500 truncate">
                  {item.category || 'Trending'}
                </p>
                <p
                  className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer truncate"
                  title={item.hashtag}
                >
                  {formatTrendingText(item.hashtag, 20)}
                </p>
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
