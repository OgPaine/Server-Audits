import { supabase, ServerSubmission, User } from './supabase';

// Login user with email and password
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  if (data?.user?.email === undefined) {
    throw new Error('User email is undefined');
  }

  return {
    ...data.user,
    email: data.user.email || "",
  };
};

// Logout the current user
export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

// Fetch all server submissions
export const fetchServerSubmissions = async (): Promise<ServerSubmission[]> => {
  const { data, error } = await supabase.from('server_submissions').select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// Create a new server submission
export const createServerSubmission = async (submission: Partial<ServerSubmission>) => {
  const { data, error } = await supabase.from('server_submissions').insert([submission]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Fetch community ratings for servers
export const fetchCommunityRatings = async (): Promise<Record<string, { total: number; count: number }>> => {
  const { data, error } = await supabase.from('server_ratings').select('server_id, rating');

  if (error) {
    throw new Error(error.message);
  }

  const ratings = data?.reduce((acc: Record<string, { total: number; count: number }>, curr) => {
    const { server_id, rating } = curr;
    if (!acc[server_id]) {
      acc[server_id] = { total: 0, count: 0 };
    }
    acc[server_id].total += rating;
    acc[server_id].count += 1;
    return acc;
  }, {});

  return ratings || {};
};

// Submit a user rating for a server
export const submitServerRating = async (serverId: string, rating: number, userId: string): Promise<void> => {
  const { error } = await supabase.from('server_ratings').insert({
    server_id: serverId,
    rating,
    user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }
};
