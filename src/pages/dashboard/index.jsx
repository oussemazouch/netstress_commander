import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import KPICard from './components/KPICard';
import AttackStatusTable from './components/AttackStatusTable';
import QuickLaunchPanel from './components/QuickLaunchPanel';
import ActivityFeed from './components/ActivityFeed';
import NodeFleetStatus from './components/NodeFleetStatus';
import AttackMetricsChart from './components/AttackMetricsChart';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { attackService } from '../../services/attackService';
import { nodeService } from '../../services/nodeService';
import { activityService } from '../../services/activityService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Initialize Supabase client
  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL || '',
    process.env.REACT_APP_SUPABASE_ANON_KEY || ''
  );

  // Replace mock data with Supabase state
  const [dashboardStats, setDashboardStats] = useState({
    activeAttacks: 0,
    queuedAttacks: 0,
    connectedNodes: 0,
    availableNodes: 0,
    totalRequests: 0,
    systemHealth: 0
  });
  const [activeAttacks, setActiveAttacks] = useState([]);
  const [quickLaunchTemplates, setQuickLaunchTemplates] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [nodeFleet, setNodeFleet] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all dashboard data
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        statsData,
        attacksData, 
        templatesData,
        activitiesData,
        nodesData,
        metricsChartData
      ] = await Promise.all([
        dashboardService?.getDashboardStats(),
        dashboardService?.getActiveAttacksOverview(),
        attackService?.getAttackTemplates(),
        activityService?.getActivities(5),
        nodeService?.getAttackNodes(),
        dashboardService?.getMetricsChartData('24 hours')
      ]);

      setDashboardStats(statsData);
      setActiveAttacks(attacksData);
      setQuickLaunchTemplates(templatesData?.slice(0, 4) || []); // Show first 4 templates
      setRecentActivities(activitiesData);
      setNodeFleet(nodesData);
      setMetricsData(metricsChartData);

    } catch (err) {
      setError(`Failed to load dashboard data: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    let channels = [];

    // Subscribe to attack updates
    const attackChannel = supabase?.channel('dashboard-attacks')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attack_campaigns'
        },
        () => {
          // Refresh attacks data when changes occur
          dashboardService?.getActiveAttacksOverview()?.then(setActiveAttacks)?.catch(console.error);
          
          dashboardService?.getDashboardStats()?.then(setDashboardStats)?.catch(console.error);
        }
      )?.subscribe();

    // Subscribe to activity updates
    const activityChannel = supabase?.channel('dashboard-activities')?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        () => {
          activityService?.getActivities(5)?.then(setRecentActivities)?.catch(console.error);
        }
      )?.subscribe();

    // Subscribe to node updates
    const nodeChannel = supabase?.channel('dashboard-nodes')?.on(
        'postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'attack_nodes'
        },
        () => {
          nodeService?.getAttackNodes()?.then(setNodeFleet)?.catch(console.error);

          dashboardService?.getDashboardStats()?.then(setDashboardStats)?.catch(console.error);
        }
      )?.subscribe();

    channels = [attackChannel, activityChannel, nodeChannel];

    return () => {
      channels?.forEach(channel => supabase?.removeChannel(channel));
    };
  }, [user]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleViewAttackDetails = (attackId) => {
    navigate(`/attack-monitoring?id=${attackId}`);
  };

  const handleStopAttack = async (attackId) => {
    try {
      await attackService?.stopAttack(attackId);
      
      // Create activity log
      await activityService?.createAttackActivity(
        'attack_stopped',
        `Attack stopped by ${userProfile?.full_name || user?.email}`,
        attackId,
        user?.id
      );

      // Refresh data
      loadDashboardData();
    } catch (err) {
      setError(`Failed to stop attack: ${err?.message}`);
    }
  };

  const handleLaunchTemplate = (templateId) => {
    navigate(`/attack-configuration?template=${templateId}`);
  };

  const handleLaunchNewAttack = () => {
    navigate('/attack-configuration');
  };

  // Prepare KPI data from real stats
  const kpiData = [
    {
      title: "Active Attacks",
      value: dashboardStats?.activeAttacks?.toString() || "0",
      subtitle: `${dashboardStats?.queuedAttacks || 0} queued`,
      icon: "Zap",
      trend: "neutral",
      trendValue: "",
      color: "primary"
    },
    {
      title: "Connected Nodes", 
      value: dashboardStats?.connectedNodes?.toString() || "0",
      subtitle: `${dashboardStats?.availableNodes || 0} available`,
      icon: "Server",
      trend: "neutral",
      trendValue: "",
      color: "success"
    },
    {
      title: "System Health",
      value: `${dashboardStats?.systemHealth || 0}%`,
      subtitle: "All systems operational",
      icon: "Activity", 
      trend: "neutral",
      trendValue: "",
      color: dashboardStats?.systemHealth >= 90 ? "success" : "warning"
    },
    {
      title: "Total Requests",
      value: formatNumber(dashboardStats?.totalRequests || 0),
      subtitle: "Last 24 hours",
      icon: "BarChart3",
      trend: "neutral", 
      trendValue: "",
      color: "warning"
    }
  ];

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000)?.toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000)?.toFixed(1) + 'K';
    return num?.toString();
  }

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
                Please sign in to access the NetStress Commander Dashboard
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
                onClick={loadDashboardData}
              >
                Retry
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
                NetStress Commander Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor active attack simulations and system status • {currentTime?.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button 
                variant="outline" 
                iconName="Settings" 
                iconPosition="left"
                onClick={() => navigate('/attack-configuration')}
              >
                Configure
              </Button>
              <Button 
                variant="primary" 
                iconName="Plus" 
                iconPosition="left"
                onClick={handleLaunchNewAttack}
              >
                Launch New Attack
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div>Loading dashboard data...</div>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {kpiData?.map((kpi, index) => (
                  <KPICard
                    key={index}
                    title={kpi?.title}
                    value={kpi?.value}
                    subtitle={kpi?.subtitle}
                    icon={kpi?.icon}
                    trend={kpi?.trend}
                    trendValue={kpi?.trendValue}
                    color={kpi?.color}
                  />
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                {/* Left Panel - Attack Status Table */}
                <div className="xl:col-span-2">
                  <AttackStatusTable
                    attacks={activeAttacks}
                    onViewDetails={handleViewAttackDetails}
                    onStopAttack={handleStopAttack}
                  />
                </div>

                {/* Right Panel - Quick Launch & Activity */}
                <div className="space-y-8">
                  <QuickLaunchPanel
                    templates={quickLaunchTemplates}
                    onLaunchTemplate={handleLaunchTemplate}
                  />
                  <ActivityFeed activities={recentActivities} />
                </div>
              </div>

              {/* Bottom Section - Charts and Node Status */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Attack Metrics Chart */}
                <div className="xl:col-span-2">
                  <AttackMetricsChart data={metricsData} type="area" />
                </div>

                {/* Node Fleet Status */}
                <div>
                  <NodeFleetStatus nodes={nodeFleet} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;