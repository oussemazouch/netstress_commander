import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResultDetailModal = ({ result, isOpen, onClose, onExport, onCompare }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !result) return null;

  const performanceData = [
    { time: '00:00', requests: 1200, responses: 1180, errors: 20 },
    { time: '00:30', requests: 1350, responses: 1320, errors: 30 },
    { time: '01:00', requests: 1500, responses: 1450, errors: 50 },
    { time: '01:30', requests: 1400, responses: 1350, errors: 50 },
    { time: '02:00', requests: 1300, responses: 1250, errors: 50 },
    { time: '02:30', requests: 1100, responses: 1050, errors: 50 },
    { time: '03:00', requests: 950, responses: 900, errors: 50 }
  ];

  const responseTimeData = [
    { time: '00:00', avg: 120, p95: 180, p99: 250 },
    { time: '00:30', avg: 135, p95: 200, p99: 280 },
    { time: '01:00', avg: 180, p95: 250, p99: 350 },
    { time: '01:30', avg: 220, p95: 300, p99: 420 },
    { time: '02:00', avg: 280, p95: 380, p99: 500 },
    { time: '02:30', avg: 350, p95: 450, p99: 600 },
    { time: '03:00', avg: 420, p95: 520, p99: 700 }
  ];

  const errorDistribution = [
    { name: 'Timeout', value: 45, color: '#EF4444' },
    { name: 'Connection Refused', value: 25, color: '#F59E0B' },
    { name: 'Server Error', value: 20, color: '#8B5CF6' },
    { name: 'Rate Limited', value: 10, color: '#06B6D4' }
  ];

  const resourceUtilization = [
    { metric: 'CPU Usage', value: 78, max: 100, unit: '%' },
    { metric: 'Memory Usage', value: 6.2, max: 8, unit: 'GB' },
    { metric: 'Network I/O', value: 450, max: 1000, unit: 'Mbps' },
    { metric: 'Disk I/O', value: 120, max: 500, unit: 'MB/s' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'performance', label: 'Performance', icon: 'Activity' },
    { id: 'errors', label: 'Error Analysis', icon: 'AlertTriangle' },
    { id: 'logs', label: 'Execution Logs', icon: 'FileText' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'failed': return 'text-error';
      case 'partial': return 'text-warning';
      case 'aborted': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'failed': return 'XCircle';
      case 'partial': return 'AlertTriangle';
      case 'aborted': return 'StopCircle';
      default: return 'Circle';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 ${getStatusColor(result?.status)}`}>
              <Icon name={getStatusIcon(result?.status)} size={20} />
              <h2 className="text-xl font-semibold text-foreground">{result?.name}</h2>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {result?.type}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCompare(result)}
              iconName="GitCompare"
              iconPosition="left"
            >
              Compare
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(result)}
              iconName="Download"
              iconPosition="left"
            >
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth
                  ${activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }
                `}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold text-foreground">8,750</p>
                    </div>
                    <Icon name="Send" size={24} className="text-primary" />
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold text-success">{result?.successRate}%</p>
                    </div>
                    <Icon name="CheckCircle" size={24} className="text-success" />
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Response</p>
                      <p className="text-2xl font-bold text-foreground">245ms</p>
                    </div>
                    <Icon name="Clock" size={24} className="text-warning" />
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Peak RPS</p>
                      <p className="text-2xl font-bold text-foreground">1,500</p>
                    </div>
                    <Icon name="Zap" size={24} className="text-accent" />
                  </div>
                </div>
              </div>

              {/* Attack Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Attack Configuration</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target System:</span>
                      <span className="text-foreground font-medium">{result?.target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Port:</span>
                      <span className="text-foreground font-medium">{result?.targetPort}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Attack Type:</span>
                      <span className="text-foreground font-medium">{result?.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="text-foreground font-medium">{formatDuration(result?.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Concurrent Connections:</span>
                      <span className="text-foreground font-medium">100</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Execution Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Started:</span>
                      <span className="text-foreground font-medium">{formatDate(result?.executedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="text-foreground font-medium">
                        {formatDate(new Date(new Date(result.executedAt).getTime() + result.duration * 1000))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <div className={`flex items-center space-x-1 ${getStatusColor(result?.status)}`}>
                        <Icon name={getStatusIcon(result?.status)} size={16} />
                        <span className="font-medium capitalize">{result?.status}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nodes Used:</span>
                      <span className="text-foreground font-medium">3 nodes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Utilization */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Resource Utilization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {resourceUtilization?.map((resource) => (
                    <div key={resource?.metric} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{resource?.metric}</span>
                        <span className="text-foreground font-medium">
                          {resource?.value}{resource?.unit}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-smooth"
                          style={{ width: `${(resource?.value / resource?.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Request/Response Rate</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="time" stroke="var(--color-muted-foreground)" />
                      <YAxis stroke="var(--color-muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-popover)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="requests" fill="var(--color-primary)" name="Requests" />
                      <Bar dataKey="responses" fill="var(--color-success)" name="Responses" />
                      <Bar dataKey="errors" fill="var(--color-error)" name="Errors" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Response Time Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="time" stroke="var(--color-muted-foreground)" />
                      <YAxis stroke="var(--color-muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-popover)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="avg" stroke="var(--color-primary)" name="Average" strokeWidth={2} />
                      <Line type="monotone" dataKey="p95" stroke="var(--color-warning)" name="95th Percentile" strokeWidth={2} />
                      <Line type="monotone" dataKey="p99" stroke="var(--color-error)" name="99th Percentile" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Error Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={errorDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {errorDistribution?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry?.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-popover)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Error Summary</h3>
                  <div className="space-y-3">
                    {errorDistribution?.map((error) => (
                      <div key={error?.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: error?.color }}
                          />
                          <span className="text-foreground">{error?.name}</span>
                        </div>
                        <span className="text-muted-foreground">{error?.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Errors</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[
                    { time: '14:32:15', type: 'Timeout', message: 'Connection timeout after 30 seconds', count: 12 },
                    { time: '14:31:45', type: 'Connection Refused', message: 'Target server refused connection', count: 8 },
                    { time: '14:31:20', type: 'Server Error', message: 'HTTP 500 Internal Server Error', count: 5 },
                    { time: '14:30:55', type: 'Rate Limited', message: 'HTTP 429 Too Many Requests', count: 3 }
                  ]?.map((error, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-error/5 border border-error/20 rounded-lg">
                      <Icon name="AlertTriangle" size={16} className="text-error mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{error?.type}</span>
                          <span className="text-xs text-muted-foreground">{error?.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{error?.message}</p>
                        <p className="text-xs text-error">Occurred {error?.count} times</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Execution Logs</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Download"
                    iconPosition="left"
                  >
                    Download Logs
                  </Button>
                </div>
                <div className="bg-background border border-border rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">[2025-08-11 14:28:30] INFO: Attack configuration loaded successfully</div>
                    <div className="text-muted-foreground">[2025-08-11 14:28:31] INFO: Connecting to target 192.168.1.100:80</div>
                    <div className="text-success">[2025-08-11 14:28:32] SUCCESS: Connection established</div>
                    <div className="text-muted-foreground">[2025-08-11 14:28:33] INFO: Starting GET flooding attack</div>
                    <div className="text-muted-foreground">[2025-08-11 14:28:34] INFO: Spawning 100 concurrent connections</div>
                    <div className="text-success">[2025-08-11 14:28:35] SUCCESS: All connections established</div>
                    <div className="text-muted-foreground">[2025-08-11 14:28:36] INFO: Request rate: 1200 RPS</div>
                    <div className="text-muted-foreground">[2025-08-11 14:29:00] INFO: Request rate: 1350 RPS</div>
                    <div className="text-warning">[2025-08-11 14:29:15] WARN: Response time increasing (avg: 180ms)</div>
                    <div className="text-muted-foreground">[2025-08-11 14:29:30] INFO: Request rate: 1500 RPS</div>
                    <div className="text-error">[2025-08-11 14:30:00] ERROR: Connection timeout (30s)</div>
                    <div className="text-warning">[2025-08-11 14:30:15] WARN: Error rate increasing (5%)</div>
                    <div className="text-muted-foreground">[2025-08-11 14:30:30] INFO: Request rate: 1400 RPS</div>
                    <div className="text-error">[2025-08-11 14:31:00] ERROR: Server returned HTTP 500</div>
                    <div className="text-muted-foreground">[2025-08-11 14:31:30] INFO: Request rate: 1300 RPS</div>
                    <div className="text-warning">[2025-08-11 14:32:00] WARN: Target showing signs of stress</div>
                    <div className="text-muted-foreground">[2025-08-11 14:32:30] INFO: Attack duration completed</div>
                    <div className="text-success">[2025-08-11 14:32:31] SUCCESS: Attack completed successfully</div>
                    <div className="text-muted-foreground">[2025-08-11 14:32:32] INFO: Generating final report</div>
                    <div className="text-success">[2025-08-11 14:32:33] SUCCESS: Report generated and saved</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDetailModal;