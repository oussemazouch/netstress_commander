import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ActionButtons = ({ 
  onSaveTemplate, 
  onScheduleAttack, 
  onLaunchAttack, 
  isValid,
  loading 
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleSaveTemplate = () => {
    if (templateName?.trim()) {
      onSaveTemplate(templateName?.trim());
      setShowSaveModal(false);
      setTemplateName('');
    }
  };

  const handleScheduleAttack = () => {
    if (scheduleDate && scheduleTime) {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      onScheduleAttack(scheduledDateTime);
      setShowScheduleModal(false);
      setScheduleDate('');
      setScheduleTime('');
    }
  };

  const handleLaunchAttack = () => {
    onLaunchAttack();
    setShowLaunchModal(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
        <Button
          variant="outline"
          iconName="Save"
          iconPosition="left"
          onClick={() => setShowSaveModal(true)}
          disabled={!isValid}
          className="flex-1 sm:flex-none"
        >
          Save Template
        </Button>

        <Button
          variant="secondary"
          iconName="Calendar"
          iconPosition="left"
          onClick={() => setShowScheduleModal(true)}
          disabled={!isValid}
          className="flex-1 sm:flex-none"
        >
          Schedule Attack
        </Button>

        <Button
          variant="default"
          iconName="Play"
          iconPosition="left"
          onClick={() => setShowLaunchModal(true)}
          disabled={!isValid}
          loading={loading}
          className="flex-1 sm:flex-none"
        >
          Launch Immediately
        </Button>
      </div>
      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Save" size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Save Configuration Template</h3>
              </div>
              
              <Input
                label="Template Name"
                type="text"
                placeholder="Enter template name"
                value={templateName}
                onChange={(e) => setTemplateName(e?.target?.value)}
                required
                description="Give your configuration template a descriptive name"
                className="mb-6"
              />

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleSaveTemplate}
                  disabled={!templateName?.trim()}
                  className="flex-1"
                >
                  Save Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Schedule Attack Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Calendar" size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Schedule Attack</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <Input
                  label="Schedule Date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e?.target?.value)}
                  required
                  min={new Date()?.toISOString()?.split('T')?.[0]}
                />

                <Input
                  label="Schedule Time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e?.target?.value)}
                  required
                />
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} className="text-warning" />
                  <span className="text-sm font-medium text-warning">Scheduling Notice</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Scheduled attacks will execute automatically at the specified time. 
                  Ensure target authorization remains valid.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleScheduleAttack}
                  disabled={!scheduleDate || !scheduleTime}
                  className="flex-1"
                >
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Launch Attack Confirmation Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
                <h3 className="text-lg font-semibold text-foreground">Confirm Attack Launch</h3>
              </div>
              
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Shield" size={16} className="text-error" />
                  <span className="text-sm font-medium text-error">Security Warning</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You are about to launch a network stress test. Ensure you have:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Explicit authorization to test the target system</li>
                  <li>• Verified the target configuration is correct</li>
                  <li>• Notified relevant stakeholders if required</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLaunchModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLaunchAttack}
                  loading={loading}
                  className="flex-1"
                >
                  Launch Attack
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionButtons;