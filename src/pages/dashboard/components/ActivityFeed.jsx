import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      attack_started: 'Play',
      attack_completed: 'CheckCircle',
      attack_failed: 'XCircle',
      attack_paused: 'Pause',
      node_connected: 'Wifi',
      node_disconnected: 'WifiOff',
      user_login: 'LogIn',
      config_updated: 'Settings'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      attack_started: 'text-primary',
      attack_completed: 'text-success',
      attack_failed: 'text-error',
      attack_paused: 'text-warning',
      node_connected: 'text-success',
      node_disconnected: 'text-error',
      user_login: 'text-primary',
      config_updated: 'text-warning'
    };
    return colors?.[type] || 'text-muted-foreground';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <button className="text-xs text-primary hover:text-primary/80 transition-smooth">
            View All
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities?.map((activity, index) => (
            <div key={activity?.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-muted ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity?.message}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(activity?.timestamp)}</span>
                  {activity?.user && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{activity?.user}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {activities?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Activity" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;