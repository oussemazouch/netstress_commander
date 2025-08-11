import { supabase } from '../lib/supabase';

export const dashboardService = {
  async getDashboardStats() {
    try {
      // Get active attacks count
      const { data: activeAttacks, error: activeError } = await supabase?.from('attack_campaigns')?.select('id')?.in('status', ['running', 'queued'])

      if (activeError) throw activeError

      // Get queued attacks count
      const { data: queuedAttacks, error: queuedError } = await supabase?.from('attack_campaigns')?.select('id')?.eq('status', 'queued')

      if (queuedError) throw queuedError

      // Get connected nodes
      const { data: connectedNodes, error: nodesError } = await supabase?.from('attack_nodes')?.select('id, status')?.in('status', ['online', 'busy'])

      if (nodesError) throw nodesError

      // Get available nodes
      const availableNodes = connectedNodes?.filter(node => node?.status === 'online') || []

      // Get total requests from last 24 hours
      const last24Hours = new Date()
      last24Hours?.setHours(last24Hours?.getHours() - 24)

      const { data: metricsData, error: metricsError } = await supabase?.from('attack_metrics')?.select('requests_per_second')?.gte('timestamp', last24Hours?.toISOString())

      if (metricsError) throw metricsError

      // Calculate total requests
      const totalRequests = metricsData?.reduce((sum, metric) => {
        return sum + (metric?.requests_per_second || 0) * 5 * 60 // Assuming 5-minute intervals
      }, 0) || 0

      return {
        activeAttacks: activeAttacks?.length || 0,
        queuedAttacks: queuedAttacks?.length || 0,
        connectedNodes: connectedNodes?.length || 0,
        availableNodes: availableNodes?.length || 0,
        totalRequests,
        systemHealth: this.calculateSystemHealth(connectedNodes)
      }
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`)
    }
  },

  async getMetricsChartData(timeRange = '24 hours') {
    let timeFilter = new Date()
    
    switch(timeRange) {
      case '1 hour':
        timeFilter?.setHours(timeFilter?.getHours() - 1)
        break
      case '6 hours':
        timeFilter?.setHours(timeFilter?.getHours() - 6)
        break
      case '24 hours':
        timeFilter?.setHours(timeFilter?.getHours() - 24)
        break
      default:
        timeFilter?.setHours(timeFilter?.getHours() - 24)
    }

    const { data, error } = await supabase?.from('attack_metrics')?.select(`
        timestamp,
        requests_per_second,
        response_time_ms,
        success_rate,
        error_count,
        campaign:attack_campaigns!inner(status)
      `)?.gte('timestamp', timeFilter?.toISOString())?.order('timestamp')

    if (error) throw error

    // Group data by time intervals (5-minute buckets)
    const grouped = this.groupMetricsByTimeInterval(data || [], 5)
    return grouped
  },

  async getActiveAttacksOverview() {
    const { data, error } = await supabase?.from('attack_campaigns')?.select(`
        id,
        name,
        target_host,
        target_type,
        attack_type,
        status,
        progress,
        duration_seconds,
        started_at,
        created_at,
        template:attack_templates(name),
        creator:user_profiles!attack_campaigns_created_by_fkey(full_name)
      `)?.in('status', ['running', 'paused', 'queued'])?.order('created_at', { ascending: false })?.limit(10)

    if (error) throw error
    return data || []
  },

  calculateSystemHealth(nodes) {
    if (!nodes || nodes?.length === 0) return 0

    const healthyNodes = nodes?.filter(node => 
      node?.status === 'online' || node?.status === 'busy'
    )
    
    return Math.round((healthyNodes?.length / nodes?.length) * 100 * 10) / 10;
  },

  groupMetricsByTimeInterval(metrics, intervalMinutes) {
    const grouped = {}
    
    metrics?.forEach(metric => {
      const timestamp = new Date(metric?.timestamp)
      // Round down to nearest interval
      const intervalStart = new Date(
        timestamp.getFullYear(),
        timestamp.getMonth(),
        timestamp.getDate(),
        timestamp.getHours(),
        Math.floor(timestamp.getMinutes() / intervalMinutes) * intervalMinutes
      )
      
      const key = intervalStart?.toISOString()
      
      if (!grouped?.[key]) {
        grouped[key] = {
          timestamp: key,
          requests: 0,
          responses: 0,
          errors: 0,
          avgResponseTime: 0,
          successRate: 0,
          count: 0
        }
      }
      
      grouped[key].requests += metric?.requests_per_second || 0
      grouped[key].responses += Math.floor((metric?.requests_per_second || 0) * (metric?.success_rate || 0) / 100)
      grouped[key].errors += metric?.error_count || 0
      grouped[key].avgResponseTime += metric?.response_time_ms || 0
      grouped[key].successRate += metric?.success_rate || 0
      grouped[key].count += 1
    })
    
    // Calculate averages
    return Object.values(grouped)?.map(group => ({
      ...group,
      avgResponseTime: group?.count > 0 ? Math.round(group?.avgResponseTime / group?.count) : 0,
      successRate: group?.count > 0 ? Math.round((group?.successRate / group?.count) * 10) / 10 : 0
    }))?.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
}