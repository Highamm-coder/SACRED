import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// Helper function to get current user session
export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  handleSupabaseError(error);
  return session?.user || null;
};

// Helper function to get user profile
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  // If profile doesn't exist, return null instead of throwing error
  if (error && error.code === 'PGRST116') {
    console.warn('Profile not found for user:', userId);
    return null;
  }
  
  handleSupabaseError(error);
  return data;
};

// Helper function to create user profile if it doesn't exist
export const ensureUserProfile = async (user) => {
  let profile = await getUserProfile(user.id);
  
  if (!profile) {
    console.log('Creating missing profile for user:', user.id);
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        role: 'user',
        has_paid: false,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create profile:', error);
      handleSupabaseError(error);
    }
    
    profile = data;
  }
  
  return profile;
};