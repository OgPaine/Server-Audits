import { create } from 'zustand'
import { supabase, ServerSubmission } from '../api/supabase' 

interface ServerStore {
  servers: ServerSubmission[] 
  isLoading: boolean
  error: string | null
  fetchServers: () => Promise<void>
  updateServerStatus: (id: string, status: 'active' | 'inactive') => Promise<void>
}

export const useServerStore = create<ServerStore>((set) => ({
  servers: [],
  isLoading: false,
  error: null,

  fetchServers: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('servers') 
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ servers: data || [], isLoading: false })
    } catch (error) {
      console.error('Error fetching servers:', error)
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateServerStatus: async (id: string, status: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('servers') 
        .update({ status })
        .eq('id', id)

      if (error) throw error

      
      const { data, error: fetchError } = await supabase
        .from('servers') 
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      set({ servers: data || [] })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },
}))
