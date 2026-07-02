import React, { useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { Navigate } from 'react-router-dom';
import DataTable from '../../components/shared/DataTable';
import {
  useGetUsersQuery,
  useUpdateUserProfileMutation,
  useSoftDeleteUserMutation,
  useRestoreUserMutation,
  useHardDeleteUserMutation,
} from '../../redux/features/user/userApiSlice';
import { useGetAllExplorePostsQuery, useDeletePostMutation } from '../../redux/features/post/postApiSlice';
import { useGetReportsQuery, useResolveReportMutation } from '../../redux/features/report/reportApiSlice';
import {
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiAlertOctagon,
  FiTrash2,
  FiSlash,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiBarChart2,
} from 'react-icons/fi';
import ConfirmationModal from '../../components/shared/ConfirmationModal';
import { message } from 'antd';
import AdminAnalytics from './AdminAnalytics';
import GalleryPage from '../Gallery';
import FileRequestsPage from '../FileRequests';
import { FiImage, FiFolder } from 'react-icons/fi';
import { PanelShell } from '../../components/layout/Panel';
// ─── Types ────────────────────────────────────────────────────────────────────

interface ModalState {
  isOpen: boolean;
  userId: string | null;
  userName?: string;
}

const CLOSED_MODAL: ModalState = { isOpen: false, userId: null, userName: '' };

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);

  // Modal states — each action gets its own independent modal
  const [softDeleteModal, setSoftDeleteModal] = useState<ModalState>(CLOSED_MODAL);
  const [hardDeleteModal, setHardDeleteModal] = useState<ModalState>(CLOSED_MODAL);
  const [deletePostModal, setDeletePostModal] = useState<ModalState>(CLOSED_MODAL);

  const user = useAppSelector((state: any) => state.auth.user);
  const onlineUserIds = useAppSelector((state: any) => state.onlineUsers.onlineUserIds);

  // ── Queries ────────────────────────────────────────────────────────────────
  const {
    data: usersData = [],
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useGetUsersQuery({ showDeleted: showDeletedUsers });

  const { data: postsData, isLoading: isLoadingPosts, isError: isErrorPosts } =
    useGetAllExplorePostsQuery({ page: 1, limit: 100 });

  const { data: reportsData = [], isLoading: isLoadingReports, isError: isErrorReports } =
    useGetReportsQuery();

  // ── Mutations ──────────────────────────────────────────────────────────────
  const [updateUser] = useUpdateUserProfileMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();
  const [resolveReport] = useResolveReportMutation();
  const [softDeleteUser, { isLoading: isSoftDeleting }] = useSoftDeleteUserMutation();
  const [restoreUser, { isLoading: isRestoring }] = useRestoreUserMutation();
  const [hardDeleteUser, { isLoading: isHardDeleting }] = useHardDeleteUserMutation();

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleRoleSwitch = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'MANAGER' ? 'USER' : 'MANAGER';
    try {
      await updateUser({ id: userId, role: newRole }).unwrap();
      message.success(`Role updated to ${newRole}`);
    } catch {
      message.error('Failed to update role');
    }
  };

  const handleToggleSuspend = async (userId: string, isActive: boolean) => {
    try {
      await updateUser({ id: userId, isActive: !isActive }).unwrap();
      message.success(isActive ? 'User offline' : 'User activated');
    } catch {
      message.error('Failed to update user status');
    }
  };

  const handleSoftDeleteConfirm = async () => {
    if (!softDeleteModal.userId) return;
    try {
      await softDeleteUser(softDeleteModal.userId).unwrap();
      message.success(`User "${softDeleteModal.userName}" has been soft-deleted.`);
    } catch {
      message.error('Failed to soft-delete user. Please try again.');
    } finally {
      setSoftDeleteModal(CLOSED_MODAL);
    }
  };

  const handleRestoreUser = async (userId: string, userName: string) => {
    try {
      await restoreUser(userId).unwrap();
      message.success(`User "${userName}" has been restored.`);
    } catch {
      message.error('Failed to restore user. Please try again.');
    }
  };

  const handleHardDeleteConfirm = async () => {
    if (!hardDeleteModal.userId) return;
    try {
      await hardDeleteUser(hardDeleteModal.userId).unwrap();
      message.success(`User "${hardDeleteModal.userName}" has been permanently deleted.`);
    } catch {
      message.error('Failed to permanently delete user. Please try again.');
    } finally {
      setHardDeleteModal(CLOSED_MODAL);
    }
  };

  const handleDeletePostConfirm = async () => {
    if (!deletePostModal.userId) return;
    try {
      await deletePost(deletePostModal.userId).unwrap();
      message.success('Post has been deleted successfully.');
    } catch {
      message.error('Failed to delete post. Please try again.');
    } finally {
      setDeletePostModal(CLOSED_MODAL);
    }
  };

  // ── Column Definitions ─────────────────────────────────────────────────────

  const userColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (val: string, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${!row.isDeleted && onlineUserIds.includes(row.id) ? 'bg-green-500' : 'bg-gray-400'
                }`}
              title={!row.isDeleted && onlineUserIds.includes(row.id) ? 'Online' : 'Offline'}
            />
            <img
              src={row.avatarUrl || `https://ui-avatars.com/api/?name=${val}&background=random`}
              alt={val}
              className={`w-8 h-8 rounded-full object-cover ${row.isDeleted ? 'opacity-50 grayscale' : ''}`}
            />
          </div>
          <div className="flex flex-col">
            <span className={`font-medium ${row.isDeleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {val}
            </span>
            {row.isDeleted && row.deletedAt && (
              <span className="text-[10px] text-rose-400">
                Deleted {new Date(row.deletedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'username',
      label: 'Username',
      render: (val: string, row: any) => (
        <span className={`${row.isDeleted ? 'text-gray-400' : 'text-gray-500'}`}>@{val}</span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (val: string) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${val === 'ADMIN'
              ? 'bg-purple-100 text-purple-700 border border-purple-200'
              : val === 'MANAGER'
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
        >
          {val || 'USER'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Activity',
      render: (val: boolean, row: any) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold flex items-center w-max space-x-1 ${val !== false
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-rose-100 text-rose-700 border border-rose-200'
            } ${row.isDeleted ? 'opacity-50' : ''}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${val !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{val !== false ? 'Active' : 'Offline'}</span>
        </span>
      ),
    },
    {
      key: 'isDeleted',
      label: 'Account',
      render: (val: boolean) =>
        val ? (
          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold flex items-center w-max space-x-1 bg-gray-100 text-gray-500 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span>Deleted</span>
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold flex items-center w-max space-x-1 bg-teal-50 text-teal-700 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>Normal</span>
          </span>
        ),
    },
  ];

  const postColumns = [
    {
      key: 'author',
      label: 'Author',
      render: (val: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{val?.name}</span>
          <span className="text-xs text-gray-500">@{val?.username}</span>
        </div>
      ),
    },
    {
      key: 'content',
      label: 'Content',
      render: (val: string) => (
        <span className="truncate max-w-50 block text-gray-600" title={val}>
          {val}
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Date',
      render: (val: string) => <span className="text-gray-500 text-sm">{val}</span>,
    },
    
  ];

  const reportColumns = [
    {
      key: 'reporterName',
      label: 'Reported By',
      render: (val: string) => <span className="font-medium text-gray-800">{val}</span>,
    },
    {
      key: 'targetType',
      label: 'Target Type',
      render: (val: string) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-semibold">
          {val}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (val: string) => (
        <span className="text-gray-600 truncate max-w-37.5 block" title={val}>
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val: string) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${val === 'PENDING'
              ? 'bg-amber-100 text-amber-700 border border-amber-200'
              : val === 'RESOLVED'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val: string) => (
        <span className="text-gray-500 text-sm">{new Date(val).toLocaleDateString()}</span>
      ),
    },
  ];

  // ── User Action Buttons ────────────────────────────────────────────────────

  const renderUserActions = (row: any) => {
    const isSelf = row.id === user?.id;
    const isAdmin = row.role === 'ADMIN';
    const isDeleted = row.isDeleted;

    if (isDeleted) {
      // Soft-deleted user: show Restore + Hard Delete
      return (
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {/* Restore */}
          <button
            id={`restore-user-${row.id}`}
            onClick={() => handleRestoreUser(row.id, row.name)}
            disabled={isRestoring}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Restore user account"
          >
            {isRestoring ? (
              <div className="w-3.5 h-3.5 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiRefreshCw className="w-3.5 h-3.5" />
            )}
            Restore
          </button>

          {/* Hard Delete */}
          {!isSelf && (
            <button
              id={`hard-delete-user-${row.id}`}
              onClick={() => setHardDeleteModal({ isOpen: true, userId: row.id, userName: row.name })}
              disabled={isHardDeleting}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Permanently delete this user"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              Hard Delete
            </button>
          )}
        </div>
      );
    }

    // Active user: show Suspend/Activate, Role, Soft Delete, Hard Delete
    return (
      <div className="flex items-center justify-end gap-2 flex-wrap">
        {/* Suspend / Activate */}
        <button
          id={`toggle-suspend-${row.id}`}
          onClick={() => handleToggleSuspend(row.id, row.isActive)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${row.isActive !== false
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
        >
          {row.isActive !== false ? 'Suspend' : 'Activate'}
        </button>

        {/* Role Switch (not for Admins) */}
        {!isAdmin && (
          <button
            id={`role-switch-${row.id}`}
            onClick={() => handleRoleSwitch(row.id, row.role)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            {row.role === 'MANAGER' ? 'Demote' : 'Make Manager'}
          </button>
        )}

        {/* Soft Delete (not for self or other admins) */}
        {!isSelf && !isAdmin && (
          <button
            id={`soft-delete-user-${row.id}`}
            onClick={() => setSoftDeleteModal({ isOpen: true, userId: row.id, userName: row.name })}
            disabled={isSoftDeleting}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Soft-delete this user (reversible)"
          >
            <FiSlash className="w-3.5 h-3.5" />
            Soft Delete
          </button>
        )}

        {/* Hard Delete (not for self or other admins) */}
        {!isSelf && !isAdmin && (
          <button
            id={`hard-delete-user-${row.id}`}
            onClick={() => setHardDeleteModal({ isOpen: true, userId: row.id, userName: row.name })}
            disabled={isHardDeleting}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Permanently delete this user (irreversible)"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            Hard Delete
          </button>
        )}
      </div>
    );
  };

  // ── Tab Content ────────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <div className="animate-fade-in-up">
            <AdminAnalytics
              onNavigateToReports={() => setActiveTab('reports')}
              onNavigateToFileRequests={() => setActiveTab('file-requests')}
            />
          </div>
        );

      case 'users':
        return (
          <div className="animate-fade-in-up">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                Manage Users
              </h2>
              {/* Show Deleted toggle */}
              <button
                id="toggle-show-deleted"
                onClick={() => setShowDeletedUsers((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${showDeletedUsers
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {showDeletedUsers ? (
                  <>
                    <FiEyeOff className="w-4 h-4" />
                    Hide Deleted Users
                  </>
                ) : (
                  <>
                    <FiEye className="w-4 h-4" />
                    Show Deleted Users
                  </>
                )}
              </button>
            </div>

            {/* Deleted mode banner */}
            {showDeletedUsers && (
              <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                <FiEye className="w-4 h-4 shrink-0" />
                <span>
                  Showing <strong>all users including soft-deleted</strong>. Restore a user to re-activate their
                  account, or permanently delete to remove all data.
                </span>
              </div>
            )}

            {isLoadingUsers ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
              </div>
            ) : isErrorUsers ? (
              <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                Error loading users data. Please try again later.
              </div>
            ) : (
              <DataTable
                columns={userColumns}
                data={usersData}
                actions={renderUserActions}
              />
            )}
          </div>
        );

      case 'posts':
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-6">
              Manage Posts
            </h2>
            {isLoadingPosts ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
              </div>
            ) : isErrorPosts ? (
              <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                Error loading posts data. Please try again later.
              </div>
            ) : (
              <DataTable
                columns={postColumns}
                data={postsData?.posts || []}
                actions={(row) => (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeletePostModal({ isOpen: true, userId: row.id })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 hover:shadow-sm transition-all duration-200"
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              />
            )}
          </div>
        );

      case 'reports':
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-6">
              User Reports
            </h2>
            {isLoadingReports ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
              </div>
            ) : isErrorReports ? (
              <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                Error loading reports data. Please try again later.
              </div>
            ) : (
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
            )}
          </div>
        );

      case 'comments':
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-6">
              Manage Comments
            </h2>
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
    { id: 'analytics', label: 'Dashboard', icon: FiBarChart2 },
    { id: 'users', label: 'Manage Users', icon: FiUsers },
    { id: 'posts', label: 'Manage Posts', icon: FiFileText },
    { id: 'comments', label: 'Manage Comments', icon: FiMessageSquare },
    { id: 'reports', label: 'User Reports', icon: FiAlertOctagon },
    { id: 'gallery', label: 'Gallery', icon: FiImage },
    { id: 'file-requests', label: 'File Requests', icon: FiFolder },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <PanelShell
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        title="Admin Control"
        badge="A"
      >
        {renderContent()}
      </PanelShell>

      {/* ── Soft Delete Confirmation Modal ───────────────────────────────────── */}
      <ConfirmationModal
        isOpen={softDeleteModal.isOpen}
        onClose={() => setSoftDeleteModal(CLOSED_MODAL)}
        onConfirm={handleSoftDeleteConfirm}
        title="Soft Delete User"
        description={
          <div className="space-y-2">
            <p>
              You are about to soft-delete{' '}
              <strong className="text-gray-900">"{softDeleteModal.userName}"</strong>.
            </p>
            <ul className="text-xs text-gray-500 space-y-1 mt-2 list-disc list-inside">
              <li>The user will be blocked from logging in.</li>
              <li>They will be hidden from all public listings and searches.</li>
              <li>All data (posts, messages, follows) is preserved.</li>
              <li>This action is <strong className="text-amber-600">reversible</strong> — you can restore the account at any time.</li>
            </ul>
          </div>
        }
        confirmText="Soft Delete"
        icon="warning"
        isLoading={isSoftDeleting}
      />

      {/* ── Hard Delete Confirmation Modal ───────────────────────────────────── */}
      <ConfirmationModal
        isOpen={hardDeleteModal.isOpen}
        onClose={() => setHardDeleteModal(CLOSED_MODAL)}
        onConfirm={handleHardDeleteConfirm}
        title="Permanently Delete User"
        description={
          <div className="space-y-2">
            <p>
              This action is <strong className="text-rose-600">irreversible</strong> and will permanently
              remove <strong className="text-gray-900">"{hardDeleteModal.userName}"</strong> and{' '}
              <strong>all associated data</strong> from the database.
            </p>
            <ul className="text-xs text-gray-500 space-y-1 mt-2 list-disc list-inside">
              <li>Posts, comments, likes, follows — all deleted.</li>
              <li>Messages, conversations, notifications — all deleted.</li>
              <li>Profile, settings, auth records — all deleted.</li>
              <li className="text-rose-500 font-medium">This cannot be undone.</li>
            </ul>
          </div>
        }
        requireTextMatch="DELETE"
        confirmText="Permanently Delete"
        icon="error"
        isLoading={isHardDeleting}
      />

      {/* ── Delete Post Confirmation Modal ───────────────────────────────────── */}
      <ConfirmationModal
        isOpen={deletePostModal.isOpen}
        onClose={() => setDeletePostModal(CLOSED_MODAL)}
        onConfirm={handleDeletePostConfirm}
        title="Delete Post"
        description={
          <div className="space-y-2">
            <p>
              Are you sure you want to delete this post?
            </p>
            <ul className="text-xs text-gray-500 space-y-1 mt-2 list-disc list-inside">
              <li>The post and all its media will be permanently removed.</li>
              <li>All associated comments and likes will be deleted.</li>
              <li className="text-rose-500 font-medium">This cannot be undone.</li>
            </ul>
          </div>
        }
        confirmText="Delete Post"
        icon="warning"
        isLoading={isDeletingPost}
      />
    </>
  );
};

export default AdminDashboard;
