import React, { useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { Navigate } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';
import { useGetUsersQuery, useUpdateUserProfileMutation } from '../../redux/features/user/userApiSlice';
import { useGetAllExplorePostsQuery, useDeletePostMutation } from '../../redux/features/post/postApiSlice';
import { useGetReportsQuery, useResolveReportMutation } from '../../redux/features/report/reportApiSlice';
import { FiUsers, FiFileText, FiMessageSquare, FiAlertOctagon, FiMenu, FiX, FiImage, FiFolder } from 'react-icons/fi';
import GalleryPage from '../Gallery';
import FileRequestsPage from '../FileRequests';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useAppSelector((state: any) => state.auth.user);
  const onlineUserIds = useAppSelector((state: any) => state.onlineUsers.onlineUserIds);

  const { data: usersData = [], isLoading: isLoadingUsers, isError: isErrorUsers } = useGetUsersQuery();
  const { data: postsData, isLoading: isLoadingPosts, isError: isErrorPosts } = useGetAllExplorePostsQuery({ page: 1, limit: 100 });
  const { data: reportsData = [], isLoading: isLoadingReports, isError: isErrorReports } = useGetReportsQuery();

  const [updateUser] = useUpdateUserProfileMutation();
  const [deletePost] = useDeletePostMutation();
  const [resolveReport] = useResolveReportMutation();

  if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleToggleSuspend = async (userId: string, isActive: boolean) => {
    await updateUser({ id: userId, isActive: !isActive });
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
    { key: 'content', label: 'Content', render: (val: string) => <span className="truncate max-w-[200px] block text-gray-600" title={val}>{val}</span> },
    { key: 'timestamp', label: 'Date', render: (val: string) => <span className="text-gray-500 text-sm">{val}</span> },
    { key: 'likes', label: 'Engagement', render: (val: number, row: any) => <div className="flex space-x-3 text-xs text-gray-500"><span>👍 {val}</span><span>💬 {row.comments}</span></div> },
  ];

  const reportColumns = [
    { key: 'reporterName', label: 'Reported By', render: (val: string) => <span className="font-medium text-gray-800">{val}</span> },
    { key: 'targetType', label: 'Target Type', render: (val: string) => <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-semibold">{val}</span> },
    { key: 'reason', label: 'Reason', render: (val: string) => <span className="text-gray-600 truncate max-w-[150px] block" title={val}>{val}</span> },
    { key: 'status', label: 'Status', render: (val: string) => <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${val === 'PENDING' ? 'bg-amber-100 text-amber-700 border border-amber-200' : val === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>{val}</span> },
    { key: 'createdAt', label: 'Date', render: (val: string) => <span className="text-gray-500 text-sm">{new Date(val).toLocaleDateString()}</span> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 mb-6">Suspend Users</h2>
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
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 mb-6">Moderate Posts</h2>
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
                        onClick={() => deletePost(row.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 hover:shadow-sm transition-all duration-200"
                      >
                        Delete/Hide Post
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
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 mb-6">User Complaints</h2>
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
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 mb-6">Moderate Comments</h2>
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-20 lg:hidden pt-16"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with Glassmorphism */}
      <aside className={`w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/60 fixed h-full pt-16 lg:pt-20 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-8 pb-6 mb-2 border-b border-gray-100 relative mt-4 lg:mt-0">
          <button 
            className="lg:hidden absolute top-0 right-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FiX className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-xl font-bold">M</span>
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Manager Control</h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">Platform Moderation</p>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 shadow-sm border border-blue-100/50' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-20 p-4 lg:p-10 min-h-screen relative overflow-hidden w-full max-w-[100vw]">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-100/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 translate-x-1/3 -translate-y-1/2 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 -translate-x-1/4 translate-y-1/4 z-0 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-4 lg:hidden">
            <button 
              className="p-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none flex items-center gap-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FiMenu className="w-5 h-5" />
              <span className="font-semibold text-sm">Menu</span>
            </button>
          </div>
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-4 lg:p-8 min-h-[calc(100vh-8rem)]">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
