import React, { useState } from 'react';
import {
  Home,
  Search,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
} from 'lucide-react';

interface Author {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
}

interface Post {
  id: string;
  author: Author;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLikedByMe?: boolean;
}

const MOCK_CURRENT_USER: Author = {
  id: 'u1',
  name: 'Nikhil',
  username: '@nikhil_dev',
  avatarUrl:
    'https://ui-avatars.com/api/?name=Nikhil&background=0D8ABC&color=fff',
};

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    author: {
      id: 'u2',
      name: 'Sarah Connor',
      username: '@sarah_c',
      avatarUrl:
        'https://ui-avatars.com/api/?name=Sarah+Connor&background=F59E0B&color=fff',
    },
    content:
      'Just launched my new portfolio website! Super excited to share it with everyone. Let me know what you think! 🚀💻',
    timestamp: '2 hours ago',
    likes: 45,
    comments: 12,
    isLikedByMe: false,
  },
  {
    id: 'p2',
    author: {
      id: 'u3',
      name: 'Alex Developer',
      username: '@alex_dev',
      avatarUrl:
        'https://ui-avatars.com/api/?name=Alex+Dev&background=10B981&color=fff',
    },
    content:
      'Does anyone else spend 90% of their debugging time fixing a typo, or is it just me? 😅',
    timestamp: '5 hours ago',
    likes: 128,
    comments: 34,
    isLikedByMe: true,
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPostContent.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newPost: Post = {
        id: `p${Date.now()}`,
        author: MOCK_CURRENT_USER,
        content: newPostContent,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        isLikedByMe: false,
      };

      setPosts((prev) => [newPost, ...prev]);
      setNewPostContent('');
      setIsSubmitting(false);
    }, 500);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLikedByMe: !post.isLikedByMe,
              likes: post.isLikedByMe
                ? post.likes - 1
                : post.likes + 1,
            }
          : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                S
              </div>
              <h1 className="text-xl font-bold">SocialApp</h1>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <img
                src={MOCK_CURRENT_USER.avatarUrl}
                alt="profile"
                className="h-10 w-10 rounded-full border"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="hidden md:block">
            <div className="sticky top-24 space-y-2">
              <a
                href="#"
                className="flex items-center px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium"
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </a>

              <a
                href="#"
                className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-100"
              >
                <Search className="h-5 w-5 mr-3" />
                Explore
              </a>

              <a
                href="#"
                className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-100"
              >
                <MessageSquare className="h-5 w-5 mr-3" />
                Messages
              </a>

              <a
                href="#"
                className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-100"
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </a>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>

          {/* Feed */}
          <div className="md:col-span-2 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex gap-4">
                <img
                  src={MOCK_CURRENT_USER.avatarUrl}
                  alt=""
                  className="h-10 w-10 rounded-full"
                />

                <form
                  onSubmit={handleCreatePost}
                  className="flex-1"
                >
                  <textarea
                    value={newPostContent}
                    onChange={(e) =>
                      setNewPostContent(e.target.value)
                    }
                    rows={3}
                    placeholder="What's on your mind?"
                    className="w-full bg-gray-50 rounded-xl p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  <div className="flex justify-between items-center mt-3">
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-blue-50"
                    >
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                    </button>

                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !newPostContent.trim()
                      }
                      className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting
                        ? 'Posting...'
                        : 'Post'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <img
                      src={post.author.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />

                    <div>
                      <h3 className="font-semibold">
                        {post.author.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {post.author.username} •{' '}
                        {post.timestamp}
                      </p>
                    </div>
                  </div>

                  <button>
                    <MoreHorizontal className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <p className="mt-4 text-gray-800 whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex justify-between pt-4 mt-4 border-t">
                  <button
                    onClick={() =>
                      toggleLike(post.id)
                    }
                    className={`flex items-center gap-2 p-2 rounded-full ${
                      post.isLikedByMe
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        post.isLikedByMe
                          ? 'fill-current'
                          : ''
                      }`}
                    />
                    <span>{post.likes}</span>
                  </button>

                  <button className="flex items-center gap-2 p-2 rounded-full text-gray-500">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments}</span>
                  </button>

                  <button className="flex items-center gap-2 p-2 rounded-full text-gray-500">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-2xl border p-5 shadow-sm">
              <h2 className="font-bold mb-4">
                Trending For You
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">
                    Technology • Trending
                  </p>
                  <p className="font-semibold">
                    #ReactJS
                  </p>
                  <p className="text-xs text-gray-500">
                    12.5K posts
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Programming • Trending
                  </p>
                  <p className="font-semibold">
                    #NestJS
                  </p>
                  <p className="text-xs text-gray-500">
                    8.2K posts
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Web Development
                  </p>
                  <p className="font-semibold">
                    #TypeScript
                  </p>
                  <p className="text-xs text-gray-500">
                    15K posts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}