import React from 'react';
import { UserPlus, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
    activity: any;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activity }) => {
    // Combine recent users and recent posts into a single feed and sort by date
    const feed = React.useMemo(() => {
        if (!activity) return [];
        
        const items: any[] = [];
        
        if (activity.recentUsers) {
            activity.recentUsers.forEach((user: any) => {
                items.push({
                    id: `user-${user.ID}`,
                    type: 'USER_REGISTERED',
                    title: 'New User Registered',
                    description: `@${user.UserName} joined the platform.`,
                    date: new Date(user.CreatedAt),
                    icon: <UserPlus size={18} className="text-blue-500" />,
                    bgColor: 'bg-blue-50'
                });
            });
        }
        
        if (activity.recentPosts) {
            activity.recentPosts.forEach((post: any) => {
                const authorName = post.AuthorFullName || post.AuthorUserName;
                const authorHandle = post.AuthorUserName ? `@${post.AuthorUserName}` : 'Unknown user';
                items.push({
                    id: `post-${post.ID}`,
                    type: 'POST_CREATED',
                    title: 'New Post Created',
                    description: authorName
                        ? `${authorName} (${authorHandle}) created a ${(post.Type || 'new').toLowerCase()} post.`
                        : `${authorHandle} created a new post.`,
                    date: new Date(post.CreatedAt),
                    icon: <FileText size={18} className="text-indigo-500" />,
                    bgColor: 'bg-indigo-50'
                });
            });
        }
        
        return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
    }, [activity]);

    if (!feed || feed.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg text-gray-400">
                No recent activity.
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {feed.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                        {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                            {item.description}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                            <Clock size={12} className="mr-1" />
                            {formatDistanceToNow(item.date, { addSuffix: true })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;
