import React from 'react';
import { Progress } from 'antd';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface ReportsOverviewProps {
    total: number;
    pending: number;
    resolved: number;
    onViewAllReports?: () => void;
}

const ReportsOverview: React.FC<ReportsOverviewProps> = ({ total, pending, resolved, onViewAllReports }) => {
    const resolvedPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;
    const dismissed = total - pending - resolved;
    const dismissedPercentage = total > 0 ? Math.round((dismissed / total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="text-gray-600" size={24} />
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Reports</p>
                        <p className="text-xl font-bold text-gray-800">{total}</p>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center text-yellow-600 font-medium">
                        <AlertCircle size={14} className="mr-1" /> Pending
                    </span>
                    <span className="text-gray-600">{pending} ({pendingPercentage}%)</span>
                </div>
                <Progress percent={pendingPercentage} showInfo={false} strokeColor="#eab308" trailColor="#fef08a" />
            </div>

            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center text-green-600 font-medium">
                        <CheckCircle size={14} className="mr-1" /> Resolved
                    </span>
                    <span className="text-gray-600">{resolved} ({resolvedPercentage}%)</span>
                </div>
                <Progress percent={resolvedPercentage} showInfo={false} strokeColor="#22c55e" trailColor="#bbf7d0" />
            </div>

            {dismissed > 0 && (
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center text-gray-500 font-medium">
                            Dismissed
                        </span>
                        <span className="text-gray-600">{dismissed} ({dismissedPercentage}%)</span>
                    </div>
                    <Progress percent={dismissedPercentage} showInfo={false} strokeColor="#9ca3af" trailColor="#f3f4f6" />
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                    onClick={onViewAllReports}
                    className="w-full text-center text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors py-2 hover:bg-blue-50 rounded-lg"
                >
                    View All Reports →
                </button>
            </div>
        </div>
    );
};

export default ReportsOverview;
