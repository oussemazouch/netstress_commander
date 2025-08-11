import React from 'react';
import Icon from '../../../components/AppIcon';

const AttackTypeSelector = ({ selectedType, onTypeChange, attackTypes }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Target" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Attack Type Selection</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attackTypes?.map((type) => (
          <div
            key={type?.id}
            onClick={() => onTypeChange(type)}
            className={`
              relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${selectedType?.id === type?.id
                ? 'border-primary bg-primary/10 shadow-elevation-1'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${selectedType?.id === type?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                <Icon name={type?.icon} size={20} />
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">{type?.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{type?.description}</p>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>{type?.duration}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Icon name="Zap" size={12} />
                    <span>{type?.intensity}</span>
                  </span>
                </div>
              </div>
              
              {selectedType?.id === type?.id && (
                <div className="absolute top-2 right-2">
                  <Icon name="CheckCircle" size={16} className="text-primary" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttackTypeSelector;