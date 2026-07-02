import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import {
  useGetFollowersQuery,
  useGetFollowingQuery,
  useSearchUsersQuery,
} from "../../../redux/features/user/userApiSlice";
import { useDebouncedSearch } from "../../../hooks/useDebouncedSearch";
import Avatar from "../../../shared/shared-components/Avatar";
import { useAppSelector } from "../../../redux/hooks";

export interface SearchedUser {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
}

interface UserSearchProps {
  onSelect: (user: SearchedUser) => void;
  placeholder?: string;
  excludeUserIds?: string[]; // IDs to filter out from results (e.g. already selected users)
  clearOnSelect?: boolean; // Whether to clear the search input after selection
}

const UserSearch: React.FC<UserSearchProps> = ({
  onSelect,
  placeholder = "Search users...",
  excludeUserIds = [],
  clearOnSelect = true,
}) => {
  // Destructure the internal state and debounced value from your custom hook
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch("", 500);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Pass ONLY the debounced string to the RTK Query
  const { data: searchResults, isFetching: isSearching } = useSearchUsersQuery(
    debouncedTerm,
    { skip: debouncedTerm.length < 2 }
  );
  const { data: followers = [] } = useGetFollowersQuery(currentUserId || "", {
    skip: !currentUserId,
  });
  const { data: following = [] } = useGetFollowingQuery(currentUserId || "", {
    skip: !currentUserId,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (user: SearchedUser) => {
    onSelect(user);
    if (clearOnSelect) {
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  const followerIds = new Set(followers.map((user) => user.id));
  const followingIds = new Set(following.map((user) => user.id));

  // Filter out users that are already selected and keep only mutual follows.
  const filteredResults = searchResults?.filter(
    (user: any) =>
      !excludeUserIds.includes(user.id) &&
      followerIds.has(user.id) &&
      followingIds.has(user.id)
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Searching...
            </div>
          ) : filteredResults && filteredResults.length > 0 ? (
            filteredResults.map((user: SearchedUser) => (
              <div
                key={user.id}
                onClick={() => handleSelect(user)}
                className="cursor-pointer select-none relative px-4 py-3 hover:bg-gray-50 flex items-center transition duration-150 ease-in-out"
              >
                <Avatar
                  url={user.avatarUrl}
                  name={user.name}
                //   size="sm"
                  className="mr-3 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="block truncate font-medium text-gray-900">
                    {user.name}
                  </span>
                  <span className="block truncate text-gray-500 text-xs">
                    @{user.username}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No users found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
