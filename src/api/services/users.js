import { supabase, handleSupabaseError, getCurrentUser, getUserProfile, ensureUserProfile } from '../supabaseClient';
import { getSiteUrl } from '../../utils/index';

export const User = {
  // Get current authenticated user with profile
  async me() {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Ensure profile exists, create if missing
    const profile = await ensureUserProfile(user);
    
    // Combine auth user with profile data for compatibility
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
      has_paid: profile?.has_paid || false,
      onboarding_completed: profile?.onboarding_completed || false,
      role: profile?.role || 'user',
      created_at: user.created_at,
      updated_at: profile?.updated_at || user.updated_at
    };
  },


  // Sign in with email/password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    handleSupabaseError(error);
    return data;
  },

  // Sign up with email/password
  async signUp(email, password, userData = {}) {
    console.log('Attempting signup with:', { email, password: '***', userData });
    
    // Extract emailRedirectTo from userData if provided, otherwise use default
    const { emailRedirectTo, ...userMetadata } = userData;
    const redirectUrl = emailRedirectTo || getSiteUrl();
    
    console.log('SignUp with emailRedirectTo:', redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
        emailRedirectTo: redirectUrl
      }
    });
    
    console.log('Signup response:', { data, error });
    
    if (error) {
      console.error('Signup error details:', error);
      
      // Handle specific Supabase errors with user-friendly messages
      let errorMessage = error.message || 'Failed to create account';
      
      if (error.error_code === 'email_address_invalid') {
        errorMessage = 'Please enter a valid email address with a real domain (not example.com)';
      } else if (error.error_code === 'weak_password') {
        errorMessage = 'Password must be at least 6 characters long';
      } else if (error.error_code === 'user_already_exists') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      }
      
      throw new Error(errorMessage);
    }
    
    // Only create profile if user doesn't need email verification
    // If verification is needed, profile will be created when they log in after verification
    if (data.user && !error && data.session) {
      try {
        await this.createProfile(data.user.id, {
          email: data.user.email,
          full_name: userData.full_name || '',
          role: 'user',
          is_active: true,
          has_paid: false,
          onboarding_completed: false
        });
        console.log('Profile created successfully for new user');
      } catch (profileError) {
        console.error('Failed to create profile:', profileError);
        // Don't throw error here - user creation was successful
      }
    }
    
    // Return success info including whether email confirmation is needed
    return {
      ...data,
      needsVerification: !data.session && data.user && !data.user.email_confirmed_at
    };
  },

  // Create user profile
  async createProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    handleSupabaseError(error);
  },

  // Update user profile
  async update(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Make user admin (admin only)
  async makeAdmin(email) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', email)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Filter users (admin only function, for compatibility with existing Admin page)
  async filter(filters) {
    let query = supabase.from('profiles').select('*');
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data;
  },

  // Get user by email
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      handleSupabaseError(error);
    }
    
    return data;
  },

  // Check if user exists
  async exists(email) {
    const user = await this.findByEmail(email);
    return !!user;
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};