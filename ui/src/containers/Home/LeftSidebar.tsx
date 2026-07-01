import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Search,
  MessageSquare,
  User,
  LogOut,
  Heart,
} from "lucide-react";

interface LeftSidebarProps {
  isAuthenticated: boolean;
  handleLogout: () => void;
}

export default function LeftSidebar({ isAuthenticated, handleLogout }: LeftSidebarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 md:relative md:block md:border-none md:bg-transparent md:z-auto">
      <div className="flex justify-around p-2 md:sticky md:top-24 md:flex-col md:space-y-2 md:p-0 md:justify-start">
        {!isAuthenticated ? (
          <>
            <Link to="/explore" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
              <Search className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
              <span className="text-xs mt-1 md:text-base md:mt-0 font-medium">Explore</span>
            </Link>
            <Link to="/login" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
              <LogOut className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
              <span className="text-xs mt-1 md:text-base md:mt-0 font-medium">Login</span>
            </Link>
            <Link to="/signup" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
              <User className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
              <span className="text-xs mt-1 md:text-base md:mt-0 font-medium">Signup</span>
            </Link>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl md:bg-blue-50 text-blue-600 font-medium flex-1 md:flex-none cursor-pointer">
              <Home className="h-6 w-6 md:h-5 md:w-5 md:mr-3" />
              <span className="text-xs mt-1 md:text-base md:mt-0">Home</span>
            </div>
            <Link to="/explore" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
              <Search className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
              <span className="text-xs mt-1 md:text-base md:mt-0 text-gray-700">Explore</span>
            </Link>
            <Link to="/message" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
              <MessageSquare className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
              <span className="text-xs mt-1 md:text-base md:mt-0 text-gray-700">Messages</span>
            </Link>
            <Link to="/activity" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
              <Heart className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
              <span className="text-xs mt-1 md:text-base md:mt-0 text-gray-700">Activity</span>
            </Link>
            {/* <Link to="/profile" className="flex flex-col md:flex-row items-center p-2 md:px-4 md:py-3 rounded-xl hover:bg-gray-100 flex-1 md:flex-none">
              <User className="h-6 w-6 md:h-5 md:w-5 md:mr-3 text-gray-600" />
              <span className="text-xs mt-1 md:text-base md:mt-0 text-gray-700">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex flex-col md:flex-row items-center justify-center p-2 md:px-4 md:py-3 rounded-xl text-red-600 hover:bg-red-50 flex-1 md:flex-none md:justify-start"
            >
              <LogOut className="h-6 w-6 md:h-5 md:w-5 md:mr-3" />
              <span className="text-xs mt-1 md:text-base md:mt-0">Logout</span>
            </button> */}
          </>
        )}
      </div>
    </div>
  );
}
