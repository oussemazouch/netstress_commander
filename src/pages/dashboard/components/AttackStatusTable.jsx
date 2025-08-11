import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AttackStatusTable = ({ attacks, onViewDetails, onStopAttack }) => {
  const [sortField, setSortField] = useState('startTime');
  const [sortDirection, setSortDirection] = useState('desc');

  const statusColors = {
    running: 'bg-success text-success-foreground',
    paused: 'bg-warning text-warning-foreground',
    completed: 'bg-muted text-muted-foreground',
    failed: 'bg-error text-error-foreground',
    queued: 'bg-primary text-primary-foreground'
  };

  const statusIcons = {
    running: 'Play',
    paused: 'Pause',
    completed: 'CheckCircle',
    failed: 'XCircle',
    queued: 'Clock'
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAttacks = useMemo(() => {
    return [...attacks]?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      if (sortField === 'startTime') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [attacks, sortField, sortDirection]);

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

  const SortableHeader = ({ field, children }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-smooth"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <Icon 
            name="ChevronUp" 
            size={12} 
            className={`${sortField === field && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground/50'}`}
          />
          <Icon 
            name="ChevronDown" 
            size={12} 
            className={`-mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground/50'}`}
          />
        </div>
      </div>
    </th>
  );

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Active Attack Simulations</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left">
              Refresh
            </Button>
            <Button variant="outline" size="sm" iconName="Filter" iconPosition="left">
              Filter
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <SortableHeader field="name">Attack Name</SortableHeader>
              <SortableHeader field="target">Target</SortableHeader>
              <SortableHeader field="type">Type</SortableHeader>
              <SortableHeader field="progress">Progress</SortableHeader>
              <SortableHeader field="duration">Duration</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedAttacks?.map((attack) => (
              <tr key={attack?.id} className="hover:bg-muted/30 transition-smooth">
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Zap" size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{attack?.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {attack?.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm text-foreground">{attack?.target}</p>
                    <p className="text-xs text-muted-foreground">{attack?.targetType}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                    {attack?.type}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{attack?.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${attack?.progress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-foreground">{formatDuration(attack?.duration)}</p>
                  <p className="text-xs text-muted-foreground">
                    Started {new Date(attack.startTime)?.toLocaleTimeString()}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors?.[attack?.status]}`}>
                    <Icon name={statusIcons?.[attack?.status]} size={12} className="mr-1" />
                    {attack?.status?.charAt(0)?.toUpperCase() + attack?.status?.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      iconName="Eye" 
                      onClick={() => onViewDetails(attack?.id)}
                    />
                    {attack?.status === 'running' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        iconName="Square" 
                        onClick={() => onStopAttack(attack?.id)}
                      />
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      iconName="MoreHorizontal"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedAttacks?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Zap" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Active Attacks</h3>
          <p className="text-muted-foreground mb-4">Start your first attack simulation to see real-time monitoring data here.</p>
          <Button variant="primary" iconName="Plus" iconPosition="left">
            Launch New Attack
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttackStatusTable;