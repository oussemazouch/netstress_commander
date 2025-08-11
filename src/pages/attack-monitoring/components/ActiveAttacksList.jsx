import React from 'react';
import Icon from '../../../components/AppIcon';

const ActiveAttacksList = ({ attacks, selectedAttack, onSelectAttack }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-success';
      case 'paused': return 'text-warning';
      case 'failed': return 'text-error';
      case 'completed': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return 'Play';
      case 'paused': return 'Pause';
      case 'failed': return 'AlertTriangle';
      case 'completed': return 'CheckCircle';
      default: return 'Clock';
    }
  };

  const formatElapsedTime = (startTime) => {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds?.toString()?.padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Activity" size={20} />
          <span>Active Attacks</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {attacks?.filter(a => a?.status === 'running')?.length} running, {attacks?.length} total
        </p>
      </div>
      <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
        {attacks?.map((attack) => (
          <div
            key={attack?.id}
            onClick={() => onSelectAttack(attack)}
            className={`p-3 rounded-lg border cursor-pointer transition-smooth ${
              selectedAttack?.id === attack?.id
                ? 'border-primary bg-primary/10' :'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Icon 
                  name={getStatusIcon(attack?.status)} 
                  size={16} 
                  className={getStatusColor(attack?.status)}
                />
                <span className="font-medium text-foreground text-sm">{attack?.name}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                attack?.status === 'running' ? 'bg-success/20 text-success' :
                attack?.status === 'paused' ? 'bg-warning/20 text-warning' :
                attack?.status === 'failed'? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'
              }`}>
                {attack?.status}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Target: {attack?.target}</span>
                <span>{formatElapsedTime(attack?.startTime)}</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    attack?.status === 'running' ? 'bg-success' :
                    attack?.status === 'paused' ? 'bg-warning' :
                    attack?.status === 'failed'? 'bg-error' : 'bg-primary'
                  }`}
                  style={{ width: `${attack?.progress}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{attack?.progress}% complete</span>
                <span>{attack?.requestsSent?.toLocaleString()} requests</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveAttacksList;