import { supabase } from '../lib/supabase';

export const activityService = {
  async getActivities(limit = 50, offset = 0) {
    const { data, error } = await supabase?.from('activity_logs')?.select(`
        *,
        user:user_profiles(full_name, email),
        campaign:attack_campaigns(name),
        node:attack_nodes(name)
      `)?.order('created_at', { ascending: false })?.range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  },

  async getActivitiesByType(type, limit = 20) {
    const { data, error } = await supabase?.from('activity_logs')?.select(`
        *,
        user:user_profiles(full_name, email),
        campaign:attack_campaigns(name),
        node:attack_nodes(name)
      `)?.eq('type', type)?.order('created_at', { ascending: false })?.limit(limit)

    if (error) throw error
    return data || []
  },

  async getActivitiesForUser(userId, limit = 30) {
    const { data, error } = await supabase?.from('activity_logs')?.select(`
        *,
        campaign:attack_campaigns(name),
        node:attack_nodes(name)
      `)?.eq('user_id', userId)?.order('created_at', { ascending: false })?.limit(limit)

    if (error) throw error
    return data || []
  },

  async getActivitiesForCampaign(campaignId, limit = 20) {
    const { data, error } = await supabase?.from('activity_logs')?.select(`
        *,
        user:user_profiles(full_name, email)
      `)?.eq('campaign_id', campaignId)?.order('created_at', { ascending: false })?.limit(limit)

    if (error) throw error
    return data || []
  },

  async createActivity(activityData) {
    const { data, error } = await supabase?.from('activity_logs')?.insert(activityData)?.select()?.single()

    if (error) throw error
    return data
  },

  async createAttackActivity(type, message, campaignId, userId, metadata = {}) {
    return await this.createActivity({
      type,
      message,
      campaign_id: campaignId,
      user_id: userId,
      metadata
    })
  },

  async createNodeActivity(type, message, nodeId, userId = null, metadata = {}) {
    return await this.createActivity({
      type,
      message,
      node_id: nodeId,
      user_id: userId,
      metadata
    })
  },

  async createSystemActivity(type, message, metadata = {}) {
    return await this.createActivity({
      type,
      message,
      metadata
    })
  },

  // Real-time subscriptions
  subscribeToActivities(callback) {
    const channel = supabase?.channel('activity-logs')?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        callback
      )?.subscribe()

    return channel
  }
}