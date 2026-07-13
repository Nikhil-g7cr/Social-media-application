import type { RefObject } from "react";
import { Search } from "lucide-react";
import CreateGroupFeature from "../../layout/CreateGroupChat";
import Avatar from "../../../shared/shared-components/Avatar";
import type { UIConversation } from "../../../shared/interfaces/conversation";
import type { SearchedUser } from "./userSearchBar";
import type { CreateGroupData } from "../../../shared/interfaces/message";
import { SEARCH_INPUT_MAX_LENGTH } from "../../../hooks/useDebouncedSearch";
import { ConversationItemSkeleton } from "../../../shared/shared-components/Skeleton";
import Spinner from "../../../shared/shared-components/Spinner";

interface MessageSidebarProps {
  activeConversation: UIConversation | null;
  conversations: UIConversation[];
  currentUserId: string;
  debouncedTerm: string;
  isMobileChatOpen: boolean;
  isConversationsLoading?: boolean;
  isSearchFetching: boolean;
  isSearchOpen: boolean;
  onlineUserIds: string[];
  searchTerm: string;
  searchWrapperRef: RefObject<HTMLDivElement | null>;
  userSearchResults: SearchedUser[];
  onCreateGroupChat: (data: CreateGroupData) => void;
  onSearchFocus: () => void;
  onSearchTermChange: (value: string) => void;
  onSelectConversation: (conversation: UIConversation) => void;
  onStartNewChat: (targetUser: SearchedUser) => void;
}

const MessageSidebar = ({
  activeConversation,
  conversations,
  currentUserId,
  debouncedTerm,
  isMobileChatOpen,
  isConversationsLoading = false,
  isSearchFetching,
  isSearchOpen,
  onlineUserIds,
  searchTerm,
  searchWrapperRef,
  userSearchResults,
  onCreateGroupChat,
  onSearchFocus,
  onSearchTermChange,
  onSelectConversation,
  onStartNewChat,
}: MessageSidebarProps) => {
  const filteredResults =
    userSearchResults?.filter((u) => u.id !== currentUserId) || [];

  return (
    <div
      className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col ${isMobileChatOpen ? "hidden md:flex" : "flex"}`}
    >
      <div className="p-4 border-b border-gray-200" ref={searchWrapperRef}>
        <div className="flex flex-row justify-between align-middle">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
          <CreateGroupFeature onSubmit={onCreateGroupChat} />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users to chat..."
            value={searchTerm}
            maxLength={SEARCH_INPUT_MAX_LENGTH}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onFocus={onSearchFocus}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
          />
          {isSearchOpen && debouncedTerm.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-64 overflow-y-auto z-50">
              {isSearchFetching ? (
                <div className="p-4 flex justify-center">
                  <Spinner size="sm" label="Searching..." />
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No users found.
                </div>
              ) : (
                <ul className="py-2">
                  {filteredResults.map((searchedUser) => (
                    <li
                      key={searchedUser.id}
                      onClick={() => onStartNewChat(searchedUser)}
                      className="px-4 py-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <Avatar
                        url={searchedUser.avatarUrl}
                        name={searchedUser.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {searchedUser.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          @{searchedUser.username}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isConversationsLoading ? (
          <ConversationItemSkeleton count={5} />
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            No conversations yet. Search for someone above!
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 ${
                activeConversation?.id === conv.id ? "bg-blue-50/50" : ""
              }`}
            >
              <div className="relative shrink-0">
                <Avatar
                  url={conv.displayAvatar}
                  name={conv.displayName || "Unknown User"}
                />
                {conv.type === "single" &&
                  onlineUserIds.includes(conv.participantId ?? "") && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                  )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {conv.displayName}
                  </h3>
                  <span className="text-xs text-gray-500 shrink-0">
                    {conv.time}
                  </span>
                </div>
                <p
                  className={`text-sm truncate ${
                    conv.unreadCount > 0
                      ? "font-semibold text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <div className="shrink-0 bg-blue-600 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  {conv.unreadCount}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageSidebar;
