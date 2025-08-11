import React from 'react';
import Icon from '../../../components/AppIcon';

const NodeFleetStatus = ({ nodes }) => {
  const getStatusColor = (status) => {
    const colors = {
      online: 'text-success bg-success/10',
      offline: 'text-error bg-error/10',
      busy: 'text-warning bg-warning/10',
      maintenance: 'text-muted-foreground bg-muted'
    };
    return colors?.[status] || 'text-muted-foreground bg-muted';
  };

  const getStatusIcon = (status) => {
    const icons = {
      online: 'CheckCircle',
      offline: 'XCircle',
      busy: 'Clock',
      maintenance: 'Wrench'
    };
    return icons?.[status] || 'Circle';
  };

  const totalNodes = nodes?.length;
  const onlineNodes = nodes?.filter(node => node?.status === 'online')?.length;
  const busyNodes = nodes?.filter(node => node?.status === 'busy')?.length;

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Node Fleet Status</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">{onlineNodes}/{totalNodes} Online</span>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Fleet Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-semibold text-success">{onlineNodes}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-warning">{busyNodes}</div>
            <div className="text-xs text-muted-foreground">In Use</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-error">{totalNodes - onlineNodes - busyNodes}</div>
            <div className="text-xs text-muted-foreground">Offline</div>
          </div>
        </div>

        {/* Node List */}
        <div className="space-y-3">
          {nodes?.slice(0, 5)?.map((node) => (
            <div key={node?.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(node?.status)}`}>
                  <Icon name={getStatusIcon(node?.status)} size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{node?.name}</p>
                  <p className="text-xs text-muted-foreground">{node?.location}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-muted-foreground">
                    CPU: {node?.cpuUsage}%
                  </div>
                  <div className="w-12 bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${node?.cpuUsage}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {node?.activeAttacks} active
                </div>
              </div>
            </div>
          ))}
        </div>

        {nodes?.length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-xs text-primary hover:text-primary/80 transition-smooth">
              View All {totalNodes} Nodes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeFleetStatus;