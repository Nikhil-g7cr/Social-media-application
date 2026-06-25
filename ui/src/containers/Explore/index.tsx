import React, { useState } from 'react';
import { Search, Heart, MessageCircle, TrendingUp, Image as ImageIcon, PlayCircle } from 'lucide-react';
import { useGetAllExplorePostsQuery, useGetTrendingPostsQuery } from '../../redux/features/post/postApiSlice';
import ExplorePostCard from '../../components/post/ExplorePostCard';
import InfiniteScroll from '../../shared/shared-components/InfiniteScroll/index';
import ErrorDisplay from '../../components/errors/ErrorDisplay';

const CATEGORIES = ['For You', 'Trending', 'Technology', 'Art', 'Sports', 'Entertainment', 'News', 'Travel', 'Food'];

const ExplorePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('For You');
  const [page, setPage] = useState(1);
  
  // RTK Query hook replacing mock data
  const { data: exploreData, isLoading: exploreLoading, isFetching: exploreFetching, isError: exploreError, error: exploreErrorData, refetch: refetchExplore } = useGetAllExplorePostsQuery({ page, limit: 10 }, { skip: activeCategory === 'Trending' });
  const { data: trendingData, isLoading: trendingLoading, isFetching: trendingFetching, isError: trendingErrorStatus, error: trendingErrorData, refetch: refetchTrending } = useGetTrendingPostsQuery({ page, limit: 10 }, { skip: activeCategory !== 'Trending' });

  const explorePosts = exploreData?.posts || [];
  const trendingPosts = trendingData?.posts || [];

  const getFilteredPosts = () => {
    if (activeCategory === 'Trending') return trendingPosts;
    if (activeCategory === 'For You') return explorePosts;
    
    // Filter by category for the rest
    const searchTerm = activeCategory.toLowerCase();
    return explorePosts.filter((post: any) => {
      const content = (post.content || '').toLowerCase();
      return content.includes(searchTerm) || content.includes(`#${searchTerm.replace(/\s+/g, '')}`);
    });
  };

  const posts = getFilteredPosts();
  const isLoading = activeCategory === 'Trending' ? trendingLoading : exploreLoading;
  const isFetching = activeCategory === 'Trending' ? trendingFetching : exploreFetching;
  const isError = activeCategory === 'Trending' ? trendingErrorStatus : exploreError;
  const currentError = activeCategory === 'Trending' ? trendingErrorData : exploreErrorData;
  const retryFetch = activeCategory === 'Trending' ? refetchTrending : refetchExplore;
  const hasMore = activeCategory === 'Trending' ? (trendingData?.hasMore || false) : (exploreData?.hasMore || false);

  const handleCategoryChange = (category: string) => {
    if (activeCategory !== category) {
      setActiveCategory(category);
      setPage(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 mt-10 md:pb-10">
      
      {/* --- Sticky Header & Search --- */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        {/* --- Category Chips --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category === 'Trending' && <TrendingUp className="inline-block w-4 h-4 mr-1 -mt-0.5" />}
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {isLoading && page === 1 ? (
          // Loading Skeleton
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : isError && page === 1 ? (
          <div className="py-12">
            <ErrorDisplay 
              title={`Failed to load ${activeCategory} posts`}
              error={currentError}
              onRetry={retryFetch}
            />
          </div>
        ) : (
          <InfiniteScroll
            onLoadMore={() => setPage(p => p + 1)}
            hasMore={hasMore}
            isLoading={isFetching}
          >
            {/* Masonry Grid using CSS Columns */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {posts.map((post: any) => (
                <ExplorePostCard key={post.id} post={post} />
              ))}
            </div>
          </InfiniteScroll>
        )}

      </div>
    </div>
  );
};

export default ExplorePage;