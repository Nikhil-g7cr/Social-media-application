import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../../redux/store';
import { logout } from '../../redux/features/auth/AuthSlice';
import Avatar from './Avatar';
import { Settings, Shield, LogOut, ChevronDown } from 'lucide-react';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Assuming dispatching logout correctly clears state and maybe triggers API
    // If you need the async API call, dispatch(logout()) handles the local state.
    // AuthSlice might have a thunk, but here dispatch(logout()) is safe as a basic fallback.
    dispatch(logout() as any);
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar
          url={user?.image_url}
          name={user?.name}
          className="h-10 w-10 rounded-full border border-gray-200 object-cover shadow-sm"
        />
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-5 duration-200">
          
          {/* User Info Header */}
          <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name || "User Name"}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || "email"}</p>
          </div>

          <div className="py-2">
            {/* Conditional Role Dashboard Link */}
            {user?.role === 'ADMIN' && (
              <Link 
                to="/admin" 
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
              >
                <Shield className="w-4 h-4 mr-3 text-purple-500" />
                Role: Admin (Panel)
              </Link>
            )}

            {user?.role === 'MANAGER' && (
              <Link 
                to="/manager" 
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                <Shield className="w-4 h-4 mr-3 text-indigo-500" />
                Role: Manager (Panel)
              </Link>
            )}

            {/* Profile / Settings */}
            <Link 
              to={`/profile/${user?.id}`} 
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Avatar url={user?.image_url} name={user?.name} className="w-4 h-4 mr-3 rounded-full" />
              My Profile
            </Link>

            <Link 
              to="/settings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3 text-gray-400" />
              Settings
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3 text-red-500" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
