import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
};

export type ServerSubmission = {
  id: string
  created_at: string
  server_type: 'Vanilla' | 'Modded'
  description: string
  name: string
  server_ip: string
  website?: string
  discord?: string
  content_warning: 'Yes' | 'No'
  rating: string
  notes: string
  rank: 'Unranked' | 'Ranked'
  reviewed_at?: string
  uid: string

}

export type Server = {
  id: string
  name: string
  ip_address: string
  status: 'active' | 'inactive'
  created_at: string
}
