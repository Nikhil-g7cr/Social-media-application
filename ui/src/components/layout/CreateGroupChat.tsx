import React, { useState } from 'react';
import { Button, Modal, Input, Select, Space, message } from 'antd';
import { UsergroupAddOutlined } from '@ant-design/icons';

// Define the structure of the data you want to send back to the main page
export interface GroupData {
  name: string;
  members: string[]; // Adjust this to 'number[]' if you use user IDs instead
}

interface CreateGroupProps {
  onSubmit: (data: GroupData) => void;
}

// Mock data for members (replace this with your actual contacts/users list)
const MEMBER_OPTIONS = [
  { label: 'Alice Smith', value: 'user_1' },
  { label: 'Bob Jones', value: 'user_2' },
  { label: 'Charlie Brown', value: 'user_3' },
];

const CreateGroupFeature: React.FC<CreateGroupProps> = ({ onSubmit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleOk = () => {
    // Basic validation
    if (!groupName.trim()) {
      message.error('Please enter a group name');
      return;
    }
    if (selectedMembers.length === 0) {
      message.error('Please select at least one member');
      return;
    }

    // Pass the data back to the parent component
    onSubmit({ name: groupName, members: selectedMembers });

    // Close the popup and reset the fields
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setGroupName('');
    setSelectedMembers([]);
  };

  return (
    <>
      {/* 1 & 2: Trigger Button with Ant Design Logo/Icon */}
      <Button
        type="primary"
        icon={<UsergroupAddOutlined />}
        onClick={showModal}
      >
        Create Group
      </Button>

      {/* 3: The Popup Modal */}
      <Modal
        title="Create New Group"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Done"
        cancelText="Cancel"
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          
          {/* Group Name Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Group Name
            </label>
            <Input
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Add Members Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Add Members
            </label>
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Select members to add"
              value={selectedMembers}
              onChange={setSelectedMembers}
              options={MEMBER_OPTIONS}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

        </Space>
      </Modal>
    </>
  );
};

export default CreateGroupFeature;