import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const TargetConfiguration = ({ 
  targetConfig, 
  onTargetChange, 
  onValidateTarget, 
  validationStatus,
  errors 
}) => {
  const handleInputChange = (field, value) => {
    onTargetChange({
      ...targetConfig,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Globe" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Target Configuration</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Target IP Address"
          type="text"
          placeholder="192.168.1.100"
          value={targetConfig?.ipAddress}
          onChange={(e) => handleInputChange('ipAddress', e?.target?.value)}
          error={errors?.ipAddress}
          required
          description="Primary target IP address"
        />

        <Input
          label="Target Port"
          type="number"
          placeholder="80"
          value={targetConfig?.port}
          onChange={(e) => handleInputChange('port', e?.target?.value)}
          error={errors?.port}
          min="1"
          max="65535"
          description="Target service port"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Network Range (CIDR)"
          type="text"
          placeholder="192.168.1.0/24"
          value={targetConfig?.networkRange}
          onChange={(e) => handleInputChange('networkRange', e?.target?.value)}
          error={errors?.networkRange}
          description="Optional network range for distributed testing"
        />

        <Input
          label="Protocol"
          type="text"
          placeholder="HTTP/HTTPS"
          value={targetConfig?.protocol}
          onChange={(e) => handleInputChange('protocol', e?.target?.value)}
          error={errors?.protocol}
          description="Target protocol type"
        />
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          iconName="Search"
          iconPosition="left"
          onClick={onValidateTarget}
          disabled={!targetConfig?.ipAddress}
        >
          Validate Target
        </Button>

        {validationStatus && (
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            validationStatus?.type === 'success' ?'bg-success/10 text-success' 
              : validationStatus?.type === 'error' ?'bg-error/10 text-error' :'bg-warning/10 text-warning'
          }`}>
            <Icon 
              name={
                validationStatus?.type === 'success' ? 'CheckCircle' :
                validationStatus?.type === 'error' ? 'XCircle' : 'AlertTriangle'
              } 
              size={16} 
            />
            <span className="text-sm font-medium">{validationStatus?.message}</span>
          </div>
        )}
      </div>
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Shield" size={16} className="text-warning" />
          <h4 className="font-medium text-foreground">Security Notice</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Ensure you have explicit authorization to test the specified targets. 
          Unauthorized network testing may violate security policies and legal regulations.
        </p>
      </div>
    </div>
  );
};

export default TargetConfiguration;