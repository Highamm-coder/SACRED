import { supabase, handleSupabaseError } from '../supabaseClient';

export const CoupleAssessment = {
  // Create a new couple assessment
  async create(assessmentData) {
    console.log('🗃️ CoupleAssessment.create() called with:', assessmentData);
    
    const { data, error } = await supabase
      .from('couple_assessments')
      .insert(assessmentData)
      .select()
      .single();
    
    console.log('🗃️ Supabase response:', { data, error });
    
    handleSupabaseError(error);
    console.log('🗃️ Returning assessment data:', data);
    return data;
  },

  // Get assessment by ID
  async get(id) {
    const { data, error } = await supabase
      .from('couple_assessments')
      .select('*')
      .eq('id', id)
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Update assessment
  async update(id, updates) {
    const { data, error } = await supabase
      .from('couple_assessments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Filter assessments by criteria
  async filter(criteria) {
    let query = supabase.from('couple_assessments').select('*');
    
    // Apply filters
    Object.keys(criteria).forEach(key => {
      query = query.eq(key, criteria[key]);
    });
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data || [];
  },

  // List all assessments (with RLS this will only return user's assessments)
  async list() {
    const { data, error } = await supabase
      .from('couple_assessments')
      .select('*')
      .order('created_date', { ascending: false });
    
    handleSupabaseError(error);
    return data || [];
  },

  // Delete assessment
  async delete(id) {
    const { data, error } = await supabase
      .from('couple_assessments')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Get assessment progress for a user
  async getProgress(assessmentId, userEmail) {
    const { data, error } = await supabase
      .from('answers')
      .select('question_id')
      .eq('assessment_id', assessmentId)
      .eq('user_email', userEmail);
    
    handleSupabaseError(error);
    
    // Get total questions count
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('*', { count: 'exact' });
    
    const answeredQuestions = data?.length || 0;
    const progress = totalQuestions ? (answeredQuestions / totalQuestions) * 100 : 0;
    
    return {
      total: totalQuestions || 0,
      answered: answeredQuestions,
      progress
    };
  }
};