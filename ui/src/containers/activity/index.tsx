import React, { useState } from 'react';
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation, 
  useDeleteNotificationMutation, 
  useClearAllNotificationsMutation,
  type Notification as ApiNotification
} from '../../redux/features/notification/notificationApiSlice';
import { 
  useGetPendingRequestsQuery, 
  useAcceptFollowRequestMutation, 
  useRejectFollowRequestMutation 
} from '../../redux/features/user/userApiSlice';
import { Bell, Heart, MessageCircle, UserPlus, Info, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PostImage from '../../shared/shared-components/PostImage';
import Avatar from '../../shared/shared-components/Avatar';
import { useNavigate } from 'react-router-dom';

const ActivityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'notifications'>('requests');
  const navigate = useNavigate();

  // Notifications
  const { data: serverNotifications = [], isLoading: notificationsLoading } = useGetNotificationsQuery();
  const [markAsReadMutation] = useMarkAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearAllNotifications] = useClearAllNotificationsMutation();

  // Requests
  const { data: pendingRequests = [], isLoading: requestsLoading } = useGetPendingRequestsQuery();
  const [acceptRequest] = useAcceptFollowRequestMutation();
  const [rejectRequest] = useRejectFollowRequestMutation();

  const notifications = serverNotifications.map((n: ApiNotification) => ({
    id: n.ID,
    type: n.NotificationType,
    actorId: n.ActorUserID,
    actorName: n.Actor?.UserName || 'Someone',
    actorAvatar: n.Actor?.avatarUrl,
    content: n.NotificationType === 'LIKE' ? 'liked your post.' : n.NotificationType === 'FOLLOW' ? 'started following you.' : n.NotificationType === 'FOLLOW_REQUEST' ? 'sent you a follow request.' : n.NotificationType === 'FOLLOW_ACCEPTED' ? 'accepted your follow request.' : n.NotificationType === 'MESSAGE' ? 'sent you a message.' : 'system notification.',
    time: formatDistanceToNow(new Date(n.CreatedAt), { addSuffix: true }),
    isRead: n.IsRead,
  }));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-white"><Heart className="w-3 h-3 text-white fill-white" /></div>;
      case 'MESSAGE':
        return <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white"><MessageCircle className="w-3 h-3 text-white fill-white" /></div>;
      case 'FOLLOW':
      case 'FOLLOW_REQUEST':
      case 'FOLLOW_ACCEPTED':
        return <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white"><UserPlus className="w-3 h-3 text-white" /></div>;
      default:
        return <div className="absolute -bottom-1 -right-1 bg-gray-700 rounded-full p-1 border-2 border-white"><Info className="w-3 h-3 text-white" /></div>;
    }
  };

  const handleAcceptRequest = async (e: React.MouseEvent, followerId: string) => {
    e.stopPropagation();
    await acceptRequest(followerId).unwrap();
  };

  const handleRejectRequest = async (e: React.MouseEvent, followerId: string) => {
    e.stopPropagation();
    await rejectRequest(followerId).unwrap();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
            {activeTab === 'notifications' && notifications.some(n => !n.isRead) && (
              <button
                onClick={() => markAllAsReadMutation().unwrap()}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
              >
                <Check className="w-4 h-4" /> Mark all as read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 px-4">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'requests' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Requests
              {pendingRequests.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'notifications' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="divide-y divide-gray-100">
            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div className="min-h-[400px]">
                {requestsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <UserPlus className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900">No pending requests</p>
                    <p className="text-sm">When someone requests to follow you, it'll show up here.</p>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => navigate(`/profile/${request.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar
                          url={request.avatarUrl}
                          name={request.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-500">@{request.username || request.name.toLowerCase().replace(/\s+/g, '')}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Requested to follow you</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleAcceptRequest(e, request.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded-full transition shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleRejectRequest(e, request.id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1.5 px-4 rounded-full transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="min-h-[400px]">
                {notificationsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Bell className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900">No notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end p-2 bg-gray-50/50">
                      <button
                        onClick={() => clearAllNotifications().unwrap()}
                        className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1 transition px-3 py-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" /> Clear all
                      </button>
                    </div>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          if (!notification.isRead) markAsReadMutation(notification.id).unwrap();
                          // Could navigate based on type here
                        }}
                        className={`flex items-start justify-between p-4 sm:p-6 hover:bg-gray-50 transition cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="relative flex-shrink-0 mt-1">
                            <Avatar
                              url={notification.actorAvatar}
                              name={notification.actorName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-800 leading-relaxed">
                              <span className="font-bold text-gray-900">{notification.actorName}</span>{' '}
                              {notification.content}
                            </p>
                            <span className="text-xs text-gray-500 mt-1 block font-medium">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pl-4">
                          {!notification.isRead && (
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id).unwrap();
                            }}
                            className="text-gray-400 hover:text-red-500 transition p-1 rounded-full hover:bg-red-50"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
