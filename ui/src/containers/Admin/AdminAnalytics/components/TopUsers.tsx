import React from 'react';
import { Table } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Avatar from '../../../../shared/shared-components/Avatar';

interface TopUsersProps {
    users: any[];
}

const TopUsers: React.FC<TopUsersProps> = ({ users }) => {
    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (_: any, record: any) => (
                <div className="flex items-center gap-3">
                    <Avatar 
                        url={record.ProfilePictureUrl} 
                        name={record.FullName || 'Unknown User'}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <div className="font-medium text-gray-900">{record.FullName || 'Unknown User'}</div>
                        <div className="text-xs text-gray-500">@{record.UserName}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Posts Created',
            dataIndex: 'PostCount',
            key: 'PostCount',
            sorter: (a: any, b: any) => a.PostCount - b.PostCount,
            render: (val: number) => <span className="font-medium text-gray-700">{val || 0}</span>
        }
    ];

    return (
        <div>
            <Table 
                dataSource={users} 
                columns={columns} 
                rowKey="ID"
                pagination={false}
                size="middle"
                className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-500 [&_.ant-table-thead>tr>th]:font-medium"
            />
        </div>
    );
};

export default TopUsers;
