import { supabase, handleSupabaseError } from '../supabaseClient';

// Assessment Management Service for CMS
export class AssessmentService {
  // Questions Management
  async listQuestions(filters = {}) {
    let query = supabase
      .from('questions')
      .select('*')
      .order('section')
      .order('order_index');
    
    if (filters.section) {
      query = query.eq('section', filters.section);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data || [];
  }

  async getQuestion(id) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async getQuestionByQuestionId(questionId) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('question_id', questionId)
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async createQuestion(questionData) {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        ...questionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async updateQuestion(id, updates) {
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
  }

  async deleteQuestion(id) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    
    handleSupabaseError(error);
    return { success: true };
  }

  async reorderQuestions(questionUpdates) {
    const updates = questionUpdates.map(({ id, order_index }) => 
      this.updateQuestion(id, { order_index })
    );
    
    return Promise.all(updates);
  }

  // Sections Management
  async listSections(filters = {}) {
    let query = supabase
      .from('assessment_sections')
      .select('*')
      .order('order_index');
    
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data || [];
  }

  async getSection(id) {
    const { data, error } = await supabase
      .from('assessment_sections')
      .select('*')
      .eq('id', id)
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async getSectionBySlug(sectionId) {
    const { data, error } = await supabase
      .from('assessment_sections')
      .select('*')
      .eq('section_id', sectionId)
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async createSection(sectionData) {
    const { data, error } = await supabase
      .from('assessment_sections')
      .insert({
        ...sectionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async updateSection(id, updates) {
    const { data, error } = await supabase
      .from('assessment_sections')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async deleteSection(id) {
    const { error } = await supabase
      .from('assessment_sections')
      .delete()
      .eq('id', id);
    
    handleSupabaseError(error);
    return { success: true };
  }

  // Interpretations Management
  async listInterpretations(filters = {}) {
    let query = supabase
      .from('assessment_interpretations')
      .select('*')
      .order('section_id')
      .order('score_range_min');
    
    if (filters.section_id) {
      query = query.eq('section_id', filters.section_id);
    }
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data || [];
  }

  async getInterpretation(id) {
    const { data, error } = await supabase
      .from('assessment_interpretations')
      .select('*')
      .eq('id', id)
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async createInterpretation(interpretationData) {
    const { data, error } = await supabase
      .from('assessment_interpretations')
      .insert({
        ...interpretationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async updateInterpretation(id, updates) {
    const { data, error } = await supabase
      .from('assessment_interpretations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async deleteInterpretation(id) {
    const { error } = await supabase
      .from('assessment_interpretations')
      .delete()
      .eq('id', id);
    
    handleSupabaseError(error);
    return { success: true };
  }

  // Assessment Configuration Management
  async getConfig(configKey) {
    const { data, error } = await supabase
      .from('assessment_config')
      .select('*')
      .eq('config_key', configKey)
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async setConfig(configKey, configValue, description = '') {
    const { data, error } = await supabase
      .from('assessment_config')
      .upsert({
        config_key: configKey,
        config_value: configValue,
        description,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async listConfigs() {
    const { data, error } = await supabase
      .from('assessment_config')
      .select('*')
      .order('config_key');
    
    handleSupabaseError(error);
    return data || [];
  }

  // Utility Methods
  async getAssessmentStats() {
    const [sections, questions, interpretations] = await Promise.all([
      this.listSections(),
      this.listQuestions(),
      this.listInterpretations()
    ]);

    const stats = {
      sections: sections.length,
      activeSections: sections.filter(s => s.is_active).length,
      questions: questions.length,
      activeQuestions: questions.filter(q => q.is_active).length,
      interpretations: interpretations.length,
      questionsBySection: {}
    };

    // Group questions by section
    sections.forEach(section => {
      stats.questionsBySection[section.section_id] = questions.filter(
        q => q.section === section.section_id
      ).length;
    });

    return stats;
  }

  async getFullAssessmentStructure() {
    const [sections, questions, interpretations] = await Promise.all([
      this.listSections({ is_active: true }),
      this.listQuestions({ is_active: true }),
      this.listInterpretations()
    ]);

    // Group questions by section
    const structure = sections.map(section => ({
      ...section,
      questions: questions.filter(q => q.section === section.section_id),
      interpretations: interpretations.filter(i => i.section_id === section.section_id)
    }));

    return structure;
  }

  // Import/Export functionality
  async exportAssessment() {
    const [sections, questions, interpretations, configs] = await Promise.all([
      this.listSections(),
      this.listQuestions(),
      this.listInterpretations(),
      this.listConfigs()
    ]);

    return {
      sections,
      questions,
      interpretations,
      configs,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  async importAssessment(assessmentData) {
    // This would be used to import a full assessment configuration
    // Implementation would depend on specific requirements
    console.log('Import assessment:', assessmentData);
    throw new Error('Import functionality not yet implemented');
  }
}

// Export singleton instance
export const assessmentService = new AssessmentService();

// For backward compatibility with existing question service
export const Question = {
  list: () => assessmentService.listQuestions({ is_active: true }),
  get: (id) => assessmentService.getQuestion(id),
  getByQuestionId: (questionId) => assessmentService.getQuestionByQuestionId(questionId),
  getBySection: (section) => assessmentService.listQuestions({ section, is_active: true }),
  create: (questionData) => assessmentService.createQuestion(questionData),
  update: (id, updates) => assessmentService.updateQuestion(id, updates),
  delete: (id) => assessmentService.deleteQuestion(id),
  count: async () => {
    const questions = await assessmentService.listQuestions({ is_active: true });
    return questions.length;
  }
};