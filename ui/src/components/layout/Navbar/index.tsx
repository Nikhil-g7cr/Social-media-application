import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { ArrowLeft, Search } from "lucide-react";
import NotificationDropdown from "../../../shared/shared-components/NotificationDropdown";
import SearchBar from "../SearchBar";
import { Link } from "react-router-dom";
import PostImage from "../../../shared/shared-components/PostImage";
import Avatar from "../../../shared/shared-components/Avatar";
import ProfileDropdown from "../../../shared/shared-components/ProfileDropdown";
const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* ================= Desktop ================= */}
          <div className="hidden md:flex items-center justify-between w-full gap-6">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center space-x-3">
                <img
                  src="/logo1.png"
                  alt="Brand Logo"
                  className="h-10 w-10 object-contain"
                />

                <img
                  src="/name.png"
                  alt="Brand Name"
                  className="hidden lg:block h-8 object-contain"
                />
              </div>
            </Link>

            {/* Search */}
            {isAuthenticated && (
              <div className="flex-1 max-w-md">
                <SearchBar />
              </div>
            )}

            {/* Right */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <NotificationDropdown />
                  <ProfileDropdown />
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Log in
                  </Link>

                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* ================= Mobile ================= */}
          <div className="flex md:hidden items-center justify-between w-full h-16">
            {!showMobileSearch ? (
              <>
                {/* Logo */}
                <Link to="/" className="flex-shrink-0">
                  <img
                    src="/logo1.png"
                    alt="Logo"
                    className="h-10 w-10 object-contain"
                  />
                </Link>

                {/* Right Icons */}
                <div className="flex items-center gap-1">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => setShowMobileSearch(true)}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <Search className="h-5 w-5 text-gray-600" />
                      </button>
                      <NotificationDropdown />
                      <ProfileDropdown />
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="text-blue-600 font-medium px-2"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Back Button */}
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>

                {/* Search Container - MUST have flex-1 */}
                <div className="flex-1 px-2">
                  <SearchBar />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
