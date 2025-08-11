import React from 'react';
import Icon from '../../../components/AppIcon';

const ConfigurationPreview = ({ 
  selectedType, 
  targetConfig, 
  parameters, 
  resourceEstimate 
}) => {
  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024)?.toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024))?.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Eye" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Configuration Preview</h3>
      </div>
      {/* Attack Summary */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-3">Attack Summary</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Attack Type:</span>
            <span className="text-sm font-medium text-foreground">
              {selectedType?.name || 'Not selected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Target:</span>
            <span className="text-sm font-medium text-foreground">
              {targetConfig?.ipAddress ? `${targetConfig?.ipAddress}:${targetConfig?.port || '80'}` : 'Not configured'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Duration:</span>
            <span className="text-sm font-medium text-foreground">
              {parameters?.duration ? formatDuration(parseInt(parameters?.duration)) : 'Not set'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Request Rate:</span>
            <span className="text-sm font-medium text-foreground">
              {parameters?.requestRate ? `${parameters?.requestRate} req/s` : 'Not set'}
            </span>
          </div>
        </div>
      </div>
      {/* Resource Requirements */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-3">Resource Requirements</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">CPU Usage:</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    resourceEstimate?.cpu > 80 ? 'bg-error' :
                    resourceEstimate?.cpu > 60 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(resourceEstimate?.cpu, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">{resourceEstimate?.cpu}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Memory:</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    resourceEstimate?.memory > 80 ? 'bg-error' :
                    resourceEstimate?.memory > 60 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(resourceEstimate?.memory, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">{resourceEstimate?.memory}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network:</span>
            <span className="text-sm font-medium text-foreground">
              {formatBytes(resourceEstimate?.networkUsage)}/s
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Est. Duration:</span>
            <span className="text-sm font-medium text-foreground">
              {parameters?.duration ? formatDuration(parseInt(parameters?.duration)) : 'Unknown'}
            </span>
          </div>
        </div>
      </div>
      {/* Compatibility Check */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-3">Target Compatibility</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Icon 
              name={targetConfig?.ipAddress ? "CheckCircle" : "AlertCircle"} 
              size={16} 
              className={targetConfig?.ipAddress ? "text-success" : "text-warning"} 
            />
            <span className="text-sm text-muted-foreground">IP Address Validation</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon 
              name={targetConfig?.port ? "CheckCircle" : "AlertCircle"} 
              size={16} 
              className={targetConfig?.port ? "text-success" : "text-warning"} 
            />
            <span className="text-sm text-muted-foreground">Port Configuration</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon 
              name={selectedType ? "CheckCircle" : "AlertCircle"} 
              size={16} 
              className={selectedType ? "text-success" : "text-warning"} 
            />
            <span className="text-sm text-muted-foreground">Attack Type Selected</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Icon 
              name={parameters?.duration && parameters?.requestRate ? "CheckCircle" : "AlertCircle"} 
              size={16} 
              className={parameters?.duration && parameters?.requestRate ? "text-success" : "text-warning"} 
            />
            <span className="text-sm text-muted-foreground">Parameters Configured</span>
          </div>
        </div>
      </div>
      {/* Risk Assessment */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="AlertTriangle" size={16} className="text-warning" />
          <h4 className="font-medium text-warning">Risk Assessment</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          {resourceEstimate?.riskLevel === 'high' ?'High-intensity configuration may impact target system performance significantly.'
            : resourceEstimate?.riskLevel === 'medium' ?'Moderate configuration with manageable system impact expected.' :'Low-impact configuration suitable for initial testing phases.'
          }
        </p>
      </div>
    </div>
  );
};

export default ConfigurationPreview;