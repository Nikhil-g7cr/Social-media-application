import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Tabs, Modal, Input, Spin, message } from 'antd';
import type { TabsProps } from 'antd';
import { MdDelete, MdDescription } from 'react-icons/md';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { 
  useGetFilesQuery, 
  useDeleteFileMutation, 
  useCreateFileRequestMutation 
} from '../../redux/features/gallery/galleryApiSlice';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Meta } = Card;

interface FileItem {
  name: string;
  url: string;
  contentType: string;
  size: number;
  createdOn: string;
}

const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState('ALL');
  
  // Delete Request Modal state (For Manager/User)
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Hard Delete Modal state (For Admin)
  const [openAdminDeleteModal, setOpenAdminDeleteModal] = useState(false);
  const [adminDeleteConfirmText, setAdminDeleteConfirmText] = useState('');

  // RTK Query Hooks
  const { data: files = [], isLoading, isFetching } = useGetFilesQuery();
  const [deleteFile] = useDeleteFileMutation();
  const [createFileRequest, { isLoading: isSubmitting }] = useCreateFileRequestMutation();

  // Snackbar state
  const [messageApi, contextHolder] = message.useMessage();

  // Get user role from Redux
  const userRole = useSelector((state: RootState) => state.auth.user?.role) || 'USER';

  const handleFilterChange = (key: string) => {
    setFilter(key);
  };

  const filteredFiles = files.filter((file: FileItem) => {
    if (filter === 'ALL') return true;
    if (filter === 'IMAGES') return file.contentType?.startsWith('image/');
    if (filter === 'VIDEOS') return file.contentType?.startsWith('video/');
    if (filter === 'DOCUMENTS') return !file.contentType?.startsWith('image/') && !file.contentType?.startsWith('video/');
    return true;
  });

  const handleDeleteClick = (file: FileItem) => {
    setSelectedFile(file);
    if (userRole === 'ADMIN') {
      setAdminDeleteConfirmText('');
      setOpenAdminDeleteModal(true);
    } else {
      setOpenDeleteModal(true);
    }
  };

  const handleDeleteFileDirectly = async (url: string) => {
    try {
      await deleteFile(url).unwrap();
      messageApi.success('File deleted successfully');
      setOpenAdminDeleteModal(false);
    } catch (error) {
      console.error('Error deleting file:', error);
      messageApi.error('Failed to delete file');
    }
  };

  const submitDeleteRequest = async () => {
    if (!deleteReason.trim()) {
      messageApi.error('Reason is required');
      return;
    }

    try {
      await createFileRequest({
        fileName: selectedFile?.name,
        fileUrl: selectedFile?.url,
        reason: deleteReason
      }).unwrap();
      
      messageApi.success('Delete request submitted successfully');
      setOpenDeleteModal(false);
      setDeleteReason('');
    } catch (error) {
      console.error('Error submitting request:', error);
      messageApi.error('Failed to submit delete request');
    }
  };

  const isImage = (type: string) => type?.startsWith('image/');
  const isVideo = (type: string) => type?.startsWith('video/');

  const tabItems: TabsProps['items'] = [
    { key: 'ALL', label: 'All Files' },
    { key: 'IMAGES', label: 'Images' },
    { key: 'VIDEOS', label: 'Videos' },
    { key: 'DOCUMENTS', label: 'Documents / Other' },
  ];

  return (
    <div style={{ padding: 0 }}>
      {contextHolder}
      <Title level={4} style={{ marginBottom: 16 }}>
        Gallery
      </Title>

      <div style={{ marginBottom: 24 }}>
        <Tabs activeKey={filter} onChange={handleFilterChange} items={tabItems} />
      </div>

      {isLoading || isFetching ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {filteredFiles.map((file: FileItem, index: number) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                hoverable
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                styles={{ body: { flexGrow: 1 } }}
                cover={
                  isImage(file.contentType) ? (
                    <img
                      alt={file.name}
                      src={file.url}
                      style={{ height: 140, objectFit: 'cover' }}
                    />
                  ) : isVideo(file.contentType) ? (
                    <video
                      height={140}
                      src={file.url}
                      controls
                      style={{ objectFit: 'cover', width: '100%' }}
                    />
                  ) : (
                    <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                      <MdDescription style={{ fontSize: 60, color: '#bfbfbf' }} />
                    </div>
                  )
                }
                actions={[
                  <Button type="link" size="small" href={file.url} target="_blank" rel="noopener noreferrer">
                    Preview
                  </Button>,
                  <Button type="text" danger icon={<MdDelete />} onClick={() => handleDeleteClick(file)} />
                ]}
              >
                <Meta
                  title={<span title={file.name}>{file.name.split('/').pop()}</span>}
                  description={
                    <div>
                      <Text type="secondary" style={{ display: 'block' }}>{file.contentType || 'Unknown type'}</Text>
                      <Text type="secondary" style={{ display: 'block' }}>{(file.size / 1024).toFixed(2)} KB</Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
          {filteredFiles.length === 0 && (
            <Col span={24}>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">No files found.</Text>
              </div>
            </Col>
          )}
        </Row>
      )}

      {/* Admin Hard Delete Modal */}
      <Modal
        title="Permanently Delete File"
        open={openAdminDeleteModal}
        onCancel={() => setOpenAdminDeleteModal(false)}
        footer={[
          <Button key="back" onClick={() => setOpenAdminDeleteModal(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger 
            disabled={adminDeleteConfirmText !== 'delete'}
            onClick={() => selectedFile && handleDeleteFileDirectly(selectedFile.url)}
          >
            Permanently Delete
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Are you sure you want to permanently delete the file <strong>{selectedFile?.name.split('/').pop()}</strong>?</Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">This action cannot be undone. Please type <strong>delete</strong> to confirm.</Text>
          </div>
        </div>
        <Input
          autoFocus
          placeholder="Type 'delete' to confirm"
          value={adminDeleteConfirmText}
          onChange={(e) => setAdminDeleteConfirmText(e.target.value)}
        />
      </Modal>

      {/* Request File Deletion Modal (For Manager/User) */}
      <Modal
        title="Request File Deletion"
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        footer={[
          <Button key="back" onClick={() => setOpenDeleteModal(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger 
            loading={isSubmitting} 
            disabled={!deleteReason.trim()}
            onClick={submitDeleteRequest}
          >
            Submit Request
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>File: {selectedFile?.name.split('/').pop()}</Text>
        </div>
        <TextArea
          autoFocus
          placeholder="Reason for deletion"
          rows={4}
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default GalleryPage;
