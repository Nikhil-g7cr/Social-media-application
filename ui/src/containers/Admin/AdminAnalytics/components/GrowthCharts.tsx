import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GrowthChartsProps {
    growthData: any;
}

const GrowthCharts: React.FC<GrowthChartsProps> = ({ growthData }) => {
    // If we have separate arrays for userGrowth and postGrowth, we should merge them by Date for a single chart
    // or just display two lines if dates match, or separate charts.
    // Assuming backend returns { userGrowth: [{ Date, count }], postGrowth: [{ Date, count }] }
    
    // Merge data by Date for the chart
    const mergedData = React.useMemo(() => {
        if (!growthData?.userGrowth && !growthData?.postGrowth) return [];
        
        const map = new Map<string, any>();
        
        if (growthData.userGrowth) {
            growthData.userGrowth.forEach((item: any) => {
                const date = new Date(item.Date).toLocaleDateString();
                map.set(date, { date, Users: item.count });
            });
        }
        
        if (growthData.postGrowth) {
            growthData.postGrowth.forEach((item: any) => {
                const date = new Date(item.Date).toLocaleDateString();
                const existing = map.get(date) || { date };
                map.set(date, { ...existing, Posts: item.count });
            });
        }
        
        return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [growthData]);

    if (!mergedData || mergedData.length === 0) {
        return (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg text-gray-400">
                No growth data available yet.
            </div>
        );
    }

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={mergedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#888', fontSize: 12 }} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#888', fontSize: 12 }} 
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line 
                        type="monotone" 
                        dataKey="Users" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="Posts" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GrowthCharts;
