import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import AttackTypeSelector from './components/AttackTypeSelector';
import TargetConfiguration from './components/TargetConfiguration';
import AdvancedParameters from './components/AdvancedParameters';
import ConfigurationPreview from './components/ConfigurationPreview';
import ActionButtons from './components/ActionButtons';

import { useAuth } from '../../contexts/AuthContext';
import { attackService } from '../../services/attackService';
import { nodeService } from '../../services/nodeService';
import { activityService } from '../../services/activityService';
import Button from '../../components/ui/Button';


const AttackConfiguration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const templateId = searchParams?.get('template');
  
  const [configuration, setConfiguration] = useState({
    name: '',
    description: '',
    target_host: '',
    target_type: 'web_server',
    attack_type: 'get_flooding',
    template_id: null,
    parameters: {},
    assigned_nodes: []
  });
  
  const [templates, setTemplates] = useState([]);
  const [availableNodes, setAvailableNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, templateId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      const [templatesData, nodesData] = await Promise.all([
        attackService?.getAttackTemplates(),
        nodeService?.getAvailableNodes()
      ]);

      setTemplates(templatesData);
      setAvailableNodes(nodesData);

      // If template ID is provided, load template and pre-fill configuration
      if (templateId) {
        const template = templatesData?.find(t => t?.id === templateId);
        if (template) {
          setConfiguration(prev => ({
            ...prev,
            name: template?.name || '',
            attack_type: template?.attack_type || 'get_flooding',
            target_type: template?.target_type || 'web_server',
            template_id: template?.id,
            parameters: template?.default_parameters || {}
          }));
        }
      }
    } catch (err) {
      setError(`Failed to load configuration data: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigurationChange = (field, value) => {
    setConfiguration(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors?.[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateConfiguration = () => {
    const errors = {};

    if (!configuration?.name?.trim()) {
      errors.name = 'Attack name is required';
    }

    if (!configuration?.target_host?.trim()) {
      errors.target_host = 'Target host is required';
    }

    if (!configuration?.assigned_nodes?.length) {
      errors.assigned_nodes = 'At least one attack node must be selected';
    }

    // Validate target host format based on type
    if (configuration?.target_host) {
      const host = configuration?.target_host?.trim();
      
      if (configuration?.target_type === 'web_server' || configuration?.target_type === 'api') {
        // Should be URL or domain
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        const domainPattern = /^([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,}$/;
        
        if (!urlPattern?.test(host) && !domainPattern?.test(host)) {
          errors.target_host = 'Please enter a valid URL or domain name';
        }
      } else if (configuration?.target_type === 'network_device') {
        // Should be IP address
        const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        
        if (!ipPattern?.test(host)) {
          errors.target_host = 'Please enter a valid IP address';
        }
      }
    }

    // Validate attack-specific parameters
    const params = configuration?.parameters || {};
    
    if (configuration?.attack_type === 'get_flooding' || configuration?.attack_type === 'post_flooding') {
      if (params?.requests_per_second && (params?.requests_per_second < 1 || params?.requests_per_second > 10000)) {
        errors.parameters = 'Requests per second must be between 1 and 10,000';
      }
    }

    if (configuration?.attack_type === 'slowloris') {
      if (params?.connections && (params?.connections < 1 || params?.connections > 1000)) {
        errors.parameters = 'Connections must be between 1 and 1,000';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleLaunchAttack = async () => {
    if (!validateConfiguration()) {
      setError('Please fix the validation errors before launching the attack');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const campaignData = {
        ...configuration,
        created_by: user?.id,
        status: 'queued'
      };

      const newCampaign = await attackService?.createAttackCampaign(campaignData);

      // Create activity log
      await activityService?.createAttackActivity(
        'attack_started',
        `New attack campaign "${configuration?.name}" created and queued`,
        newCampaign?.id,
        user?.id
      );

      // Navigate to monitoring page
      navigate(`/attack-monitoring?id=${newCampaign?.id}`);
    } catch (err) {
      setError(`Failed to launch attack: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!configuration?.name?.trim()) {
      setError('Please enter an attack name before saving as template');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const templateData = {
        name: `${configuration?.name} Template`,
        description: configuration?.description || `Template based on ${configuration?.name}`,
        attack_type: configuration?.attack_type,
        target_type: configuration?.target_type,
        category: getAttackCategoryFromType(configuration?.attack_type),
        difficulty: 'medium',
        estimated_duration_min: 10,
        estimated_duration_max: 30,
        default_parameters: configuration?.parameters,
        created_by: user?.id
      };

      await attackService?.createAttackTemplate(templateData);
      
      // Reload templates
      const updatedTemplates = await attackService?.getAttackTemplates();
      setTemplates(updatedTemplates);

      setError(''); // Clear any previous errors
      // You might want to show a success message here
      
    } catch (err) {
      setError(`Failed to save template: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getAttackCategoryFromType = (type) => {
    switch (type) {
      case 'get_flooding': case 'post_flooding':
        return 'HTTP Stress';
      case 'slowloris':
        return 'Connection Attack';
      case 'icmp_flooding':
        return 'Network Layer';
      case 'syn_flood':
        return 'Transport Layer';
      default:
        return 'Other';
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
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
                Please sign in to configure attacks
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />

          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Attack Configuration
            </h1>
            <p className="text-muted-foreground">
              Configure and launch network stress testing attacks
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 font-medium">Error</div>
              <div className="text-red-700 mt-1">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="xl:col-span-2 space-y-6">
              <AttackTypeSelector
                selectedType={configuration?.attack_type}
                templates={templates}
                onTypeChange={(type) => handleConfigurationChange('attack_type', type)}
                onTemplateSelect={(template) => {
                  setConfiguration(prev => ({
                    ...prev,
                    name: template?.name || '',
                    attack_type: template?.attack_type || 'get_flooding',
                    target_type: template?.target_type || 'web_server',
                    template_id: template?.id,
                    parameters: template?.default_parameters || {}
                  }));
                }}
                validationError={validationErrors?.attack_type}
              />

              <TargetConfiguration
                targetConfig={{
                  name: configuration.name,
                  description: configuration.description,
                  target_host: configuration.target_host,
                  target_type: configuration.target_type
                }}
                onTargetChange={(field, value) => handleConfigurationChange(field, value)}
                onValidateTarget={() => validateConfiguration()}
                validationStatus={Object.keys(validationErrors).length === 0 ? 'valid' : 'invalid'}
                errors={validationErrors}
                availableNodes={availableNodes}
                configuration={configuration}
                onConfigurationChange={handleConfigurationChange}
                validationErrors={validationErrors}
              />

              <AdvancedParameters
                attackType={configuration?.attack_type}
                parameters={configuration?.parameters}
                onParametersChange={(params) => handleConfigurationChange('parameters', params)}
                validationError={validationErrors?.parameters}
              />
            </div>

            {/* Preview and Actions Panel */}
            <div className="space-y-6">
              <ConfigurationPreview
                selectedType={configuration.attack_type}
                targetConfig={{
                  name: configuration.name,
                  description: configuration.description,
                  target_host: configuration.target_host,
                  target_type: configuration.target_type
                }}
                parameters={configuration.parameters}
                resourceEstimate={{
                  nodes: configuration.assigned_nodes?.length || 0,
                  duration: '10-30 minutes',
                  intensity: 'Medium'
                }}
                configuration={configuration}
                availableNodes={availableNodes}
              />

              <ActionButtons
                onLaunch={handleLaunchAttack}
                onSaveTemplate={handleSaveTemplate}
                onCancel={handleCancel}
                loading={loading}
                canLaunch={!loading && configuration?.name && configuration?.target_host && configuration?.assigned_nodes?.length > 0}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttackConfiguration;