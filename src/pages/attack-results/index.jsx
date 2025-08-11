import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { attackService } from '../../services/attackService';
import { activityService } from '../../services/activityService';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import ResultsTable from './components/ResultsTable';
import ResultsFilters from './components/ResultsFilters';
import ResultsSidebar from './components/ResultsSidebar';
import ResultDetailModal from './components/ResultDetailModal';
import ComparisonModal from './components/ComparisonModal';

const AttackResults = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    attack_type: 'all',
    target_type: 'all',
    date_range: '7_days',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load campaign results
  useEffect(() => {
    if (user) {
      loadCampaignResults();
    }
  }, [user]);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [campaigns, filters, sortConfig]);

  const loadCampaignResults = async () => {
    try {
      setLoading(true);
      setError('');

      // Load all campaigns (not just active ones)
      const campaignsData = await attackService?.getAttackCampaigns();
      setCampaigns(campaignsData);
    } catch (err) {
      setError(`Failed to load attack results: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...campaigns];

    // Apply status filter
    if (filters?.status !== 'all') {
      filtered = filtered?.filter(campaign => campaign?.status === filters?.status);
    }

    // Apply attack type filter
    if (filters?.attack_type !== 'all') {
      filtered = filtered?.filter(campaign => campaign?.attack_type === filters?.attack_type);
    }

    // Apply target type filter
    if (filters?.target_type !== 'all') {
      filtered = filtered?.filter(campaign => campaign?.target_type === filters?.target_type);
    }

    // Apply date range filter
    if (filters?.date_range !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (filters?.date_range) {
        case '24_hours':
          cutoffDate?.setHours(cutoffDate?.getHours() - 24);
          break;
        case '7_days':
          cutoffDate?.setDate(cutoffDate?.getDate() - 7);
          break;
        case '30_days':
          cutoffDate?.setDate(cutoffDate?.getDate() - 30);
          break;
        case '90_days':
          cutoffDate?.setDate(cutoffDate?.getDate() - 90);
          break;
      }

      filtered = filtered?.filter(campaign => 
        new Date(campaign?.created_at) >= cutoffDate
      );
    }

    // Apply search filter
    if (filters?.search?.trim()) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(campaign =>
        campaign?.name?.toLowerCase()?.includes(searchTerm) ||
        campaign?.target_host?.toLowerCase()?.includes(searchTerm) ||
        campaign?.creator?.full_name?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Apply sorting
    if (sortConfig?.key) {
      filtered?.sort((a, b) => {
        let aValue = a?.[sortConfig?.key];
        let bValue = b?.[sortConfig?.key];

        // Handle nested properties
        if (sortConfig?.key === 'creator_name') {
          aValue = a?.creator?.full_name || '';
          bValue = b?.creator?.full_name || '';
        }

        // Handle dates
        if (sortConfig?.key === 'created_at' || sortConfig?.key === 'started_at' || sortConfig?.key === 'completed_at') {
          aValue = aValue ? new Date(aValue) : new Date(0);
          bValue = bValue ? new Date(bValue) : new Date(0);
        }

        // Handle strings
        if (typeof aValue === 'string') {
          aValue = aValue?.toLowerCase();
          bValue = (bValue || '')?.toLowerCase();
        }

        // Handle numbers
        if (typeof aValue === 'number') {
          return sortConfig?.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Handle dates and strings
        if (aValue < bValue) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredCampaigns(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewDetails = async (campaignId) => {
    try {
      const campaign = await attackService?.getAttackCampaign(campaignId);
      setSelectedCampaign(campaign);
      setShowDetailModal(true);
    } catch (err) {
      setError(`Failed to load campaign details: ${err?.message}`);
    }
  };

  const handleCampaignSelect = (campaignId, isSelected) => {
    if (isSelected) {
      setSelectedCampaigns(prev => [...prev, campaignId]);
    } else {
      setSelectedCampaigns(prev => prev?.filter(id => id !== campaignId));
    }
  };

  const handleCompare = () => {
    if (selectedCampaigns?.length >= 2) {
      setShowComparisonModal(true);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this attack campaign? This action cannot be undone.')) {
      return;
    }

    try {
      await attackService?.deleteAttackCampaign(campaignId);
      
      // Create activity log
      await activityService?.createSystemActivity(
        'config_updated',
        `Attack campaign deleted by ${userProfile?.full_name || user?.email}`
      );

      // Refresh data
      loadCampaignResults();

      // Clear selection if deleted campaign was selected
      setSelectedCampaigns(prev => prev?.filter(id => id !== campaignId));
    } catch (err) {
      setError(`Failed to delete campaign: ${err?.message}`);
    }
  };

  const handleExportResults = () => {
    try {
      const dataToExport = selectedCampaigns?.length > 0
        ? campaigns?.filter(c => selectedCampaigns?.includes(c?.id))
        : filteredCampaigns;

      const csvData = convertToCSV(dataToExport);
      downloadCSV(csvData, 'attack-results.csv');
    } catch (err) {
      setError(`Failed to export results: ${err?.message}`);
    }
  };

  const convertToCSV = (data) => {
    if (!data?.length) return '';

    const headers = [
      'Name',
      'Target Host',
      'Attack Type',
      'Status',
      'Progress',
      'Duration (minutes)',
      'Total Requests',
      'Success Rate (%)',
      'Creator',
      'Created At',
      'Started At',
      'Completed At'
    ];

    const rows = data?.map(campaign => [
      campaign?.name || '',
      campaign?.target_host || '',
      campaign?.attack_type || '',
      campaign?.status || '',
      campaign?.progress || 0,
      Math.round((campaign?.duration_seconds || 0) / 60),
      campaign?.total_requests || 0,
      campaign?.total_requests > 0 
        ? Math.round(((campaign?.successful_requests || 0) / campaign?.total_requests) * 100) 
        : 0,
      campaign?.creator?.full_name || '',
      new Date(campaign?.created_at)?.toLocaleString(),
      campaign?.started_at ? new Date(campaign?.started_at)?.toLocaleString() : '',
      campaign?.completed_at ? new Date(campaign?.completed_at)?.toLocaleString() : ''
    ]);

    return [headers, ...rows]?.map(row => row?.map(cell => `"${cell}"`)?.join(','))?.join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link?.setAttribute('href', url);
    link?.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
  };

  const getSummaryStats = () => {
    const total = filteredCampaigns?.length || 0;
    const completed = filteredCampaigns?.filter(c => c?.status === 'completed')?.length || 0;
    const failed = filteredCampaigns?.filter(c => c?.status === 'failed')?.length || 0;
    const running = filteredCampaigns?.filter(c => c?.status === 'running')?.length || 0;

    const totalRequests = filteredCampaigns?.reduce((sum, c) => sum + (c?.total_requests || 0), 0);
    const successfulRequests = filteredCampaigns?.reduce((sum, c) => sum + (c?.successful_requests || 0), 0);
    const avgSuccessRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0;

    return {
      total,
      completed,
      failed,
      running,
      totalRequests,
      avgSuccessRate
    };
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
                Please sign in to view attack results
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
                onClick={loadCampaignResults}
              >
                Retry
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const summaryStats = getSummaryStats();

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
                Attack Results
              </h1>
              <p className="text-muted-foreground">
                Analyze and compare network stress testing results
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              {selectedCampaigns?.length >= 2 && (
                <Button
                  variant="outline"
                  iconName="GitCompare"
                  iconPosition="left"
                  onClick={handleCompare}
                >
                  Compare ({selectedCampaigns?.length})
                </Button>
              )}
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                onClick={handleExportResults}
              >
                Export Results
              </Button>
              <Button
                variant="primary"
                iconName="Plus"
                iconPosition="left"
                onClick={() => navigate('/attack-configuration')}
              >
                New Attack
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div>Loading attack results...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="xl:col-span-1">
                <ResultsSidebar
                  stats={summaryStats}
                  campaigns={campaigns}
                  trendingData={[]}
                  savedFilters={[]}
                  onQuickFilter={() => {}}
                  onExportSelected={handleExportResults}
                  selectedCount={selectedCampaigns.length}
                  onCompareSelected={handleCompare}
                />
              </div>

              {/* Main Content */}
              <div className="xl:col-span-3 space-y-6">
                {/* Filters */}
                <ResultsFilters
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                  savedFilters={[]}
                  onSaveFilter={() => {}}
                  onLoadFilter={() => {}}
                />

                {/* Results Table */}
                <ResultsTable
                  campaigns={filteredCampaigns}
                  selectedCampaigns={selectedCampaigns}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onViewDetails={handleViewDetails}
                  onCampaignSelect={handleCampaignSelect}
                  onDeleteCampaign={handleDeleteCampaign}
                  results={filteredCampaigns}
                  onResultClick={handleViewDetails}
                  onBulkSelect={handleCampaignSelect}
                  selectedResults={selectedCampaigns}
                />
              </div>
            </div>
          )}

          {/* Modals */}
          {showDetailModal && selectedCampaign && (
            <ResultDetailModal
              campaign={selectedCampaign}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedCampaign(null);
              }}
            />
          )}

          {showComparisonModal && (
            <ComparisonModal
              campaignIds={selectedCampaigns}
              campaigns={campaigns}
              onClose={() => setShowComparisonModal(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AttackResults;