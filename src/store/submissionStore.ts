import { create } from 'zustand'
import { supabase, ServerSubmission } from '../api/supabase'

interface SubmissionStore {
  submissions: ServerSubmission[]
  isLoading: boolean
  error: string | null
  fetchSubmissions: () => Promise<void>
  updateSubmission: (id: string, updates: Partial<ServerSubmission>) => Promise<void>  // Changed id to string
}

export const useSubmissionStore = create<SubmissionStore>((set, get) => ({
  submissions: [],
  isLoading: false,
  error: null,

  fetchSubmissions: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('server_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ submissions: data || [], isLoading: false })
    } catch (error) {
      console.error('Error fetching submissions:', error)
      set({ error: `Failed to fetch submissions: ${(error as Error).message}`, isLoading: false })
    }
  },

  updateSubmission: async (id: string, updates: Partial<ServerSubmission>) => {  
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase  
        .from('server_submissions')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      const currentSubmissions = get().submissions
      const updatedSubmissions = currentSubmissions.map(submission =>
        submission.id === id ? { ...submission, ...updates } : submission
      )

      set({ 
        submissions: updatedSubmissions, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Error updating submission:', error)
      set({ 
        error: `Failed to update submission: ${(error as Error).message}`, 
        isLoading: false 
      })
      throw error
    }
  },
}))