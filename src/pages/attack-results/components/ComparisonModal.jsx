import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ComparisonModal = ({ isOpen, onClose, selectedResults, allResults }) => {
  const [comparisonResults, setComparisonResults] = useState(selectedResults || []);
  const [comparisonMetric, setComparisonMetric] = useState('successRate');

  if (!isOpen) return null;

  const availableResults = allResults?.filter(result => 
    !comparisonResults?.some(selected => selected?.id === result?.id)
  );

  const comparisonOptions = [
    { value: 'successRate', label: 'Success Rate' },
    { value: 'duration', label: 'Duration' },
    { value: 'avgResponseTime', label: 'Average Response Time' },
    { value: 'requestsPerSecond', label: 'Requests Per Second' },
    { value: 'errorRate', label: 'Error Rate' }
  ];

  const addResultToComparison = (resultId) => {
    const result = allResults?.find(r => r?.id === resultId);
    if (result && comparisonResults?.length < 4) {
      setComparisonResults([...comparisonResults, result]);
    }
  };

  const removeResultFromComparison = (resultId) => {
    setComparisonResults(comparisonResults?.filter(r => r?.id !== resultId));
  };

  const getComparisonData = () => {
    return comparisonResults?.map(result => ({
      name: result?.name?.substring(0, 15) + '...',
      fullName: result?.name,
      successRate: result?.successRate,
      duration: result?.duration / 60, // Convert to minutes
      avgResponseTime: Math.floor(Math.random() * 300) + 100, // Mock data
      requestsPerSecond: Math.floor(Math.random() * 1000) + 500, // Mock data
      errorRate: 100 - result?.successRate,
      type: result?.type,
      target: result?.target,
      executedAt: result?.executedAt
    }));
  };

  const getMetricUnit = (metric) => {
    switch (metric) {
      case 'successRate': return '%';
      case 'duration': return 'min';
      case 'avgResponseTime': return 'ms';
      case 'requestsPerSecond': return 'RPS';
      case 'errorRate': return '%';
      default: return '';
    }
  };

  const getMetricColor = (metric) => {
    switch (metric) {
      case 'successRate': return 'var(--color-success)';
      case 'duration': return 'var(--color-warning)';
      case 'avgResponseTime': return 'var(--color-accent)';
      case 'requestsPerSecond': return 'var(--color-primary)';
      case 'errorRate': return 'var(--color-error)';
      default: return 'var(--color-primary)';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const comparisonData = getComparisonData();

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name="GitCompare" size={24} className="text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Attack Results Comparison</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Export Comparison
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Comparison Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Select
                label="Comparison Metric"
                options={comparisonOptions}
                value={comparisonMetric}
                onChange={setComparisonMetric}
                className="w-48"
              />
              
              {availableResults?.length > 0 && comparisonResults?.length < 4 && (
                <Select
                  placeholder="Add result to compare..."
                  options={availableResults?.map(result => ({
                    value: result?.id,
                    label: `${result?.name} (${result?.type})`
                  }))}
                  value=""
                  onChange={addResultToComparison}
                  className="w-64"
                />
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {comparisonResults?.length}/4 results selected
            </div>
          </div>

          {comparisonResults?.length === 0 && (
            <div className="text-center py-12">
              <Icon name="GitCompare" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Results Selected</h3>
              <p className="text-muted-foreground">Select at least 2 results to start comparing</p>
            </div>
          )}

          {comparisonResults?.length > 0 && (
            <div className="space-y-6">
              {/* Selected Results Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {comparisonResults?.map((result) => (
                  <div key={result?.id} className="bg-muted/30 border border-border rounded-lg p-4 relative">
                    <button
                      onClick={() => removeResultFromComparison(result?.id)}
                      className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-error transition-smooth"
                    >
                      <Icon name="X" size={16} />
                    </button>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground text-sm">{result?.name}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="text-foreground">{result?.type}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Target:</span>
                          <span className="text-foreground">{result?.target}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="text-foreground">{formatDate(result?.executedAt)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="text-foreground">{formatDuration(result?.duration)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Success:</span>
                          <span className="text-success font-medium">{result?.successRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Chart */}
              {comparisonResults?.length >= 2 && (
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {comparisonOptions?.find(opt => opt?.value === comparisonMetric)?.label} Comparison
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis 
                          dataKey="name" 
                          stroke="var(--color-muted-foreground)"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="var(--color-muted-foreground)"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-popover)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px'
                          }}
                          formatter={(value, name, props) => [
                            `${value}${getMetricUnit(comparisonMetric)}`,
                            props?.payload?.fullName
                          ]}
                        />
                        <Bar 
                          dataKey={comparisonMetric} 
                          fill={getMetricColor(comparisonMetric)}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Detailed Comparison Table */}
              {comparisonResults?.length >= 2 && (
                <div className="bg-muted/30 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Detailed Comparison</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium text-foreground">Metric</th>
                          {comparisonResults?.map((result) => (
                            <th key={result?.id} className="p-3 text-left text-sm font-medium text-foreground">
                              {result?.name?.substring(0, 20)}...
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="p-3 text-sm text-muted-foreground">Attack Type</td>
                          {comparisonResults?.map((result) => (
                            <td key={result?.id} className="p-3 text-sm text-foreground">{result?.type}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-3 text-sm text-muted-foreground">Target System</td>
                          {comparisonResults?.map((result) => (
                            <td key={result?.id} className="p-3 text-sm text-foreground">{result?.target}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-3 text-sm text-muted-foreground">Success Rate</td>
                          {comparisonResults?.map((result) => (
                            <td key={result?.id} className="p-3 text-sm text-success font-medium">{result?.successRate}%</td>
                          ))}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-3 text-sm text-muted-foreground">Duration</td>
                          {comparisonResults?.map((result) => (
                            <td key={result?.id} className="p-3 text-sm text-foreground">{formatDuration(result?.duration)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-3 text-sm text-muted-foreground">Execution Date</td>
                          {comparisonResults?.map((result) => (
                            <td key={result?.id} className="p-3 text-sm text-foreground">{formatDate(result?.executedAt)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-3 text-sm text-muted-foreground">Avg Response Time</td>
                          {comparisonData?.map((result) => (
                            <td key={result?.fullName} className="p-3 text-sm text-foreground">{result?.avgResponseTime}ms</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-3 text-sm text-muted-foreground">Requests/Second</td>
                          {comparisonData?.map((result) => (
                            <td key={result?.fullName} className="p-3 text-sm text-foreground">{result?.requestsPerSecond}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Key Insights */}
              {comparisonResults?.length >= 2 && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                    <Icon name="Lightbulb" size={20} />
                    <span>Key Insights</span>
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Icon name="TrendingUp" size={16} className="text-success mt-0.5" />
                      <p className="text-sm text-foreground">
                        <strong>{comparisonResults?.reduce((best, current) => 
                          current?.successRate > best?.successRate ? current : best
                        )?.name}</strong> achieved the highest success rate at {Math.max(...comparisonResults?.map(r => r?.successRate))}%
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Icon name="Clock" size={16} className="text-warning mt-0.5" />
                      <p className="text-sm text-foreground">
                        <strong>{comparisonResults?.reduce((shortest, current) => 
                          current?.duration < shortest?.duration ? current : shortest
                        )?.name}</strong> completed in the shortest time ({Math.min(...comparisonResults?.map(r => r?.duration))}s)
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Icon name="Target" size={16} className="text-primary mt-0.5" />
                      <p className="text-sm text-foreground">
                        Most tested target: <strong>{
                          comparisonResults?.reduce((acc, result) => {
                            acc[result.target] = (acc?.[result?.target] || 0) + 1;
                            return acc;
                          }, {})
                        }</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;