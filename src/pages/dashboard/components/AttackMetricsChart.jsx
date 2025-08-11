import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AttackMetricsChart = ({ data, type = 'line' }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-2">
          <p className="text-sm font-medium text-foreground mb-2">{`Time: ${label}`}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {`${entry?.dataKey}: ${entry?.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatXAxisLabel = (tickItem) => {
    const date = new Date(tickItem);
    return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (type === 'area') {
    return (
      <div className="bg-card border border-border rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Attack Metrics Overview</h3>
          <p className="text-sm text-muted-foreground mt-1">Real-time performance data</p>
        </div>
        <div className="p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(14, 165, 233)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgb(14, 165, 233)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxisLabel}
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                />
                <YAxis stroke="rgb(148, 163, 184)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="rgb(14, 165, 233)"
                  fillOpacity={1}
                  fill="url(#requestsGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="responses"
                  stroke="rgb(16, 185, 129)"
                  fillOpacity={1}
                  fill="url(#responseGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Real-time Attack Metrics</h3>
        <p className="text-sm text-muted-foreground mt-1">Live performance monitoring</p>
      </div>
      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxisLabel}
                stroke="rgb(148, 163, 184)"
                fontSize={12}
              />
              <YAxis stroke="rgb(148, 163, 184)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="rgb(14, 165, 233)"
                strokeWidth={2}
                dot={{ fill: 'rgb(14, 165, 233)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'rgb(14, 165, 233)', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="responses"
                stroke="rgb(16, 185, 129)"
                strokeWidth={2}
                dot={{ fill: 'rgb(16, 185, 129)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'rgb(16, 185, 129)', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="rgb(239, 68, 68)"
                strokeWidth={2}
                dot={{ fill: 'rgb(239, 68, 68)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'rgb(239, 68, 68)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AttackMetricsChart;