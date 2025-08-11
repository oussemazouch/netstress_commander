import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import AttackControls from './components/AttackControls';
import AttackMetrics from './components/AttackMetrics';
import LiveLogStream from './components/LiveLogStream';
import ActiveAttacksList from './components/ActiveAttacksList';

import { useAuth } from '../../contexts/AuthContext';
import { attackService } from '../../services/attackService';
import { supabase } from '../../lib/supabase';
import { activityService } from '../../services/activityService';
import Button from '../../components/ui/Button';

const AttackMonitoring = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const campaignId = searchParams?.get('id');

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load initial data
  useEffect(() => {
    if (user) {
      loadMonitoringData();
    }
  }, [user, campaignId]);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load active campaigns
      const campaignsData = await attackService?.getAttackCampaigns({
        status: 'running'
      });
      setActiveCampaigns(campaignsData);

      // If specific campaign ID provided, load its details
      if (campaignId) {
        const campaign = await attackService?.getAttackCampaign(campaignId);
        setSelectedCampaign(campaign);

        // Load metrics for this campaign
        const metricsData = await attackService?.getAttackMetrics(campaignId, '1 hour');
        setMetrics(metricsData);

        // Load activities for this campaign
        const activitiesData = await activityService?.getActivitiesForCampaign(campaignId);
        setRecentActivities(activitiesData);
      } else if (campaignsData?.length > 0) {
        // Select first active campaign if no specific one requested
        const firstCampaign = campaignsData?.[0];
        setSelectedCampaign(firstCampaign);
        
        const metricsData = await attackService?.getAttackMetrics(firstCampaign?.id, '1 hour');
        setMetrics(metricsData);

        const activitiesData = await activityService?.getActivitiesForCampaign(firstCampaign?.id);
        setRecentActivities(activitiesData);
      }
    } catch (err) {
      setError(`Failed to load monitoring data: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !selectedCampaign) return;

    let channels = [];

    // Subscribe to campaign updates
    const campaignChannel = attackService?.subscribeToAttackUpdates(
      selectedCampaign?.id,
      (payload) => {
        if (payload?.eventType === 'UPDATE') {
          setSelectedCampaign(prev => ({
            ...prev,
            ...payload?.new
          }));
        }
      }
    );

    // Subscribe to metrics updates
    const metricsChannel = attackService?.subscribeToMetricsUpdates(
      selectedCampaign?.id,
      (payload) => {
        if (payload?.eventType === 'INSERT') {
          setMetrics(prev => [...prev, payload?.new]?.slice(-100)); // Keep last 100 metrics
        }
      }
    );

    // Subscribe to activity updates
    const activityChannel = activityService?.subscribeToActivities((payload) => {
      if (payload?.eventType === 'INSERT' && payload?.new?.campaign_id === selectedCampaign?.id) {
        setRecentActivities(prev => [payload?.new, ...prev]?.slice(0, 20)); // Keep last 20 activities
      }
    });

    channels = [campaignChannel, metricsChannel, activityChannel];

    return () => {
      channels?.forEach(channel => {
        if (channel) {
          supabase?.removeChannel(channel);
        }
      });
    };
  }, [user, selectedCampaign?.id]);

  const handleCampaignSelect = async (campaign) => {
    try {
      setSelectedCampaign(campaign);
      
      // Update URL
      navigate(`/attack-monitoring?id=${campaign?.id}`, { replace: true });
      
      // Load campaign details, metrics, and activities
      const [campaignDetails, metricsData, activitiesData] = await Promise.all([
        attackService?.getAttackCampaign(campaign?.id),
        attackService?.getAttackMetrics(campaign?.id, '1 hour'),
        activityService?.getActivitiesForCampaign(campaign?.id)
      ]);

      setSelectedCampaign(campaignDetails);
      setMetrics(metricsData);
      setRecentActivities(activitiesData);
    } catch (err) {
      setError(`Failed to load campaign details: ${err?.message}`);
    }
  };

  const handleStartAttack = async () => {
    if (!selectedCampaign) return;

    try {
      await attackService?.startAttack(selectedCampaign?.id);
      
      await activityService?.createAttackActivity(
        'attack_started',
        `Attack "${selectedCampaign?.name}" started by ${userProfile?.full_name || user?.email}`,
        selectedCampaign?.id,
        user?.id
      );

      // Refresh data
      loadMonitoringData();
    } catch (err) {
      setError(`Failed to start attack: ${err?.message}`);
    }
  };

  const handlePauseAttack = async () => {
    if (!selectedCampaign) return;

    try {
      await attackService?.pauseAttack(selectedCampaign?.id);
      
      await activityService?.createAttackActivity(
        'attack_paused',
        `Attack "${selectedCampaign?.name}" paused by ${userProfile?.full_name || user?.email}`,
        selectedCampaign?.id,
        user?.id
      );

      loadMonitoringData();
    } catch (err) {
      setError(`Failed to pause attack: ${err?.message}`);
    }
  };

  const handleStopAttack = async () => {
    if (!selectedCampaign) return;

    try {
      await attackService?.stopAttack(selectedCampaign?.id);
      
      await activityService?.createAttackActivity(
        'attack_stopped',
        `Attack "${selectedCampaign?.name}" stopped by ${userProfile?.full_name || user?.email}`,
        selectedCampaign?.id,
        user?.id
      );

      loadMonitoringData();
    } catch (err) {
      setError(`Failed to stop attack: ${err?.message}`);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading authentication...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-foreground mb-4">
                Please sign in to monitor attacks
              </h1>
              <Button 
                variant="primary"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center py-8">
              <div>Loading monitoring data...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="text-red-600 mb-4">Error: {error}</div>
              <Button 
                variant="primary" 
                onClick={loadMonitoringData}
              >
                Retry
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!selectedCampaign && activeCampaigns?.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Breadcrumb />
            <div className="text-center py-12">
              <h1 className="text-2xl font-semibold text-foreground mb-4">
                No Active Attacks to Monitor
              </h1>
              <p className="text-muted-foreground mb-6">
                There are currently no running attacks to monitor. Launch a new attack to see real-time data.
              </p>
              <Button 
                variant="primary"
                onClick={() => navigate('/attack-configuration')}
                iconName="Plus"
                iconPosition="left"
              >
                Launch New Attack
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Attack Monitoring
              </h1>
              <p className="text-muted-foreground">
                Real-time monitoring of active network stress testing attacks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Left Sidebar - Active Attacks List */}
            <div className="xl:col-span-1">
              <ActiveAttacksList
                campaigns={activeCampaigns}
                attacks={activeCampaigns}
                selectedCampaign={selectedCampaign}
                selectedAttack={selectedCampaign}
                onCampaignSelect={handleCampaignSelect}
                onSelectAttack={handleCampaignSelect}
              />
            </div>

            {/* Main Content - Monitoring Dashboard */}
            <div className="xl:col-span-3 space-y-8">
              {selectedCampaign && (
                <>
                  {/* Attack Controls */}
                  <AttackControls
                    campaign={selectedCampaign}
                    attack={selectedCampaign}
                    onStart={handleStartAttack}
                    onPause={handlePauseAttack}
                    onStop={handleStopAttack}
                    onAbort={handleStopAttack}
                    onExport={() => {}}
                  />

                  {/* Attack Metrics */}
                  <AttackMetrics
                    campaign={selectedCampaign}
                    attack={selectedCampaign}
                    metrics={metrics}
                  />

                  {/* Live Log Stream */}
                  <LiveLogStream
                    activities={recentActivities}
                    attack={selectedCampaign}
                    campaignId={selectedCampaign?.id}
                    isExpanded={true}
                    onToggleExpanded={() => {}}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttackMonitoring;