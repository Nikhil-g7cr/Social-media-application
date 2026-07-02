import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useSearchUsersQuery } from "../../../redux/features/user/userApiSlice";
import FollowButton from "../../features/Social/FollowButton";
import Avatar from "../../../shared/shared-components/Avatar";
import { useDebouncedSearch } from "../../../hooks/useDebouncedSearch";

const SearchBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce the search input
  const { searchTerm, setSearchTerm, debouncedTerm, maxLength } = useDebouncedSearch("",500,);

  const { data: searchResults = [], isFetching } = useSearchUsersQuery(debouncedTerm.trim(), {skip: debouncedTerm.trim().length < 2,});

  // ---------------end----------------------

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
          placeholder="Search users..."
          value={searchTerm}
          maxLength={maxLength}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && debouncedTerm.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-80 overflow-y-auto">
          {isFetching ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <ul className="py-2">
              {searchResults.map((user) => (
                <li
                  key={user.id}
                  className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar
                      url={user.avatarUrl}
                      name={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        @{user.username}
                      </span>
                    </div>
                  </div>
                  <FollowButton userId={user.id} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No users found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
