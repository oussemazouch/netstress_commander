import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResultsSidebar = ({ 
  summaryStats, 
  trendingData, 
  savedFilters, 
  onQuickFilter, 
  onExportSelected, 
  selectedCount,
  onCompareSelected 
}) => {
  const quickFilters = [
    { label: 'Today', value: 'today', icon: 'Calendar' },
    { label: 'This Week', value: 'week', icon: 'CalendarDays' },
    { label: 'This Month', value: 'month', icon: 'CalendarRange' },
    { label: 'Failed Only', value: 'failed', icon: 'XCircle' },
    { label: 'High Success Rate', value: 'high_success', icon: 'CheckCircle' }
  ];

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000)?.toFixed(1) + 'k';
    }
    return num?.toString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'failed': return 'text-error';
      case 'partial': return 'text-warning';
      default: return 'text-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'failed': return 'XCircle';
      case 'partial': return 'AlertTriangle';
      default: return 'Circle';
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border p-6 space-y-6 overflow-y-auto">
      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {selectedCount} Result{selectedCount > 1 ? 's' : ''} Selected
          </h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={onExportSelected}
              iconName="Download"
              iconPosition="left"
            >
              Export Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={onCompareSelected}
              iconName="GitCompare"
              iconPosition="left"
              disabled={selectedCount < 2}
            >
              Compare Results
            </Button>
          </div>
        </div>
      )}
      {/* Summary Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="BarChart3" size={20} />
          <span>Summary Statistics</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Attacks</p>
                <p className="text-lg font-bold text-foreground">{formatNumber(summaryStats?.totalAttacks)}</p>
              </div>
              <Icon name="Zap" size={20} className="text-primary" />
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-lg font-bold text-success">{summaryStats?.avgSuccessRate}%</p>
              </div>
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
                <p className="text-lg font-bold text-foreground">{summaryStats?.avgDuration}m</p>
              </div>
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-lg font-bold text-foreground">{summaryStats?.thisWeek}</p>
              </div>
              <Icon name="TrendingUp" size={20} className="text-accent" />
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Status Breakdown</h4>
          {summaryStats?.statusBreakdown?.map((status) => (
            <div key={status?.status} className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 ${getStatusColor(status?.status)}`}>
                <Icon name={getStatusIcon(status?.status)} size={16} />
                <span className="text-sm capitalize">{status?.status}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      status?.status === 'completed' ? 'bg-success' :
                      status?.status === 'failed' ? 'bg-error' :
                      status?.status === 'partial' ? 'bg-warning' : 'bg-muted-foreground'
                    }`}
                    style={{ width: `${status?.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{status?.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Filters */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Filter" size={20} />
          <span>Quick Filters</span>
        </h3>
        
        <div className="space-y-2">
          {quickFilters?.map((filter) => (
            <button
              key={filter?.value}
              onClick={() => onQuickFilter(filter?.value)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-smooth"
            >
              <Icon name={filter?.icon} size={16} />
              <span>{filter?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Trending Analysis */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="TrendingUp" size={20} />
          <span>Trending Analysis</span>
        </h3>
        
        <div className="space-y-3">
          {trendingData?.map((trend, index) => (
            <div key={index} className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{trend?.metric}</span>
                <div className={`flex items-center space-x-1 ${
                  trend?.change > 0 ? 'text-success' : trend?.change < 0 ? 'text-error' : 'text-muted-foreground'
                }`}>
                  <Icon 
                    name={trend?.change > 0 ? 'TrendingUp' : trend?.change < 0 ? 'TrendingDown' : 'Minus'} 
                    size={14} 
                  />
                  <span className="text-xs font-medium">
                    {trend?.change > 0 ? '+' : ''}{trend?.change}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{trend?.description}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Saved Filters */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Bookmark" size={20} />
          <span>Saved Filters</span>
        </h3>
        
        {savedFilters?.length > 0 ? (
          <div className="space-y-2">
            {savedFilters?.map((filter) => (
              <div key={filter?.name} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">{filter?.name}</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onQuickFilter(filter?.name)}
                    iconName="Play"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Trash2"
                    className="text-error hover:text-error"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Icon name="Bookmark" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No saved filters yet</p>
          </div>
        )}
      </div>
      {/* Export Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Download" size={20} />
          <span>Export Options</span>
        </h3>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="FileText"
            iconPosition="left"
          >
            Export as CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="Code"
            iconPosition="left"
          >
            Export as JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="FileImage"
            iconPosition="left"
          >
            Export Report (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsSidebar;