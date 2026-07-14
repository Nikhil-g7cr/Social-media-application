import React, { useState } from "react";
import { Button, Modal, Input, Space, message } from "antd";
import { UsergroupAddOutlined } from "@ant-design/icons";
import { X } from "lucide-react";
import Avatar from "../../shared/shared-components/Avatar";
import type { SearchedUser } from "../features/message/userSearchBar";
import UserSearch from "../features/message/userSearchBar";

// Define the structure of the data you want to send back to the main page
export interface CreateGroupData {
  title: string;
  participants: string[];
}

interface CreateGroupProps {
  onSubmit: (data: CreateGroupData) => void;
}

const CreateGroupFeature: React.FC<CreateGroupProps> = ({ onSubmit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<SearchedUser[]>([]);

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleOk = () => {
    if (!groupName.trim()) {
      message.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length === 0) {
      message.error("Please select at least one member");
      return;
    }

    // Pass the mapped participant IDs back to the parent
    onSubmit({
      title: groupName,
      participants: selectedMembers.map((member) => member.id),
    });

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setGroupName("");
    setSelectedMembers([]);
  };

  const handleSelectUser = (user: SearchedUser) => {
    if (!selectedMembers.find((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  return (
    <>
      <Button
        type="primary"
        icon={<UsergroupAddOutlined />}
        onClick={showModal}
        title="Create Group"
        className="bg-blue-600 hover:bg-blue-700"
      />

      <Modal
        title={<span className="font-semibold text-lg">Create New Group</span>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Done"
        cancelText="Cancel"
        destroyOnClose
      >
        <Space
          direction="vertical"
          style={{ width: "100%", marginTop: "16px" }}
          size="large"
        >
          {/* Group Name Input */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Group Name
            </label>
            <Input
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              size="large"
            />
          </div>

          {/* Add Members using the new UserSearch component */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Add Members
            </label>
            <UserSearch
              onSelect={handleSelectUser}
              placeholder="Search by name or username..."
              excludeUserIds={selectedMembers.map((m) => m.id)} // Exclude already selected
            />

            {/* Display Selected Members as Chips */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center bg-blue-50 text-blue-700 rounded-full pl-1 pr-2 py-1 text-sm border border-blue-100"
                  >
                    <Avatar
                      url={member.avatarUrl}
                      name={member.name}
                      className="mr-2 h-7 w-7 rounded-full object-cover"
                    />
                    <span className="font-medium mr-2">{member.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(member.id)}
                      className="text-blue-400 hover:text-blue-600 focus:outline-none p-0.5 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default CreateGroupFeature;
