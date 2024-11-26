import { supabase, ServerSubmission, User } from './supabase'

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(error.message)
  }

  if (data?.user?.email === undefined) {
    throw new Error('User email is undefined')
  }

  return {
    ...data.user,
    email: data.user.email || "",
  }
}

export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}

export const fetchServerSubmissions = async (): Promise<ServerSubmission[]> => {
  const { data, error } = await supabase
    .from('server_submissions')
    .select('*')

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export const createServerSubmission = async (submission: Partial<ServerSubmission>) => {
  const { data, error } = await supabase
    .from('server_submissions')
    .insert([submission])

  if (error) {
    throw new Error(error.message)
  }

  return data
}
