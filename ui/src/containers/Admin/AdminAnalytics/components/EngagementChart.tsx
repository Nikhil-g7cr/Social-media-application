import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EngagementChartProps {
    totalPosts: number;
    totalComments: number;
    totalLikes: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
                <p className="font-semibold text-gray-800">{payload[0].name}</p>
                <p className="text-gray-600 text-sm">{payload[0].value.toLocaleString()} total</p>
            </div>
        );
    }
    return null;
};

const EngagementChart: React.FC<EngagementChartProps> = ({ totalPosts, totalComments, totalLikes }) => {
    const data = [
        { name: 'Posts', value: totalPosts },
        { name: 'Comments', value: totalComments },
        { name: 'Likes', value: totalLikes },
    ].filter(d => d.value > 0);

    if (data.length === 0 || (totalPosts === 0 && totalComments === 0 && totalLikes === 0)) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-400">
                No engagement data available yet.
            </div>
        );
    }

    return (
        <div className="w-full min-w-0" style={{ height: 256 }}>
            <ResponsiveContainer width="100%" height={256} minWidth={0} minHeight={256}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1200}
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        iconType="circle"
                        iconSize={10}
                        formatter={(value) => (
                            <span className="text-sm text-gray-600 font-medium">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EngagementChart;
