import { supabase } from '../lib/supabase';

export const authService = {
  async signIn(email, password) {
    return await supabase?.auth?.signInWithPassword({
      email,
      password
    });
  },

  async signUp(email, password, userData = {}) {
    return await supabase?.auth?.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
  },

  async signOut() {
    return await supabase?.auth?.signOut();
  },

  async getSession() {
    return await supabase?.auth?.getSession();
  },

  async getUserProfile(userId) {
    const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single()

    if (error) throw error
    return data
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', userId)?.select()?.single()

    if (error) throw error
    return data
  }
}