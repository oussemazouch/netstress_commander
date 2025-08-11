import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ResultsFilters = ({ onFiltersChange, savedFilters, onSaveFilter, onLoadFilter }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    attackType: '',
    targetSystem: '',
    status: '',
    searchQuery: '',
    duration: { min: '', max: '' }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const attackTypeOptions = [
    { value: '', label: 'All Attack Types' },
    { value: 'get_flooding', label: 'GET Flooding' },
    { value: 'post_flooding', label: 'POST Flooding' },
    { value: 'icmp_flooding', label: 'ICMP Flooding' },
    { value: 'slowloris', label: 'Slowloris' },
    { value: 'syn_flood', label: 'SYN Flood' },
    { value: 'udp_flood', label: 'UDP Flood' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'partial', label: 'Partial Success' },
    { value: 'aborted', label: 'Aborted' }
  ];

  const targetSystemOptions = [
    { value: '', label: 'All Target Systems' },
    { value: '192.168.1.100', label: 'Web Server (192.168.1.100)' },
    { value: '192.168.1.101', label: 'API Server (192.168.1.101)' },
    { value: '192.168.1.102', label: 'Database Server (192.168.1.102)' },
    { value: '10.0.0.50', label: 'Load Balancer (10.0.0.50)' },
    { value: '10.0.0.51', label: 'Cache Server (10.0.0.51)' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (type, value) => {
    const newDateRange = { ...filters?.dateRange, [type]: value };
    const newFilters = { ...filters, dateRange: newDateRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDurationChange = (type, value) => {
    const newDuration = { ...filters?.duration, [type]: value };
    const newFilters = { ...filters, duration: newDuration };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      dateRange: { start: '', end: '' },
      attackType: '',
      targetSystem: '',
      status: '',
      searchQuery: '',
      duration: { min: '', max: '' }
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleSaveFilter = () => {
    if (filterName?.trim()) {
      onSaveFilter(filterName, filters);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const hasActiveFilters = () => {
    return filters?.searchQuery || filters?.attackType || filters?.targetSystem || 
           filters?.status || filters?.dateRange?.start || filters?.dateRange?.end ||
           filters?.duration?.min || filters?.duration?.max;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Filter" size={20} />
          <span>Filter Results</span>
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            iconName={showAdvanced ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            Advanced
          </Button>
          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Input
          type="search"
          placeholder="Search attacks..."
          value={filters?.searchQuery}
          onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
          className="w-full"
        />

        <Select
          placeholder="Attack Type"
          options={attackTypeOptions}
          value={filters?.attackType}
          onChange={(value) => handleFilterChange('attackType', value)}
        />

        <Select
          placeholder="Target System"
          options={targetSystemOptions}
          value={filters?.targetSystem}
          onChange={(value) => handleFilterChange('targetSystem', value)}
        />

        <Select
          placeholder="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />
      </div>
      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters?.dateRange?.start}
                  onChange={(e) => handleDateRangeChange('start', e?.target?.value)}
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters?.dateRange?.end}
                  onChange={(e) => handleDateRangeChange('end', e?.target?.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters?.duration?.min}
                  onChange={(e) => handleDurationChange('min', e?.target?.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters?.duration?.max}
                  onChange={(e) => handleDurationChange('max', e?.target?.value)}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Saved Filters</label>
              <div className="flex items-center space-x-2">
                <Select
                  placeholder="Load saved filter..."
                  options={savedFilters?.map(filter => ({
                    value: filter?.name,
                    label: filter?.name
                  }))}
                  value=""
                  onChange={(value) => onLoadFilter(value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  iconName="Save"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold text-foreground mb-4">Save Filter Preset</h4>
            <Input
              label="Filter Name"
              placeholder="Enter filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e?.target?.value)}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setFilterName('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSaveFilter}
                disabled={!filterName?.trim()}
              >
                Save Filter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsFilters;