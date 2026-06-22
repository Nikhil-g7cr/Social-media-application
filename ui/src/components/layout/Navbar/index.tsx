import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { Search } from "lucide-react";
import NotificationDropdown from "../../../shared/shared-components/NotificationDropdown";
import SearchBar from "../SearchBar";
import { Link } from "react-router-dom";
import PostImage from "../../../shared/shared-components/PostImage";
import Avatar from "../../../shared/shared-components/Avatar";
import ProfileDropdown from "../../../shared/shared-components/ProfileDropdown";
const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <div className="flex items-center space-x-3">
              <img src="/logo1.png" alt="Brand Logo" className="h-10 w-10 object-contain" />
              <img src="/name.png" alt="Brand Name" className="hidden md:block md:h-8 object-contain" />
            </div>
          </Link>

          {/* Search */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 max-w-md mx-8 justify-center">
              <SearchBar />
            </div>
          )}

          {/* Right */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="relative p-2 rounded-full hover:bg-gray-100">
                  <NotificationDropdown />
                </div>

                <ProfileDropdown />
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                  Log in
                </Link>
                <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;