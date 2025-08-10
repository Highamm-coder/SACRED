import { supabase, handleSupabaseError } from '../supabaseClient';

export const Question = {
  // Get all questions ordered by their sequence
  async list() {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    handleSupabaseError(error);
    // Normalize field names for consistency with Assessment component
    return (data || []).map(q => ({
      ...q,
      questionId: q.question_id, // Add questionId alias
      order: q.order_index || q.order // Ensure order field exists
    }));
  },

  // Get question by ID
  async get(id) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Get question by question_id (string identifier)
  async getByQuestionId(questionId) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('question_id', questionId)
      .single();
    
    handleSupabaseError(error);
    // Normalize field names for consistency
    if (data) {
      return {
        ...data,
        questionId: data.question_id, // Add questionId alias
        order: data.order_index || data.order // Ensure order field exists
      };
    }
    return data;
  },

  // Get questions by section
  async getBySection(section) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('section', section)
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    handleSupabaseError(error);
    // Normalize field names for consistency
    return (data || []).map(q => ({
      ...q,
      questionId: q.question_id, // Add questionId alias
      order: q.order_index || q.order // Ensure order field exists
    }));
  },

  // Create new question (admin function)
  async create(questionData) {
    const { data, error } = await supabase
      .from('questions')
      .insert(questionData)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Update question (admin function)
  async update(id, updates) {
    const { data, error } = await supabase
      .from('questions')
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

  // Delete question (admin function)
  async delete(id) {
    const { data, error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Get total questions count
  async count() {
    const { count, error } = await supabase
      .from('questions')
      .select('*', { count: 'exact' });
    
    handleSupabaseError(error);
    return count || 0;
  }
};