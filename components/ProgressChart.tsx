
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SessionData } from '../types';

interface ProgressChartProps {
    data: SessionData[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
    const chartData = data.map(session => ({
        ...session,
        date: new Date(session.date).toLocaleDateString(),
    }));

    if (data.length === 0) {
        return (
            <div className="flex-grow flex items-center justify-center text-center text-brand-gray-400">
                <div>
                    <h3 className="text-lg font-semibold">No Sessions Yet</h3>
                    <p>Complete a workout session to see your progress here!</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-grow w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" orientation="left" stroke="#14F195" />
                    <YAxis yAxisId="right" orientation="right" stroke="#00C2FF" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #4B5563',
                            borderRadius: '0.5rem'
                        }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="reps" fill="#14F195" name="Reps" />
                    <Bar yAxisId="right" dataKey="duration" fill="#00C2FF" name="Duration (s)" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
