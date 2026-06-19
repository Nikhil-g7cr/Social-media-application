import React, { useState } from 'react';
import { Search, Heart, MessageCircle, TrendingUp, Image as ImageIcon, PlayCircle } from 'lucide-react';
import { useGetAllExplorePostsQuery } from '../../redux/features/post/postApiSlice';
import PostImage from '../../shared/shared-components/PostImage';

const CATEGORIES = ['For You', 'Trending', 'Technology', 'Art', 'Sports', 'Entertainment', 'News', 'Travel', 'Food'];

const ExplorePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('For You');
  
  // RTK Query hook replacing mock data
  const { data: posts = [], isLoading } = useGetAllExplorePostsQuery();

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
                onClick={() => setActiveCategory(category)}
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
        
        {isLoading ? (
          // Loading Skeleton
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          // Masonry Grid using CSS Columns
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {posts.map((post: any) => (
              <div 
                key={post.id} 
                className="break-inside-avoid relative group rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Post Image or Text Fallback */}
                {post.mediaUrl ? (
                  <PostImage 
                    mediaUrl={post.mediaUrl} 
                    className="w-full h-auto min-h-[160px] object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4 text-center transition-transform duration-500 group-hover:scale-105">
                    <p className="text-sm font-medium text-gray-700 line-clamp-4">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Hover Overlay: Darkens image and shows stats */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end">
                  
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

                  {/* Author Info at the bottom (No link to profile as requested) */}
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
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ExplorePage;