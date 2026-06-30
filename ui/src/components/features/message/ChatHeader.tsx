import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Trash2,
  UserPlus,
  Video,
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
}: ChatHeaderProps) => (
  <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
    <div className="flex items-center gap-3">
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
        <p className="text-xs text-gray-500">
          {activeConversation.type === "group"
            ? `${activeConversation.participants.length + 1} members`
            : onlineUserIds.includes(activeConversation.participantId ?? "")
              ? "Active now"
              : "Offline"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 text-gray-500">
      {activeConversation.type === "group" && (
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

export default ChatHeader;
