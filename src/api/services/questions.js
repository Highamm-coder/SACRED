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
    // Normalize field names and parse options JSON for consistency with Assessment component
    return (data || []).map(q => {
      console.log('🔍 Raw question from database:', q.question_id, 'Raw options:', typeof q.options, q.options);
      
      let parsedOptions = [];
      try {
        if (q.options && typeof q.options === 'string') {
          console.log('📝 Parsing JSON string options:', q.options);
          const optionsData = JSON.parse(q.options);
          console.log('📝 Parsed options data:', optionsData);
          
          if (optionsData.options) {
            // Multiple choice format: {"options": ["Option 1", "Option 2"]}
            parsedOptions = optionsData.options;
          } else if (optionsData.labels) {
            // Scale format: {"min": 1, "max": 5, "labels": {"1": "...", "2": "..."}}
            console.log('📊 Converting scale question to options array');
            parsedOptions = Object.entries(optionsData.labels).map(([key, value]) => value);
          }
        } else if (Array.isArray(q.options)) {
          console.log('📝 Options already an array:', q.options);
          parsedOptions = q.options;
        } else if (q.options && typeof q.options === 'object') {
          console.log('📝 Options is an object:', q.options);
          if (q.options.options) {
            parsedOptions = q.options.options;
          } else if (q.options.labels) {
            // Scale format as object
            parsedOptions = Object.entries(q.options.labels).map(([key, value]) => value);
          }
        }
      } catch (e) {
        console.error('❌ Failed to parse question options for:', q.question_id, e);
        console.error('❌ Raw options value:', q.options);
        parsedOptions = [];
      }
      
      const processedQuestion = {
        ...q,
        questionId: q.question_id, // Add questionId alias
        order: q.order_index || q.order, // Ensure order field exists
        options: parsedOptions, // Parse JSON options to array
        text: q.question_text, // Map question_text to text field
        explainer: q.help_text, // Map help_text to explainer field for descriptions
        discussionPrompt: q.discussion_prompt || null // Include discussion prompt if available
      };
      
      console.log('✅ Processed question:', processedQuestion.questionId, 'Final options:', processedQuestion.options, 'Explainer:', processedQuestion.explainer);
      return processedQuestion;
    });
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
    // Normalize field names and parse options JSON for consistency
    if (data) {
      let parsedOptions = [];
      try {
        if (data.options && typeof data.options === 'string') {
          const optionsData = JSON.parse(data.options);
          if (optionsData.options) {
            parsedOptions = optionsData.options;
          } else if (optionsData.labels) {
            parsedOptions = Object.entries(optionsData.labels).map(([key, value]) => value);
          }
        } else if (Array.isArray(data.options)) {
          parsedOptions = data.options;
        } else if (data.options && typeof data.options === 'object') {
          if (data.options.options) {
            parsedOptions = data.options.options;
          } else if (data.options.labels) {
            parsedOptions = Object.entries(data.options.labels).map(([key, value]) => value);
          }
        }
      } catch (e) {
        console.error('Failed to parse question options for:', data.question_id, e);
        parsedOptions = [];
      }
      
      return {
        ...data,
        questionId: data.question_id, // Add questionId alias
        order: data.order_index || data.order, // Ensure order field exists
        options: parsedOptions, // Parse JSON options to array
        text: data.question_text, // Map question_text to text field
        explainer: data.help_text // Map help_text to explainer field for descriptions
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
    // Normalize field names and parse options JSON for consistency
    return (data || []).map(q => {
      let parsedOptions = [];
      try {
        if (q.options && typeof q.options === 'string') {
          const optionsData = JSON.parse(q.options);
          if (optionsData.options) {
            parsedOptions = optionsData.options;
          } else if (optionsData.labels) {
            parsedOptions = Object.entries(optionsData.labels).map(([key, value]) => value);
          }
        } else if (Array.isArray(q.options)) {
          parsedOptions = q.options;
        } else if (q.options && typeof q.options === 'object') {
          if (q.options.options) {
            parsedOptions = q.options.options;
          } else if (q.options.labels) {
            parsedOptions = Object.entries(q.options.labels).map(([key, value]) => value);
          }
        }
      } catch (e) {
        console.error('Failed to parse question options for:', q.question_id, e);
        parsedOptions = [];
      }
      
      return {
        ...q,
        questionId: q.question_id, // Add questionId alias
        order: q.order_index || q.order, // Ensure order field exists
        options: parsedOptions, // Parse JSON options to array
        text: q.question_text, // Map question_text to text field
        explainer: q.help_text // Map help_text to explainer field for descriptions
      };
    });
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