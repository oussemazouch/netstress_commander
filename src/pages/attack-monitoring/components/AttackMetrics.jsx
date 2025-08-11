import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';

const AttackMetrics = ({ attack }) => {
  if (!attack) {
    return (
      <div className="bg-card border border-border rounded-lg h-full flex items-center justify-center">
        <div className="text-center">
          <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Select an Attack</h3>
          <p className="text-muted-foreground">Choose an active attack from the list to view detailed metrics</p>
        </div>
      </div>
    );
  }

  const requestRateData = [
    { time: '14:25', rate: 1200 },
    { time: '14:26', rate: 1350 },
    { time: '14:27', rate: 1180 },
    { time: '14:28', rate: 1420 },
    { time: '14:29', rate: 1380 },
    { time: '14:30', rate: 1500 },
    { time: '14:31', rate: 1450 },
    { time: '14:32', rate: 1600 },
    { time: '14:33', rate: 1550 }
  ];

  const responseTimeData = [
    { time: '14:25', avg: 245, p95: 380 },
    { time: '14:26', avg: 280, p95: 420 },
    { time: '14:27', avg: 220, p95: 350 },
    { time: '14:28', avg: 310, p95: 480 },
    { time: '14:29', avg: 290, p95: 450 },
    { time: '14:30', avg: 320, p95: 500 },
    { time: '14:31', avg: 275, p95: 410 },
    { time: '14:32', avg: 340, p95: 520 },
    { time: '14:33', avg: 315, p95: 485 }
  ];

  const errorRateData = [
    { time: '14:25', errors: 2.1 },
    { time: '14:26', errors: 3.2 },
    { time: '14:27', errors: 1.8 },
    { time: '14:28', errors: 4.5 },
    { time: '14:29', errors: 3.8 },
    { time: '14:30', errors: 5.2 },
    { time: '14:31', errors: 4.1 },
    { time: '14:32', errors: 6.3 },
    { time: '14:33', errors: 5.7 }
  ];

  return (
    <div className="bg-card border border-border rounded-lg h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{attack?.name}</h3>
            <p className="text-sm text-muted-foreground">Target: {attack?.target}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              attack?.status === 'running' ? 'bg-success animate-pulse' :
              attack?.status === 'paused' ? 'bg-warning' :
              attack?.status === 'failed'? 'bg-error' : 'bg-primary'
            }`} />
            <span className="text-sm font-medium text-foreground capitalize">{attack?.status}</span>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Zap" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Request Rate</span>
            </div>
            <div className="text-2xl font-bold text-foreground">1,550</div>
            <div className="text-xs text-success">+12% from avg</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Clock" size={16} className="text-warning" />
              <span className="text-sm font-medium text-foreground">Avg Response</span>
            </div>
            <div className="text-2xl font-bold text-foreground">315ms</div>
            <div className="text-xs text-warning">+8% from baseline</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="AlertTriangle" size={16} className="text-error" />
              <span className="text-sm font-medium text-foreground">Error Rate</span>
            </div>
            <div className="text-2xl font-bold text-foreground">5.7%</div>
            <div className="text-xs text-error">Above threshold</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Target" size={16} className="text-success" />
              <span className="text-sm font-medium text-foreground">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-foreground">94.3%</div>
            <div className="text-xs text-success">Within target</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Rate Chart */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-4 flex items-center space-x-2">
              <Icon name="TrendingUp" size={16} />
              <span>Request Rate (req/sec)</span>
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={requestRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Response Time Chart */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Clock" size={16} />
              <span>Response Time (ms)</span>
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avg" 
                    stroke="var(--color-warning)" 
                    strokeWidth={2}
                    name="Average"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p95" 
                    stroke="var(--color-error)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="95th Percentile"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error Rate Chart */}
          <div className="bg-muted/30 rounded-lg p-4 lg:col-span-2">
            <h4 className="text-sm font-medium text-foreground mb-4 flex items-center space-x-2">
              <Icon name="AlertTriangle" size={16} />
              <span>Error Rate (%)</span>
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)'
                    }}
                  />
                  <Bar 
                    dataKey="errors" 
                    fill="var(--color-error)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackMetrics;