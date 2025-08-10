import { supabase, handleSupabaseError } from '../supabaseClient';

export const OpenEndedQuestion = {
  // Get all open-ended questions ordered by sequence
  async list() {
    const { data, error } = await supabase
      .from('open_ended_questions')
      .select('*')
      .order('order', { ascending: true });
    
    handleSupabaseError(error);
    return data || [];
  },

  // Get question by ID
  async get(id) {
    const { data, error } = await supabase
      .from('open_ended_questions')
      .select('*')
      .eq('id', id)
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Get question by question_id
  async getByQuestionId(questionId) {
    const { data, error } = await supabase
      .from('open_ended_questions')
      .select('*')
      .eq('question_id', questionId)
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Create new open-ended question
  async create(questionData) {
    const { data, error } = await supabase
      .from('open_ended_questions')
      .insert(questionData)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Update question
  async update(id, updates) {
    const { data, error } = await supabase
      .from('open_ended_questions')
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

  // Delete question
  async delete(id) {
    const { data, error } = await supabase
      .from('open_ended_questions')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }
};

export const OpenEndedAnswer = {
  // Create a new open-ended answer
  async create(answerData) {
    const { data, error } = await supabase
      .from('open_ended_answers')
      .insert(answerData)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Get answer by ID
  async get(id) {
    const { data, error } = await supabase
      .from('open_ended_answers')
      .select('*')
      .eq('id', id)
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Update answer
  async update(id, updates) {
    const { data, error } = await supabase
      .from('open_ended_answers')
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
    let query = supabase.from('open_ended_answers').select('*');
    
    Object.keys(criteria).forEach(key => {
      if (key === 'assessmentId') {
        query = query.eq('assessment_id', criteria[key]);
      } else if (key === 'userEmail') {
        query = query.eq('user_email', criteria[key]);
      } else {
        query = query.eq(key, criteria[key]);
      }
    });
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data || [];
  },

  // Get answers for assessment
  async getByAssessment(assessmentId) {
    const { data, error } = await supabase
      .from('open_ended_answers')
      .select('*')
      .eq('assessment_id', assessmentId);
    
    handleSupabaseError(error);
    return data || [];
  },

  // Get user's answers for assessment
  async getUserAnswers(assessmentId, userEmail) {
    const { data, error } = await supabase
      .from('open_ended_answers')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('user_email', userEmail);
    
    handleSupabaseError(error);
    return data || [];
  },

  // Get partner's answers that are visible
  async getPartnerAnswers(assessmentId, partnerEmail) {
    const { data, error } = await supabase
      .from('open_ended_answers')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('user_email', partnerEmail)
      .eq('is_visible_to_partner', true);
    
    handleSupabaseError(error);
    return data || [];
  },

  // Delete answer
  async delete(id) {
    const { data, error } = await supabase
      .from('open_ended_answers')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  // Toggle visibility to partner
  async toggleVisibility(id) {
    // First get current visibility status
    const current = await this.get(id);
    
    const { data, error } = await supabase
      .from('open_ended_answers')
      .update({
        is_visible_to_partner: !current.is_visible_to_partner,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }
};