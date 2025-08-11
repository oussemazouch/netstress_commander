import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickLaunchPanel = ({ templates, onLaunchTemplate }) => {
  const templateIcons = {
    'GET Flooding': 'Globe',
    'POST Flooding': 'Send',
    'ICMP Flooding': 'Wifi',
    'Slowloris': 'Clock',
    'SYN Flood': 'Network',
    'UDP Flood': 'Radio'
  };

  const difficultyColors = {
    low: 'text-success bg-success/10',
    medium: 'text-warning bg-warning/10',
    high: 'text-error bg-error/10'
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Quick Launch Templates</h3>
        <p className="text-sm text-muted-foreground mt-1">Pre-configured attack scenarios</p>
      </div>
      <div className="p-6 space-y-4">
        {templates?.map((template) => (
          <div key={template?.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-smooth">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={templateIcons?.[template?.name] || 'Zap'} size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{template?.name}</h4>
                  <p className="text-xs text-muted-foreground">{template?.category}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficultyColors?.[template?.difficulty]}`}>
                {template?.difficulty}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {template?.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={12} />
                  <span>{template?.estimatedDuration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Target" size={12} />
                  <span>{template?.targetType}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                iconName="Play" 
                iconPosition="left"
                onClick={() => onLaunchTemplate(template?.id)}
              >
                Launch
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-border">
          <Button variant="ghost" fullWidth iconName="Plus" iconPosition="left">
            Create Custom Template
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickLaunchPanel;