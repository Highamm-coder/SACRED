import { supabase, handleSupabaseError } from '../supabaseClient';

export const Answer = {
  // Create a new answer
  async create(answerData) {
    const { data, error } = await supabase
      .from('answers')
      .insert(answerData)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Get answer by ID
  async get(id) {
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('id', id)
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Update answer
  async update(id, updates) {
    const { data, error } = await supabase
      .from('answers')
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

  // Filter answers by criteria
  async filter(criteria) {
    let query = supabase.from('answers').select('*');
    
    // Apply filters
    Object.keys(criteria).forEach(key => {
      if (key === 'assessmentId') {
        query = query.eq('assessment_id', criteria[key]);
      } else if (key === 'userEmail') {
        query = query.eq('user_email', criteria[key]);
      } else if (key === 'questionId') {
        query = query.eq('question_id', criteria[key]);
      } else {
        query = query.eq(key, criteria[key]);
      }
    });
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data || [];
  },

  // Get all answers for an assessment
  async getByAssessment(assessmentId) {
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('assessment_id', assessmentId);
    
    handleSupabaseError(error);
    return data || [];
  },

  // Get answers by user and assessment
  async getUserAnswers(assessmentId, userEmail) {
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('user_email', userEmail);
    
    handleSupabaseError(error);
    return data || [];
  },

  // Delete answer
  async delete(id) {
    const { data, error } = await supabase
      .from('answers')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Bulk create or update answers
  async upsertAnswers(answers) {
    const { data, error } = await supabase
      .from('answers')
      .upsert(answers, { 
        onConflict: 'assessment_id,question_id,user_email',
        returning: 'representation' 
      })
      .select();
    
    handleSupabaseError(error);
    return data || [];
  },

  // Get answer count for assessment by user
  async getAnswerCount(assessmentId, userEmail) {
    const { count, error } = await supabase
      .from('answers')
      .select('*', { count: 'exact' })
      .eq('assessment_id', assessmentId)
      .eq('user_email', userEmail);
    
    handleSupabaseError(error);
    return count || 0;
  },

  // Check if user has answered specific question
  async hasAnswered(assessmentId, questionId, userEmail) {
    const { data, error } = await supabase
      .from('answers')
      .select('id')
      .eq('assessment_id', assessmentId)
      .eq('question_id', questionId)
      .eq('user_email', userEmail)
      .limit(1);
    
    handleSupabaseError(error);
    return data && data.length > 0;
  }
};