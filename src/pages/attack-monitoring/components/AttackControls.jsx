import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AttackControls = ({ attack, onPause, onStop, onAbort, onExport }) => {
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);

  if (!attack) {
    return null;
  }

  const handleStop = () => {
    onStop(attack?.id);
    setShowStopConfirm(false);
  };

  const handleAbort = () => {
    onAbort(attack?.id);
    setShowAbortConfirm(false);
  };

  const isRunning = attack?.status === 'running';
  const isPaused = attack?.status === 'paused';
  const isCompleted = attack?.status === 'completed';

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Settings" size={20} />
          <span>Attack Controls</span>
        </h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Clock" size={16} />
          <span>Started: {new Date(attack.startTime)?.toLocaleTimeString()}</span>
        </div>
      </div>
      {/* Primary Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        {isRunning && (
          <Button
            variant="warning"
            iconName="Pause"
            iconPosition="left"
            onClick={() => onPause(attack?.id)}
          >
            Pause Attack
          </Button>
        )}

        {isPaused && (
          <Button
            variant="success"
            iconName="Play"
            iconPosition="left"
            onClick={() => onPause(attack?.id)}
          >
            Resume Attack
          </Button>
        )}

        {(isRunning || isPaused) && (
          <Button
            variant="outline"
            iconName="Square"
            iconPosition="left"
            onClick={() => setShowStopConfirm(true)}
          >
            Stop Attack
          </Button>
        )}

        {(isRunning || isPaused) && (
          <Button
            variant="destructive"
            iconName="X"
            iconPosition="left"
            onClick={() => setShowAbortConfirm(true)}
          >
            Abort Attack
          </Button>
        )}

        <Button
          variant="outline"
          iconName="Download"
          iconPosition="left"
          onClick={() => onExport(attack?.id, 'json')}
        >
          Export Data
        </Button>
      </div>
      {/* Attack Timeline */}
      <div className="bg-muted/30 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Timeline" size={16} />
          <span>Attack Timeline</span>
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success rounded-full" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Attack Started</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(attack.startTime)?.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Initial connection established</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Ramp-up Phase</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(attack.startTime + 120000)?.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Request rate increased to target level</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-warning animate-pulse' : 'bg-muted'}`} />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Sustained Load</span>
                <span className="text-xs text-muted-foreground">
                  {isRunning ? 'In Progress' : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Maintaining target request rate</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-muted rounded-full" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Completion</span>
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>
              <p className="text-xs text-muted-foreground">Attack will complete automatically</p>
            </div>
          </div>
        </div>
      </div>
      {/* Export Options */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Download" size={16} />
          <span>Export Options</span>
        </h4>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="FileText"
            iconPosition="left"
            onClick={() => onExport(attack?.id, 'json')}
          >
            JSON
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="Table"
            iconPosition="left"
            onClick={() => onExport(attack?.id, 'csv')}
          >
            CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="FileImage"
            iconPosition="left"
            onClick={() => onExport(attack?.id, 'pdf')}
          >
            PDF Report
          </Button>
        </div>
      </div>
      {/* Stop Confirmation Modal */}
      {showStopConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Stop Attack</h3>
                <p className="text-sm text-muted-foreground">This action will gracefully stop the attack</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              The attack will be stopped gracefully, allowing current requests to complete. 
              All data collected so far will be preserved.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowStopConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="warning"
                onClick={handleStop}
              >
                Stop Attack
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Abort Confirmation Modal */}
      {showAbortConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-error/20 rounded-full flex items-center justify-center">
                <Icon name="X" size={20} className="text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Abort Attack</h3>
                <p className="text-sm text-muted-foreground">This action will immediately terminate the attack</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              The attack will be terminated immediately without waiting for current requests to complete. 
              This may result in incomplete data collection.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAbortConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleAbort}
              >
                Abort Attack
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttackControls;