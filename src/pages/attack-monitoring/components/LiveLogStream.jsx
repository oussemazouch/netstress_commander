import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LiveLogStream = ({ attack, isExpanded, onToggleExpanded }) => {
  const [logs, setLogs] = useState([]);
  const [filterLevel, setFilterLevel] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef(null);

  // Mock log data that updates in real-time
  useEffect(() => {
    if (!attack || attack?.status !== 'running') return;

    const logMessages = [
      { level: 'info', message: 'Connection established to target server', timestamp: new Date() },
      { level: 'success', message: 'Request batch completed successfully (100 requests)', timestamp: new Date() },
      { level: 'warning', message: 'Response time exceeded threshold: 520ms', timestamp: new Date() },
      { level: 'error', message: 'Connection timeout on request #1247', timestamp: new Date() },
      { level: 'info', message: 'Adjusting request rate to maintain target load', timestamp: new Date() },
      { level: 'success', message: 'Target response received: HTTP 200 OK', timestamp: new Date() },
      { level: 'warning', message: 'High error rate detected: 6.2%', timestamp: new Date() },
      { level: 'info', message: 'Payload size: 1024 bytes, Content-Type: application/json', timestamp: new Date() },
      { level: 'error', message: 'Server returned HTTP 503 Service Unavailable', timestamp: new Date() },
      { level: 'success', message: 'Connection pool optimized for current load', timestamp: new Date() }
    ];

    const interval = setInterval(() => {
      const randomLog = logMessages?.[Math.floor(Math.random() * logMessages?.length)];
      const newLog = {
        ...randomLog,
        id: Date.now() + Math.random(),
        timestamp: new Date()
      };
      
      setLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs]?.slice(0, 1000); // Keep last 1000 logs
        return updatedLogs;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [attack]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef?.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs?.filter(log => 
    filterLevel === 'all' || log?.level === filterLevel
  );

  const getLevelIcon = (level) => {
    switch (level) {
      case 'success': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      default: return 'Info';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-primary';
    }
  };

  const getLevelBg = (level) => {
    switch (level) {
      case 'success': return 'bg-success/10';
      case 'warning': return 'bg-warning/10';
      case 'error': return 'bg-error/10';
      default: return 'bg-primary/10';
    }
  };

  if (!attack) {
    return null;
  }

  return (
    <div className={`bg-card border border-border rounded-lg transition-all duration-300 ${
      isExpanded ? 'h-96' : 'h-16'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Terminal" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Live Log Stream</h3>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isExpanded && (
            <>
              {/* Filter Controls */}
              <div className="flex items-center space-x-2">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e?.target?.value)}
                  className="bg-muted border border-border rounded px-2 py-1 text-sm text-foreground"
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                
                <Button
                  variant="ghost"
                  size="sm"
                  iconName={autoScroll ? "ArrowDown" : "ArrowDownToLine"}
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={autoScroll ? "text-primary" : "text-muted-foreground"}
                >
                  Auto-scroll
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Trash2"
                  onClick={() => setLogs([])}
                >
                  Clear
                </Button>
              </div>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            iconName={isExpanded ? "ChevronDown" : "ChevronUp"}
            onClick={onToggleExpanded}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>
      {/* Log Content */}
      {isExpanded && (
        <div 
          ref={logContainerRef}
          className="p-4 h-80 overflow-y-auto bg-background/50 font-mono text-sm"
        >
          {filteredLogs?.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Icon name="Terminal" size={32} className="mx-auto mb-2 opacity-50" />
                <p>No logs to display</p>
                <p className="text-xs mt-1">
                  {filterLevel !== 'all' ? `No ${filterLevel} level logs found` : 'Waiting for log data...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLogs?.map((log) => (
                <div
                  key={log?.id}
                  className={`flex items-start space-x-3 p-2 rounded ${getLevelBg(log?.level)} hover:bg-opacity-20 transition-colors`}
                >
                  <Icon 
                    name={getLevelIcon(log?.level)} 
                    size={16} 
                    className={`${getLevelColor(log?.level)} mt-0.5 flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        log?.level === 'success' ? 'bg-success/20 text-success' :
                        log?.level === 'warning' ? 'bg-warning/20 text-warning' :
                        log?.level === 'error'? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'
                      }`}>
                        {log?.level?.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {log?.timestamp?.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">{log?.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveLogStream;