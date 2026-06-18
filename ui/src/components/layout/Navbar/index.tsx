import React from "react";
import { Search } from "lucide-react";
import NotificationDropdown from "../../../shared/shared-components/NotificationDropdown";
import { Link } from "react-router-dom";

interface NavbarProps {
  avatarUrl: string;
}

const Navbar: React.FC<NavbarProps> = ({ avatarUrl }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
            <Link to="/">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              S
            </div>
            <h1 className="text-xl font-bold">SocialApp</h1>
          </div>
            </Link>

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
            <div className="relative p-2 rounded-full hover:bg-gray-100">
              <NotificationDropdown />
            </div>

            <img
              src={avatarUrl}
              alt="profile"
              className="h-10 w-10 rounded-full border"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;