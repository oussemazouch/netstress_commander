import { supabase } from '../lib/supabase';

export const nodeService = {
  async getAttackNodes() {
    const { data, error } = await supabase?.from('attack_nodes')?.select('*')?.order('name')

    if (error) throw error
    return data || []
  },

  async getAttackNode(id) {
    const { data, error } = await supabase?.from('attack_nodes')?.select('*')?.eq('id', id)?.single()

    if (error) throw error
    return data
  },

  async createAttackNode(nodeData) {
    const { data, error } = await supabase?.from('attack_nodes')?.insert(nodeData)?.select()?.single()

    if (error) throw error
    return data
  },

  async updateAttackNode(id, updates) {
    const { data, error } = await supabase?.from('attack_nodes')?.update(updates)?.eq('id', id)?.select()?.single()

    if (error) throw error
    return data
  },

  async deleteAttackNode(id) {
    const { error } = await supabase?.from('attack_nodes')?.delete()?.eq('id', id)

    if (error) throw error
  },

  async updateNodeHeartbeat(id) {
    const { data, error } = await supabase?.from('attack_nodes')?.update({ 
        last_heartbeat: new Date()?.toISOString(),
        status: 'online'
      })?.eq('id', id)?.select()?.single()

    if (error) throw error
    return data
  },

  async updateNodeStatus(id, status, cpuUsage = null, memoryUsage = null, activeAttacks = null) {
    const updates = { status }
    
    if (cpuUsage !== null) updates.cpu_usage = cpuUsage
    if (memoryUsage !== null) updates.memory_usage = memoryUsage  
    if (activeAttacks !== null) updates.active_attacks_count = activeAttacks

    const { data, error } = await supabase?.from('attack_nodes')?.update(updates)?.eq('id', id)?.select()?.single()

    if (error) throw error
    return data
  },

  async getNodesByStatus(status) {
    const { data, error } = await supabase?.from('attack_nodes')?.select('*')?.eq('status', status)?.order('name')

    if (error) throw error
    return data || []
  },

  async getAvailableNodes() {
    const { data, error } = await supabase?.from('attack_nodes')?.select('*')?.in('status', ['online', 'busy'])?.lt('active_attacks_count', supabase?.raw('max_concurrent_attacks'))?.order('active_attacks_count')

    if (error) throw error
    return data || []
  },

  // Real-time subscriptions
  subscribeToNodeUpdates(callback) {
    const channel = supabase?.channel('attack-nodes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attack_nodes'
        },
        callback
      )?.subscribe()

    return channel
  }
}