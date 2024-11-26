import { create } from 'zustand'
import { supabase } from '../api/supabase'

export type ServerStatus = 'active' | 'inactive'
export interface Server {
  id: string
  status: ServerStatus
  created_at: string
}

interface ServerState {
  servers: Server[]
  isLoading: boolean
  error: Error | null
}

interface ServerActions {
  fetchServers: () => Promise<void>
  updateServerStatus: (id: string, status: ServerStatus) => Promise<void>
  clearError: () => void
  subscribeToServers: () => () => void
}

type ServerStore = ServerState & ServerActions

const fetchServersFromDB = async () => {
  const { data, error } = await supabase
    .from('servers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Server[]
}

export const useServerStore = create<ServerStore>((set, get) => ({
  servers: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchServers: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await fetchServersFromDB()
      set({ servers: data, isLoading: false })
    } catch (error) {
      console.error('Error fetching servers:', error)
      set({ error: error as Error, isLoading: false })
    }
  },

  updateServerStatus: async (id: string, status: ServerStatus) => {
    const previousServers = get().servers
    
    set({
      servers: previousServers.map(server =>
        server.id === id ? { ...server, status } : server
      )
    })

    try {
      const { error } = await supabase
        .from('servers')
        .update({ status })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      set({ 
        servers: previousServers,
        error: error as Error 
      })
    }
  },

  subscribeToServers: () => {
    const subscription = supabase
      .channel('servers-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'servers'
        },
        async () => {
          const data = await fetchServersFromDB()
          set({ servers: data })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }
}))

// Selector hooks for better performance
export const useServers = () => useServerStore(state => state.servers)
export const useServerLoading = () => useServerStore(state => state.isLoading)
export const useServerError = () => useServerStore(state => state.error)