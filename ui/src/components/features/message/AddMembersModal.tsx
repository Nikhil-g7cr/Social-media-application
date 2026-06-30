import { Modal } from "antd";
import { X } from "lucide-react";
import UserSearch, { type SearchedUser } from "./userSearchBar";
import Avatar from "../../../shared/shared-components/Avatar";
import type { UIConversation } from "../../../shared/interfaces/conversation";

interface AddMembersModalProps {
  activeConversation: UIConversation | null;
  currentUserId: string;
  isAddingGroupMembers: boolean;
  isOpen: boolean;
  selectedMembers: SearchedUser[];
  onAddMembers: () => void;
  onCancel: () => void;
  onRemoveMember: (userId: string) => void;
  onSelectMember: (member: SearchedUser) => void;
}

const AddMembersModal = ({
  activeConversation,
  currentUserId,
  isAddingGroupMembers,
  isOpen,
  selectedMembers,
  onAddMembers,
  onCancel,
  onRemoveMember,
  onSelectMember,
}: AddMembersModalProps) => (
  <Modal
    title="Add members"
    open={isOpen}
    onOk={onAddMembers}
    onCancel={onCancel}
    okText="Add"
    confirmLoading={isAddingGroupMembers}
    okButtonProps={{ disabled: selectedMembers.length === 0 }}
    destroyOnClose
  >
    <div className="space-y-4 pt-2">
      <UserSearch
        onSelect={onSelectMember}
        placeholder="Search by name or username..."
        excludeUserIds={[
          currentUserId,
          ...(activeConversation?.participants.map((member) => member.id) ??
            []),
          ...selectedMembers.map((member) => member.id),
        ]}
      />

      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center bg-blue-50 text-blue-700 rounded-full pl-1 pr-2 py-1 text-sm border border-blue-100"
            >
              <Avatar
                url={member.avatarUrl}
                name={member.name}
                className="w-6 h-6 mr-2"
              />
              <span className="font-medium mr-2">{member.name}</span>
              <button
                type="button"
                onClick={() => onRemoveMember(member.id)}
                className="text-blue-400 hover:text-blue-600 focus:outline-none p-0.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </Modal>
);

export default AddMembersModal;
