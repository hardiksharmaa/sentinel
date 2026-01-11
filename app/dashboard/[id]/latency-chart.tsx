"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function LatencyChart({ checks }: { checks: any[] }) {
  // 1. Format data for the chart (Reverse so newest is on right, format time)
  const data = [...checks].reverse().map(check => ({
    time: new Date(check.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: check.latency,
    status: check.statusCode
  }));

  if (data.length < 2) {
    return <div className="h-[200px] flex items-center justify-center text-gray-400 border rounded-lg">Not enough data to show graph</div>;
  }

  return (
    <div className="h-[250px] w-full bg-white p-4 rounded-lg border shadow-sm mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Response Time (ms)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: '#6B7280' }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }} 
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="latency" 
            stroke="#2563eb" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}