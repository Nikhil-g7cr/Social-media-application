import React, { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Info, Check } from 'lucide-react';
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation, useDeleteNotificationMutation, useClearAllNotificationsMutation, type Notification as ApiNotification } from '../../redux/features/notification/notificationApiSlice';
import { formatDistanceToNow } from 'date-fns';
import { initializeSocket } from '../../utils/socket';
import { useDispatch } from 'react-redux';
import { apiSlice } from '../../redux/apiSlice';
import PostImage from './PostImage';

// --- Types ---
// Using ApiNotification from notificationApiSlice

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: serverNotifications = [], refetch } = useGetNotificationsQuery();
  const [markAsReadMutation] = useMarkAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearAllNotifications] = useClearAllNotificationsMutation();
  const dispatch = useDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Socket listening is now handled entirely within notificationApiSlice

  const notifications = serverNotifications.map((n: ApiNotification) => ({
    id: n.ID,
    type: n.NotificationType,
    actorName: n.Actor?.UserName || 'Someone',
    actorAvatar: n.Actor?.ProfilePictureUrl || `https://ui-avatars.com/api/?name=${n.Actor?.UserName || 'User'}&background=random`,
    content: n.NotificationType === 'LIKE' ? 'liked your post.' : n.NotificationType === 'FOLLOW' ? 'started following you.' : n.NotificationType === 'MESSAGE' ? 'sent you a message.' : 'system notification.',
    time: formatDistanceToNow(new Date(n.CreatedAt), { addSuffix: true }),
    isRead: n.IsRead,
  }));

  // --- Click Outside to Close ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers ---
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    await markAllAsReadMutation().unwrap();
  };

  const markAsRead = async (id: string) => {
    await markAsReadMutation(id).unwrap();
  };

  const handleClearAll = async () => {
    await clearAllNotifications().unwrap();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotification(id).unwrap();
  };

  // --- Helper to get contextual icons ---
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-white"><Heart className="w-3 h-3 text-white fill-white" /></div>;
      case 'MESSAGE':
        return <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white"><MessageCircle className="w-3 h-3 text-white fill-white" /></div>;
      case 'FOLLOW':
        return <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white"><UserPlus className="w-3 h-3 text-white" /></div>;
      default:
        return <div className="absolute -bottom-1 -right-1 bg-gray-700 rounded-full p-1 border-2 border-white"><Info className="w-3 h-3 text-white" /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* --- Bell Button --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-full transition duration-200 focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-5 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
              >
                <Check className="w-3 h-3" /> Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer transition ${!notification.isRead ? 'bg-blue-50/40' : ''}`}
                  >
                    {/* Avatar & Sub-Icon */}
                    <div className="relative flex-shrink-0">
                      <PostImage
                        mediaUrl={notification.actorAvatar}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm text-gray-800 line-clamp-2 leading-tight">
                        <span className="font-semibold text-gray-900">{notification.actorName}</span>{' '}
                        {notification.content}
                      </p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {notification.time}
                      </span>
                    </div>

                    {/* Unread Indicator Dot & Delete Button */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                      {!notification.isRead && (
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-2"></div>
                      )}
                      <button 
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 mt-1"
                        title="Clear notification"
                      >
                        <span className="text-xs font-bold">X</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 flex items-center justify-between">
            <button className="flex-1 py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 transition text-center border-r border-gray-100">
              View all
            </button>
            <button 
              onClick={handleClearAll}
              className="flex-1 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition text-center"
            >
              Clear notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;