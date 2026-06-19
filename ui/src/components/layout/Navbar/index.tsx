import React from "react";
import { Search } from "lucide-react";
import NotificationDropdown from "../../../shared/shared-components/NotificationDropdown";
import SearchBar from "../SearchBar";
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
          <div className="hidden md:flex flex-1 max-w-md mx-8 justify-center">
            <SearchBar />
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