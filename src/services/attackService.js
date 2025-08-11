import { supabase } from '../lib/supabase';

export const attackService = {
  // Attack Campaigns
  async getAttackCampaigns(filters = {}) {
    let query = supabase?.from('attack_campaigns')?.select(`
        *,
        template:attack_templates(name, attack_type),
        creator:user_profiles!attack_campaigns_created_by_fkey(full_name, email)
      `)

    // Apply filters
    Object.entries(filters)?.forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query = query?.eq(key, value)
      }
    })

    const { data, error } = await query?.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getAttackCampaign(id) {
    const { data, error } = await supabase?.from('attack_campaigns')?.select(`
        *,
        template:attack_templates(*),
        creator:user_profiles!attack_campaigns_created_by_fkey(full_name, email, role),
        metrics:attack_metrics(*)
      `)?.eq('id', id)?.single()

    if (error) throw error
    return data
  },

  async createAttackCampaign(campaignData) {
    const { data, error } = await supabase?.from('attack_campaigns')?.insert(campaignData)?.select()?.single()

    if (error) throw error
    return data
  },

  async updateAttackCampaign(id, updates) {
    const { data, error } = await supabase?.from('attack_campaigns')?.update(updates)?.eq('id', id)?.select()?.single()

    if (error) throw error
    return data
  },

  async deleteAttackCampaign(id) {
    const { error } = await supabase?.from('attack_campaigns')?.delete()?.eq('id', id)

    if (error) throw error
  },

  async startAttack(id) {
    const { data, error } = await supabase?.from('attack_campaigns')?.update({ 
        status: 'running', 
        started_at: new Date()?.toISOString() 
      })?.eq('id', id)?.select()?.single()

    if (error) throw error
    return data
  },

  async pauseAttack(id) {
    const { data, error } = await supabase?.from('attack_campaigns')?.update({ status: 'paused' })?.eq('id', id)?.select()?.single()

    if (error) throw error
    return data
  },

  async stopAttack(id) {
    const { data, error } = await supabase?.from('attack_campaigns')?.update({ 
        status: 'stopped',
        completed_at: new Date()?.toISOString()
      })?.eq('id', id)?.select()?.single()

    if (error) throw error
    return data
  },

  // Attack Templates
  async getAttackTemplates() {
    const { data, error } = await supabase?.from('attack_templates')?.select('*')?.eq('is_active', true)?.order('name')

    if (error) throw error
    return data || []
  },

  async getAttackTemplate(id) {
    const { data, error } = await supabase?.from('attack_templates')?.select('*')?.eq('id', id)?.single()

    if (error) throw error
    return data
  },

  async createAttackTemplate(templateData) {
    const { data, error } = await supabase?.from('attack_templates')?.insert(templateData)?.select()?.single()

    if (error) throw error
    return data
  },

  // Attack Metrics
  async getAttackMetrics(campaignId, timeRange = '1 hour') {
    let timeFilter = new Date()
    
    switch(timeRange) {
      case '15 minutes':
        timeFilter?.setMinutes(timeFilter?.getMinutes() - 15)
        break
      case '1 hour':
        timeFilter?.setHours(timeFilter?.getHours() - 1)
        break
      case '24 hours':
        timeFilter?.setHours(timeFilter?.getHours() - 24)
        break
      default:
        timeFilter?.setHours(timeFilter?.getHours() - 1)
    }

    const { data, error } = await supabase?.from('attack_metrics')?.select('*')?.eq('campaign_id', campaignId)?.gte('timestamp', timeFilter?.toISOString())?.order('timestamp')

    if (error) throw error
    return data || []
  },

  async addAttackMetrics(metricsData) {
    const { data, error } = await supabase?.from('attack_metrics')?.insert(metricsData)?.select()

    if (error) throw error
    return data
  },

  // Real-time subscriptions
  subscribeToAttackUpdates(campaignId, callback) {
    const channel = supabase?.channel(`attack-${campaignId}`)?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attack_campaigns',
          filter: `id=eq.${campaignId}`
        },
        callback
      )?.subscribe()

    return channel
  },

  subscribeToMetricsUpdates(campaignId, callback) {
    const channel = supabase?.channel(`metrics-${campaignId}`)?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attack_metrics',
          filter: `campaign_id=eq.${campaignId}`
        },
        callback
      )?.subscribe()

    return channel
  }
}