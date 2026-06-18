import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, TrendingUp, Image as ImageIcon, PlayCircle } from 'lucide-react';
// import API from '../api/client'; // Your Axios instance

// --- Types ---
interface ExplorePost {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  type: 'image' | 'video';
  authorName: string;
  authorAvatar: string;
}

const CATEGORIES = ['For You', 'Trending', 'Technology', 'Art', 'Sports', 'Entertainment', 'News', 'Travel', 'Food'];

const ExplorePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('For You');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Fetch Mock Data ---
  useEffect(() => {
    const fetchExploreData = async () => {
      setIsLoading(true);
      // TODO: Replace with your actual NestJS endpoint
      // const response = await API.get(`/explore?category=${activeCategory}&q=${searchQuery}`);
      
      // Simulating network request and generating mock masonry data
      setTimeout(() => {
        const mockPosts: ExplorePost[] = Array.from({ length: 20 }).map((_, i) => ({
          id: `post-${i}`,
          // Generate slightly different aspect ratios for the masonry effect
          imageUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 1000)}?auto=format&fit=crop&w=600&q=80`,
          likes: Math.floor(Math.random() * 5000) + 10,
          comments: Math.floor(Math.random() * 500),
          type: Math.random() > 0.8 ? 'video' : 'image', // 20% chance to be a video post
          authorName: `User ${i + 1}`,
          authorAvatar: `https://ui-avatars.com/api/?name=User+${i + 1}&background=random`
        }));
        
        setPosts(mockPosts);
        setIsLoading(false);
      }, 600);
    };

    fetchExploreData();
  }, [activeCategory, searchQuery]); // Re-fetch when category changes

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // The useEffect will naturally trigger the API call because searchQuery state changed
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 mt-10 md:pb-10">
      
      {/* --- Sticky Header & Search --- */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        {/* <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, hashtags, or posts..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 text-sm sm:text-base"
            />
          </form>
        </div> */}

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
          // Tailwind columns class handles the masonry wrapping natively!
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="break-inside-avoid relative group rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Post Image */}
                <img 
                  src={post.imageUrl} 
                  alt="Explore post" 
                  className="w-full h-40 object-cover transform transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Video Indicator */}
                {post.type === 'video' && (
                  <div className="absolute top-2 right-2 text-white bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                )}
                
                {/* Multiple Images Indicator */}
                {post.type === 'image' && Math.random() > 0.7 && (
                  <div className="absolute top-2 right-2 text-white bg-black/50 p-1.5 rounded-md backdrop-blur-sm">
                    <ImageIcon className="w-4 h-4" />
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

                  {/* Author Info at the bottom */}
                  <div className="p-4 flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-200 delay-75">
                    <img 
                      src={post.authorAvatar} 
                      alt={post.authorName} 
                      className="w-6 h-6 rounded-full border border-white/50"
                    />
                    <span className="text-white text-sm font-medium truncate drop-shadow-md">
                      {post.authorName}
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