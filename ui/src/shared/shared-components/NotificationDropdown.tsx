import React, { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Info, Check } from 'lucide-react';

// --- Types ---
type NotificationType = 'like' | 'comment' | 'follow' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  actorName: string;
  actorAvatar: string;
  content: string;
  time: string;
  isRead: boolean;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Fetch Mock Data ---
  useEffect(() => {
    // In a real app, you would fetch this from your NestJS backend:
    // API.get('/notifications').then(res => setNotifications(res.data));
    
    setNotifications([
      {
        id: '1',
        type: 'like',
        actorName: 'Sarah Smith',
        actorAvatar: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=FCE7F3&color=9D174D',
        content: 'liked your photo.',
        time: '5m ago',
        isRead: false,
      },
      {
        id: '2',
        type: 'comment',
        actorName: 'Alex Johnson',
        actorAvatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=EBF4FF&color=1E3A8A',
        content: 'commented: "This looks amazing! 🔥"',
        time: '1h ago',
        isRead: false,
      },
      {
        id: '3',
        type: 'follow',
        actorName: 'Tech Group',
        actorAvatar: 'https://ui-avatars.com/api/?name=Tech+Group&background=DEF7EC&color=03543F',
        content: 'started following you.',
        time: '2h ago',
        isRead: true,
      },
      {
        id: '4',
        type: 'system',
        actorName: 'System',
        actorAvatar: 'https://ui-avatars.com/api/?name=System&background=111827&color=ffffff',
        content: 'Your password was successfully updated.',
        time: '1d ago',
        isRead: true,
      }
    ]);
  }, []);

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

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    // TODO: API.patch('/notifications/mark-all-read');
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    // TODO: API.patch(`/notifications/${id}/read`);
  };

  // --- Helper to get contextual icons ---
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-white"><Heart className="w-3 h-3 text-white fill-white" /></div>;
      case 'comment':
        return <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white"><MessageCircle className="w-3 h-3 text-white fill-white" /></div>;
      case 'follow':
        return <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white"><UserPlus className="w-3 h-3 text-white" /></div>;
      case 'system':
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
                      <img 
                        src={notification.actorAvatar} 
                        alt={notification.actorName} 
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

                    {/* Unread Indicator Dot */}
                    {!notification.isRead && (
                      <div className="flex-shrink-0 w-2.5 h-2.5 bg-blue-600 rounded-full mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100">
            <button className="w-full py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 transition text-center">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;