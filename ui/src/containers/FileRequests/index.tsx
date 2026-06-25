import React from 'react';
import { Typography, Table, Button, Tag, Spin, message, Space } from 'antd';
import type { TableProps } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { 
  useGetFileRequestsQuery, 
  useUpdateFileRequestStatusMutation 
} from '../../redux/features/gallery/galleryApiSlice';
import { useDeletePostMutation } from '../../redux/features/post/postApiSlice';

const { Title } = Typography;

interface RequestItem {
  ID: string;
  FileName: string;
  FileUrl: string;
  RequestReason: string;
  Status: string;
  CreatedAt: string;
  RequestedByUser?: {
    FullName: string;
  };
}

const FileRequestsPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const userRole = useSelector((state: RootState) => state.auth.user?.role) || 'USER';

  // RTK Query Hooks
  const { data: responseData, isLoading, isFetching } = useGetFileRequestsQuery();
  const [updateStatus] = useUpdateFileRequestStatusMutation();
  const [deletePost] = useDeletePostMutation();

  const requests: RequestItem[] = responseData?.data && Array.isArray(responseData.data) 
    ? responseData.data 
    : (Array.isArray(responseData) ? responseData : []);

  const handleUpdateStatus = async (record: RequestItem, status: string) => {
    try {
      if (status === 'APPROVED' && record.FileUrl?.includes('/POST:')) {
        const postId = record.FileUrl.split('/POST:')[1];
        await deletePost(postId).unwrap();
      }
      await updateStatus({ id: record.ID, status }).unwrap();
      messageApi.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating request status:', error);
      messageApi.error('Error updating status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'warning';
    }
  };

  const columns: TableProps<RequestItem>['columns'] = [
    {
      title: 'Target Name',
      key: 'FileName',
      render: (_, record) => {
        if (record.FileUrl?.includes('/POST:')) return record.FileName;
        return record.FileName?.split('/').pop() || 'Unknown';
      },
    },
    {
      title: 'Type',
      key: 'FileType',
      render: (_, record) => {
        if (record.FileUrl?.includes('/POST:')) return <Tag color="blue">POST</Tag>;
        return record.FileName?.split('.').pop()?.toUpperCase() || 'Unknown';
      },
    },
    {
      title: 'Requested By',
      key: 'RequestedBy',
      render: (_, record) => record.RequestedByUser?.FullName || 'Unknown',
    },
    {
      title: 'Reason',
      dataIndex: 'RequestReason',
      key: 'RequestReason',
    },
    {
      title: 'Date',
      key: 'Date',
      render: (_, record) => new Date(record.CreatedAt).toLocaleDateString(),
    },
    {
      title: 'Status',
      key: 'Status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.Status)}>
          {record.Status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'Actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          {record.FileUrl?.includes('/POST:') ? (
            <Button size="small" disabled title="Cannot preview post content directly from here">
              View Post
            </Button>
          ) : (
            <Button 
              size="small" 
              href={record.FileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View File
            </Button>
          )}
          
          {userRole === 'ADMIN' && record.Status === 'PENDING' && (
            <Space>
              <Button 
                size="small" 
                type="primary"
                style={{ backgroundColor: '#52c41a' }}
                onClick={() => handleUpdateStatus(record, 'APPROVED')}
              >
                Approve
              </Button>
              <Button 
                size="small" 
                danger
                type="primary"
                onClick={() => handleUpdateStatus(record, 'REJECTED')}
              >
                Reject
              </Button>
            </Space>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      {contextHolder}
      <Title level={4} style={{ marginBottom: 16 }}>
        File Requests
      </Title>

      {isLoading || isFetching ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={requests} 
          rowKey="ID"
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default FileRequestsPage;
