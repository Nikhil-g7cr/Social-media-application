import React, { useState, useEffect } from 'react';
import { Settings, MapPin, Calendar, Grid, Heart, Bookmark } from 'lucide-react';
import API from '../../config/axiosConfig';

// Interfaces to type our state
interface UserProfile {
  id: string;
  fullName: string;
  userName: string;
  bio: string;
  location: string;
  joinDate: string;
  avatarUrl: string;
  coverUrl: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating an API call to your NestJS backend: API.get('/profile')
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Replace this mock data with your actual backend response
        const response = await API.get('/auth/profile');
        
        // Mocking backend data for demonstration
        setTimeout(() => {
          setProfile({
            id: '1',
            fullName: 'Nikhil Developer',
            userName: '@nikhil_dev',
            bio: 'Full-stack developer building awesome social media applications with NestJS and React. Coffee enthusiast ☕️',
            location: 'Bangalore, India',
            joinDate: 'March 2024',
            avatarUrl: 'https://ui-avatars.com/api/?name=Nikhil+Developer&background=0D8ABC&color=fff&size=150',
            coverUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2000&auto=format&fit=crop',
            stats: { posts: 42, followers: 1205, following: 840 }
          });
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Failed to load profile", error);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 1. Cover Photo */}
      <div className="h-48 w-full md:h-64 lg:h-80 relative bg-gray-300">
        <img 
          src={profile.coverUrl} 
          alt="Cover" 
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* 2. Profile Header Info */}
        <div className="relative -mt-16 flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="relative h-32 w-32 rounded-full border-4 border-white bg-white sm:h-40 sm:w-40 overflow-hidden shadow-md">
              <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
            </div>
            
            {/* Actions (Mobile view pushes this down, Desktop keeps it right) */}
            <div className="mb-2 hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
              <p className="text-gray-500">{profile.userName}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-3 sm:mb-2 sm:mt-0">
            <button className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:flex-none transition">
              Edit Profile
            </button>
            <button className="rounded-md bg-white p-2 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Name for Mobile View */}
        <div className="mt-4 sm:hidden">
          <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
          <p className="text-gray-500">{profile.userName}</p>
        </div>

        {/* 3. Bio and Meta Details */}
        <div className="mt-4 max-w-2xl">
          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {profile.joinDate}
            </div>
          </div>
        </div>

        {/* 4. Stats */}
        <div className="mt-6 flex gap-6 border-y border-gray-200 py-4">
          <div className="flex flex-col items-center sm:flex-row sm:gap-2">
            <span className="font-bold text-gray-900">{profile.stats.posts}</span>
            <span className="text-sm text-gray-500">Posts</span>
          </div>
          <div className="flex flex-col items-center sm:flex-row sm:gap-2 cursor-pointer hover:underline">
            <span className="font-bold text-gray-900">{profile.stats.followers.toLocaleString()}</span>
            <span className="text-sm text-gray-500">Followers</span>
          </div>
          <div className="flex flex-col items-center sm:flex-row sm:gap-2 cursor-pointer hover:underline">
            <span className="font-bold text-gray-900">{profile.stats.following.toLocaleString()}</span>
            <span className="text-sm text-gray-500">Following</span>
          </div>
        </div>

        {/* 5. Content Tabs */}
        <div className="mt-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === 'posts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Grid className="h-4 w-4" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === 'liked' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Heart className="h-4 w-4" />
              Liked
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === 'saved' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              Saved
            </button>
          </div>

          {/* 6. Grid Content Area */}
          <div className="mt-6 grid grid-cols-3 gap-1 sm:gap-4 lg:grid-cols-4">
            {/* Generating 12 placeholder squares for the feed */}
            {Array.from({ length: 12 }).map((_, index) => (
              <div 
                key={index} 
                className="aspect-square bg-gray-200 rounded-md overflow-hidden group cursor-pointer relative"
              >
                <img 
                  src={`https://images.unsplash.com/photo-${1500000000000 + index}?auto=format&fit=crop&w=500&q=60`} 
                  alt={`Post ${index + 1}`} 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-4 text-white">
                  <div className="flex items-center gap-1 font-semibold"><Heart className="w-5 h-5 fill-white"/> {Math.floor(Math.random() * 100)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;