import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatisticsCardsProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    color?: string;
    onClick?: () => void;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ title, value, icon, trend, trendUp, color, onClick }) => {
    return (
        <div 
            className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md cursor-pointer"
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 m-0">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color || 'bg-gray-50'}`}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    {trendUp ? (
                        <TrendingUp className="text-green-500 mr-1" size={16} />
                    ) : (
                        <TrendingDown className="text-red-500 mr-1" size={16} />
                    )}
                    <span className={trendUp ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {trend}
                    </span>
                </div>
            )}
        </div>
    );
};

export default StatisticsCards;
