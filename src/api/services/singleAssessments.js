import { supabase, handleSupabaseError } from '../supabaseClient';

/**
 * Single Account Assessment Service
 * Replaces the CoupleAssessment service with a simplified single-user model
 * Each user owns their own assessment(s) independently
 */
export const Assessment = {
  /**
   * Create a new assessment for the current user
   */
  async create(assessmentData = {}) {
    console.log('🗃️ Assessment.create() called with:', assessmentData);
    
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user) {
      throw new Error('User must be authenticated to create assessment');
    }

    const defaultData = {
      user_id: user.user.id,
      user_email: user.user.email,
      title: 'Sacred Pre-Marriage Assessment',
      description: 'Personal assessment for marriage readiness and expectations',
      status: 'in_progress',
      progress: 0,
      score: {},
      metadata: {}
    };

    const { data, error } = await supabase
      .from('assessments')
      .insert({ ...defaultData, ...assessmentData })
      .select()
      .single();
    
    console.log('🗃️ Supabase response:', { data, error });
    
    handleSupabaseError(error);
    console.log('🗃️ Returning assessment data:', data);
    return data;
  },

  /**
   * Get assessment by ID (must belong to current user)
   */
  async get(id) {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        assessment_responses (
          id,
          question_id,
          question_text,
          section,
          response_value,
          response_type,
          score,
          metadata,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  /**
   * Update assessment
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('assessments')
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

  /**
   * Get current user's assessments
   */
  async list() {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        assessment_responses (count)
      `)
      .order('created_at', { ascending: false });
    
    handleSupabaseError(error);
    return data || [];
  },

  /**
   * Get user's most recent assessment
   */
  async getCurrent() {
    const assessments = await this.list();
    return assessments.length > 0 ? assessments[0] : null;
  },

  /**
   * Delete assessment and all related responses
   */
  async delete(id) {
    const { data, error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  /**
   * Get assessment progress for current user
   */
  async getProgress(assessmentId) {
    // Get total questions count
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .eq('is_active', true);
    
    // Get answered questions for this assessment
    const { count: answeredQuestions } = await supabase
      .from('assessment_responses')
      .select('*', { count: 'exact' })
      .eq('assessment_id', assessmentId);
    
    const progress = totalQuestions ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    
    return {
      total: totalQuestions || 0,
      answered: answeredQuestions || 0,
      progress
    };
  },

  /**
   * Save or update an assessment response
   */
  async saveResponse(assessmentId, questionId, responseData) {
    const responsePayload = {
      assessment_id: assessmentId,
      question_id: questionId,
      response_value: responseData.value,
      question_text: responseData.questionText,
      section: responseData.section,
      response_type: responseData.type || 'text',
      score: responseData.score,
      metadata: responseData.metadata || {}
    };

    // Try to update existing response first
    const { data: existingResponse } = await supabase
      .from('assessment_responses')
      .select('id')
      .eq('assessment_id', assessmentId)
      .eq('question_id', questionId)
      .single();

    let result;
    if (existingResponse) {
      // Update existing response
      const { data, error } = await supabase
        .from('assessment_responses')
        .update(responsePayload)
        .eq('id', existingResponse.id)
        .select()
        .single();
      
      handleSupabaseError(error);
      result = data;
    } else {
      // Insert new response
      const { data, error } = await supabase
        .from('assessment_responses')
        .insert(responsePayload)
        .select()
        .single();
      
      handleSupabaseError(error);
      result = data;
    }

    // Update assessment progress
    await this.updateProgress(assessmentId);
    
    return result;
  },

  /**
   * Get specific response for a question
   */
  async getResponse(assessmentId, questionId) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('question_id', questionId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error);
    }
    
    return data;
  },

  /**
   * Get all responses for an assessment
   */
  async getResponses(assessmentId) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: true });
    
    handleSupabaseError(error);
    return data || [];
  },

  /**
   * Update assessment progress based on current responses
   */
  async updateProgress(assessmentId) {
    const progressData = await this.getProgress(assessmentId);
    
    const updates = {
      progress: progressData.progress,
      updated_at: new Date().toISOString()
    };

    // Mark as completed if 100% progress and not already completed
    if (progressData.progress === 100) {
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('assessments')
      .update(updates)
      .eq('id', assessmentId)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  /**
   * Calculate assessment scores by section
   */
  async calculateScores(assessmentId) {
    const responses = await this.getResponses(assessmentId);
    const scores = {};
    
    // Group responses by section and calculate scores
    responses.forEach(response => {
      if (!scores[response.section]) {
        scores[response.section] = {
          total: 0,
          count: 0,
          responses: []
        };
      }
      
      if (response.score !== null) {
        scores[response.section].total += response.score;
        scores[response.section].count += 1;
      }
      
      scores[response.section].responses.push(response);
    });
    
    // Calculate averages
    Object.keys(scores).forEach(section => {
      if (scores[section].count > 0) {
        scores[section].average = Math.round(scores[section].total / scores[section].count);
      } else {
        scores[section].average = 0;
      }
    });

    // Update assessment with calculated scores
    await this.update(assessmentId, { score: scores });
    
    return scores;
  },

  /**
   * Mark assessment as completed
   */
  async complete(assessmentId) {
    const scores = await this.calculateScores(assessmentId);
    
    const { data, error } = await supabase
      .from('assessments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100,
        score: scores
      })
      .eq('id', assessmentId)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  /**
   * Archive an assessment
   */
  async archive(assessmentId) {
    const { data, error } = await supabase
      .from('assessments')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  },

  /**
   * Get assessment statistics for user
   */
  async getStats() {
    const assessments = await this.list();
    
    const stats = {
      total: assessments.length,
      completed: assessments.filter(a => a.status === 'completed').length,
      in_progress: assessments.filter(a => a.status === 'in_progress').length,
      archived: assessments.filter(a => a.status === 'archived').length,
      total_responses: assessments.reduce((sum, a) => sum + (a.assessment_responses?.[0]?.count || 0), 0)
    };
    
    return stats;
  },

  /**
   * Search assessments by criteria
   */
  async search(criteria = {}) {
    let query = supabase
      .from('assessments')
      .select('*');
    
    if (criteria.status) {
      query = query.eq('status', criteria.status);
    }
    
    if (criteria.title) {
      query = query.ilike('title', `%${criteria.title}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    handleSupabaseError(error);
    return data || [];
  }
};

// Backward compatibility exports
export const CoupleAssessment = Assessment; // Legacy compatibility
export default Assessment;