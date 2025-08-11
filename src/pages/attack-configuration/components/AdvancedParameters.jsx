import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AdvancedParameters = ({ 
  parameters, 
  onParameterChange, 
  selectedAttackType,
  errors 
}) => {
  const handleInputChange = (field, value) => {
    onParameterChange({
      ...parameters,
      [field]: value
    });
  };

  const durationOptions = [
    { value: '30', label: '30 seconds' },
    { value: '60', label: '1 minute' },
    { value: '300', label: '5 minutes' },
    { value: '600', label: '10 minutes' },
    { value: '1800', label: '30 minutes' },
    { value: '3600', label: '1 hour' }
  ];

  const payloadSizeOptions = [
    { value: '64', label: '64 bytes' },
    { value: '128', label: '128 bytes' },
    { value: '256', label: '256 bytes' },
    { value: '512', label: '512 bytes' },
    { value: '1024', label: '1 KB' },
    { value: '2048', label: '2 KB' },
    { value: '4096', label: '4 KB' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'critical', label: 'Critical Priority' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Settings" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Advanced Parameters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Select
            label="Test Duration"
            options={durationOptions}
            value={parameters?.duration}
            onChange={(value) => handleInputChange('duration', value)}
            error={errors?.duration}
            required
            description="How long the attack simulation will run"
          />

          <Input
            label="Request Rate (req/sec)"
            type="number"
            placeholder="100"
            value={parameters?.requestRate}
            onChange={(e) => handleInputChange('requestRate', e?.target?.value)}
            error={errors?.requestRate}
            min="1"
            max="10000"
            description="Number of requests per second"
          />

          <Select
            label="Payload Size"
            options={payloadSizeOptions}
            value={parameters?.payloadSize}
            onChange={(value) => handleInputChange('payloadSize', value)}
            error={errors?.payloadSize}
            description="Size of each request payload"
          />
        </div>

        <div className="space-y-4">
          <Input
            label="Concurrent Connections"
            type="number"
            placeholder="50"
            value={parameters?.concurrentConnections}
            onChange={(e) => handleInputChange('concurrentConnections', e?.target?.value)}
            error={errors?.concurrentConnections}
            min="1"
            max="1000"
            description="Number of simultaneous connections"
          />

          <Input
            label="Timeout (seconds)"
            type="number"
            placeholder="30"
            value={parameters?.timeout}
            onChange={(e) => handleInputChange('timeout', e?.target?.value)}
            error={errors?.timeout}
            min="1"
            max="300"
            description="Connection timeout duration"
          />

          <Select
            label="Priority Level"
            options={priorityOptions}
            value={parameters?.priority}
            onChange={(value) => handleInputChange('priority', value)}
            error={errors?.priority}
            description="Attack execution priority"
          />
        </div>
      </div>
      {selectedAttackType?.id === 'slowloris' && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <h4 className="font-medium text-warning">Slowloris Configuration</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Keep-Alive Interval"
              type="number"
              placeholder="15"
              value={parameters?.keepAliveInterval}
              onChange={(e) => handleInputChange('keepAliveInterval', e?.target?.value)}
              min="1"
              max="60"
              description="Seconds between keep-alive packets"
            />
            <Input
              label="Socket Count"
              type="number"
              placeholder="200"
              value={parameters?.socketCount}
              onChange={(e) => handleInputChange('socketCount', e?.target?.value)}
              min="10"
              max="2000"
              description="Number of sockets to maintain"
            />
          </div>
        </div>
      )}
      {selectedAttackType?.id === 'icmp_flood' && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Zap" size={16} className="text-error" />
            <h4 className="font-medium text-error">ICMP Flood Configuration</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Packet Interval (ms)"
              type="number"
              placeholder="10"
              value={parameters?.packetInterval}
              onChange={(e) => handleInputChange('packetInterval', e?.target?.value)}
              min="1"
              max="1000"
              description="Milliseconds between ICMP packets"
            />
            <Input
              label="TTL Value"
              type="number"
              placeholder="64"
              value={parameters?.ttl}
              onChange={(e) => handleInputChange('ttl', e?.target?.value)}
              min="1"
              max="255"
              description="Time-to-live for ICMP packets"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedParameters;