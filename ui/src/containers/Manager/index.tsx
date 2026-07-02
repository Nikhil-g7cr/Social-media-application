import React, { useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { Navigate } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';
import { useGetUsersQuery, useUpdateUserProfileMutation } from '../../redux/features/user/userApiSlice';
import { useGetAllExplorePostsQuery, useDeletePostMutation } from '../../redux/features/post/postApiSlice';
import { useGetReportsQuery, useResolveReportMutation } from '../../redux/features/report/reportApiSlice';
import { FiUsers, FiFileText, FiMessageSquare, FiAlertOctagon, FiImage, FiFolder } from 'react-icons/fi';
import GalleryPage from '../Gallery';
import FileRequestsPage from '../FileRequests';
import { PanelShell } from '../../components/layout/Panel';
import { Modal, Input, message } from 'antd';
import { useCreateFileRequestMutation } from '../../redux/features/gallery/galleryApiSlice';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const user = useAppSelector((state: any) => state.auth.user);
  const onlineUserIds = useAppSelector((state: any) => state.onlineUsers.onlineUserIds);

  const { data: usersData = [], isLoading: isLoadingUsers, isError: isErrorUsers } = useGetUsersQuery();
  const { data: postsData, isLoading: isLoadingPosts, isError: isErrorPosts } = useGetAllExplorePostsQuery({ page: 1, limit: 100 });
  const { data: reportsData = [], isLoading: isLoadingReports, isError: isErrorReports } = useGetReportsQuery();

  const [updateUser] = useUpdateUserProfileMutation();
  const [deletePost] = useDeletePostMutation();
  const [resolveReport] = useResolveReportMutation();
  const [createFileRequest, { isLoading: isSubmitting }] = useCreateFileRequestMutation();

  const [deletePostModal, setDeletePostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleToggleSuspend = async (userId: string, isActive: boolean) => {
    await updateUser({ id: userId, isActive: !isActive });
  };

  const submitDeleteRequest = async () => {
    if (!deleteReason.trim()) {
      messageApi.error('Reason is required');
      return;
    }

    try {
      await createFileRequest({
        fileName: `[POST DELETION] by @${selectedPost?.author?.username || 'Unknown'}`,
        fileUrl: `https://mock.blob.core.windows.net/posts/POST:${selectedPost?.id}`,
        reason: deleteReason
      }).unwrap();
      
      messageApi.success('Delete request submitted successfully');
      setDeletePostModal(false);
      setDeleteReason('');
      setSelectedPost(null);
    } catch (error) {
      console.error('Error submitting request:', error);
      messageApi.error('Failed to submit delete request');
    }
  };

  const userColumns = [
    { key: 'name', label: 'Name', render: (val: string, row: any) => (
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${onlineUserIds.includes(row.id) ? 'bg-green-500' : 'bg-gray-400'}`} title={onlineUserIds.includes(row.id) ? 'Online' : 'Offline'}></div>
          <img src={row.avatarUrl || `https://ui-avatars.com/api/?name=${val}&background=random`} alt={val} className="w-8 h-8 rounded-full object-cover" />
        </div>
        <span className="font-medium text-gray-800">{val}</span>
      </div>
    ) },
    { key: 'username', label: 'Username', render: (val: string) => <span className="text-gray-500">@{val}</span> },
    { key: 'isActive', label: 'Status', render: (val: boolean) => <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold flex items-center w-max space-x-1 ${val !== false ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${val !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span><span>{val !== false ? 'Active' : 'Suspended'}</span></span> },
  ];

  const postColumns = [
    { key: 'author', label: 'Author', render: (val: any) => <div className="flex flex-col"><span className="font-medium text-gray-800">{val?.name}</span><span className="text-xs text-gray-500">@{val?.username}</span></div> },
    { key: 'content', label: 'Content', render: (val: string) => <span className="truncate max-w-50 block text-gray-600" title={val}>{val}</span> },
    { key: 'timestamp', label: 'Date', render: (val: string) => <span className="text-gray-500 text-sm">{val}</span> },
    // { key: 'likes', label: 'Engagement', render: (val: number, row: any) => <div className="flex space-x-3 text-xs text-gray-500"><span>👍 {val}</span><span>💬 {row.comments}</span></div> },
  ];

  const reportColumns = [
    { key: 'reporterName', label: 'Reported By', render: (val: string) => <span className="font-medium text-gray-800">{val}</span> },
    { key: 'targetType', label: 'Target Type', render: (val: string) => <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-semibold">{val}</span> },
    { key: 'reason', label: 'Reason', render: (val: string) => <span className="text-gray-600 truncate max-w-37.5 block" title={val}>{val}</span> },
    { key: 'status', label: 'Status', render: (val: string) => <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${val === 'PENDING' ? 'bg-amber-100 text-amber-700 border border-amber-200' : val === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>{val}</span> },
    { key: 'createdAt', label: 'Date', render: (val: string) => <span className="text-gray-500 text-sm">{new Date(val).toLocaleDateString()}</span> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-800 to-gray-600 mb-6">Suspend Users</h2>
            {isLoadingUsers ? (
              <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div></div>
            ) : isErrorUsers ? (
              <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-100 text-center">Error loading users data. Please try again later.</div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <DataTable 
                  columns={userColumns} 
                  data={usersData} 
                  actions={(row) => (
                    <div className="space-x-3 flex justify-end">
                      {row.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleToggleSuspend(row.id, row.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${row.isActive !== false ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:shadow-sm' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-sm'}`}
                        >
                          {row.isActive !== false ? 'Temporarily Suspend' : 'Activate'}
                        </button>
                      )}
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        );
      case 'posts':
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-800 to-gray-600 mb-6">Moderate Posts</h2>
            {isLoadingPosts ? (
              <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div></div>
            ) : isErrorPosts ? (
              <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-100 text-center">Error loading posts data. Please try again later.</div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <DataTable 
                  columns={postColumns} 
                  data={postsData?.posts || []} 
                  actions={(row) => (
                    <div className="space-x-3 flex justify-end">
                      <button 
                        onClick={() => {
                          setSelectedPost(row);
                          setDeletePostModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-sm transition-all duration-200"
                      >
                        Request Deletion
                      </button>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        );
      case 'reports':
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-800 to-gray-600 mb-6">User Complaints</h2>
            {isLoadingReports ? (
              <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div></div>
            ) : isErrorReports ? (
              <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-100 text-center">Error loading reports data. Please try again later.</div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <DataTable 
                  columns={reportColumns} 
                  data={reportsData} 
                  actions={(row) => (
                    <div className="space-x-2 flex justify-end">
                      {row.status === 'PENDING' ? (
                        <>
                          <button 
                            onClick={() => resolveReport({ id: row.id, status: 'RESOLVED' })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-sm transition-all duration-200"
                          >
                            Resolve
                          </button>
                          <button 
                            onClick={() => resolveReport({ id: row.id, status: 'DISMISSED' })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm transition-all duration-200"
                          >
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic px-2 py-1">Actioned</span>
                      )}
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        );
      case 'comments':
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-800 to-gray-600 mb-6">Moderate Comments</h2>
            <div className="p-12 flex flex-col items-center justify-center text-gray-500 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
              <FiMessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600">Comments Module</p>
              <p className="text-sm">This module is scheduled for a future update.</p>
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div className="animate-fade-in-up">
            <GalleryPage />
          </div>
        );
      case 'file-requests':
        return (
          <div className="animate-fade-in-up">
            <FileRequestsPage />
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'posts', label: 'Moderate Posts', icon: FiFileText },
    { id: 'comments', label: 'Moderate Comments', icon: FiMessageSquare },
    { id: 'reports', label: 'User Complaints', icon: FiAlertOctagon },
    { id: 'users', label: 'Suspend Users', icon: FiUsers },
    { id: 'gallery', label: 'Gallery', icon: FiImage },
    { id: 'file-requests', label: 'File Requests', icon: FiFolder },
  ];

  return (
    <>
      {contextHolder}
      <PanelShell
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        title="Manager Control"
        badge="M"
      >
        {renderContent()}
      </PanelShell>

      <Modal
        title="Request Post Deletion"
        open={deletePostModal}
        onCancel={() => {
          setDeletePostModal(false);
          setDeleteReason('');
        }}
        footer={[
          <button key="back" onClick={() => setDeletePostModal(false)} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md mr-2 hover:bg-gray-50 transition-colors">
            Cancel
          </button>,
          <button 
            key="submit" 
            className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50 hover:bg-red-700 transition-colors"
            disabled={!deleteReason.trim() || isSubmitting}
            onClick={submitDeleteRequest}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <p className="text-gray-600 text-sm">You are requesting the deletion of a post by <strong>@{selectedPost?.author?.username}</strong>.</p>
        </div>
        <Input.TextArea
          autoFocus
          placeholder="Reason for deletion"
          rows={4}
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default ManagerDashboard;
