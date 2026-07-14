import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Trash2,
  UserPlus,
  Video,
  ChevronDown,
  Crown,
} from "lucide-react";
import Avatar from "../../../shared/shared-components/Avatar";
import type { UIConversation } from "../../../shared/interfaces/conversation";

interface ChatHeaderProps {
  activeConversation: UIConversation;
  onlineUserIds: string[];
  onBack: () => void;
  onClearChat: () => void;
  onOpenAddMemberModal: () => void;
}

const ChatHeader = ({
  activeConversation,
  onlineUserIds,
  onBack,
  onClearChat,
  onOpenAddMemberModal,
}: ChatHeaderProps) => {
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const isGroup = activeConversation.type === "group";
  const memberCount = activeConversation.participants.length;

  return (
  <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
    <div className="relative flex items-center gap-3">
      <button
        onClick={onBack}
        className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <Avatar
        url={
          activeConversation.displayAvatar ||
          activeConversation.avatarUrl ||
          undefined
        }
        name={activeConversation.displayName || undefined}
        className="h-10 w-10 rounded-full object-cover"
      />
      <div>
        <h3 className="text-md font-semibold text-gray-900">
          {activeConversation.displayName}
        </h3>
        {isGroup ? (
          <button
            type="button"
            onClick={() => setIsMembersOpen((open) => !open)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
            aria-expanded={isMembersOpen}
          >
            {memberCount} {memberCount === 1 ? "member" : "members"}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isMembersOpen ? "rotate-180" : ""}`} />
          </button>
        ) : (
          <p className="text-xs text-gray-500">
            {onlineUserIds.includes(activeConversation.participantId ?? "")
              ? "Active now"
              : "Offline"}
          </p>
        )}
      </div>

      {isGroup && isMembersOpen && (
        <div className="absolute left-0 top-full z-30 mt-3 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Group members</p>
            <p className="text-xs text-gray-500">{memberCount} total</p>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {activeConversation.participants.map((member) => {
              const isAdmin = member.role === "admin" || member.role === "owner";

              return (
                <Link
                  key={member.id}
                  to={`/profile/${member.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
                  onClick={() => setIsMembersOpen(false)}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      url={member.avatarUrl || undefined}
                      name={member.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    {onlineUserIds.includes(member.id) && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="truncate text-xs text-gray-500">@{member.username}</p>
                  </div>
                  {isAdmin && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                      <Crown className="h-3 w-3" />
                      {member.role === "owner" ? "Owner" : "Admin"}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
    <div className="flex items-center gap-2 text-gray-500">
      {isGroup && (
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition"
          onClick={onOpenAddMemberModal}
          title="Add member"
        >
          <UserPlus className="h-5 w-5" />
        </button>
      )}
      <button
        className="p-2 hover:bg-gray-100 rounded-full transition"
        onClick={onClearChat}
        title="Clear Chat History"
      >
        <Trash2 className="h-5 w-5 text-red-500" />
      </button>
      <button className="p-2 hover:bg-gray-100 rounded-full transition">
        <Phone className="h-5 w-5" />
      </button>
      <button className="p-2 hover:bg-gray-100 rounded-full transition">
        <Video className="h-5 w-5" />
      </button>
      <button className="p-2 hover:bg-gray-100 rounded-full transition">
        <MoreVertical className="h-5 w-5" />
      </button>
    </div>
  </div>
  );
};

export default ChatHeader;
