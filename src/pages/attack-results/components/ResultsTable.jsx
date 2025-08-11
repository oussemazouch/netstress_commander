import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResultsTable = ({ results, onResultClick, onBulkSelect, selectedResults, sortConfig, onSort }) => {
  const [selectAll, setSelectAll] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'failed': return 'text-error';
      case 'partial': return 'text-warning';
      case 'aborted': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'failed': return 'XCircle';
      case 'partial': return 'AlertTriangle';
      case 'aborted': return 'StopCircle';
      default: return 'Circle';
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      onBulkSelect(results?.map(result => result?.id));
    } else {
      onBulkSelect([]);
    }
  };

  const handleRowSelect = (resultId) => {
    const newSelected = selectedResults?.includes(resultId)
      ? selectedResults?.filter(id => id !== resultId)
      : [...selectedResults, resultId];
    
    onBulkSelect(newSelected);
    setSelectAll(newSelected?.length === results?.length);
  };

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const handleSort = (column) => {
    onSort(column);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Attack Name</span>
                  <Icon name={getSortIcon('name')} size={14} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Type</span>
                  <Icon name={getSortIcon('type')} size={14} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('target')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Target</span>
                  <Icon name={getSortIcon('target')} size={14} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('executedAt')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Executed</span>
                  <Icon name={getSortIcon('executedAt')} size={14} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('duration')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Duration</span>
                  <Icon name={getSortIcon('duration')} size={14} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Status</span>
                  <Icon name={getSortIcon('status')} size={14} />
                </button>
              </th>
              <th className="p-4 text-left">
                <span className="text-sm font-medium text-foreground">Success Rate</span>
              </th>
              <th className="p-4 text-left">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {results?.map((result) => (
              <tr
                key={result?.id}
                className="border-b border-border hover:bg-muted/30 transition-smooth cursor-pointer"
                onClick={() => onResultClick(result)}
              >
                <td className="p-4" onClick={(e) => e?.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedResults?.includes(result?.id)}
                    onChange={() => handleRowSelect(result?.id)}
                    className="rounded border-border"
                  />
                </td>
                <td className="p-4">
                  <div className="font-medium text-foreground">{result?.name}</div>
                  <div className="text-sm text-muted-foreground">ID: {result?.id}</div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {result?.type}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm text-foreground">{result?.target}</div>
                  <div className="text-xs text-muted-foreground">{result?.targetPort}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-foreground">{formatDate(result?.executedAt)}</div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-foreground">{formatDuration(result?.duration)}</span>
                </td>
                <td className="p-4">
                  <div className={`flex items-center space-x-1 ${getStatusColor(result?.status)}`}>
                    <Icon name={getStatusIcon(result?.status)} size={16} />
                    <span className="text-sm font-medium capitalize">{result?.status}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{ width: `${result?.successRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-foreground">{result?.successRate}%</span>
                  </div>
                </td>
                <td className="p-4" onClick={(e) => e?.stopPropagation()}>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResultClick(result)}
                      iconName="Eye"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Download"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {results?.map((result) => (
          <div
            key={result?.id}
            className="bg-muted/30 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-smooth"
            onClick={() => onResultClick(result)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedResults?.includes(result?.id)}
                  onChange={() => handleRowSelect(result?.id)}
                  onClick={(e) => e?.stopPropagation()}
                  className="rounded border-border"
                />
                <div>
                  <h4 className="font-medium text-foreground">{result?.name}</h4>
                  <p className="text-sm text-muted-foreground">ID: {result?.id}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${getStatusColor(result?.status)}`}>
                <Icon name={getStatusIcon(result?.status)} size={16} />
                <span className="text-sm font-medium capitalize">{result?.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                  {result?.type}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-sm text-foreground">{result?.target}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm text-foreground">{formatDuration(result?.duration)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <div className="flex items-center space-x-2">
                  <div className="w-12 bg-muted rounded-full h-1.5">
                    <div
                      className="bg-success h-1.5 rounded-full"
                      style={{ width: `${result?.successRate}%` }}
                    />
                  </div>
                  <span className="text-sm text-foreground">{result?.successRate}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{formatDate(result?.executedAt)}</p>
              <div className="flex items-center space-x-1" onClick={(e) => e?.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onResultClick(result)}
                  iconName="Eye"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Download"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {results?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Results Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;