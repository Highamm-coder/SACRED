import { supabase, handleSupabaseError } from '../supabaseClient';
import { getSiteUrl } from '../../utils/index';

export const PartnerInvite = {
  // Create a new invite token for an assessment
  async createInviteToken(assessmentId, partner1Email) {
    const { data, error } = await supabase.rpc('create_partner_invite_token', {
      p_assessment_id: assessmentId,
      p_partner1_email: partner1Email,
      p_expires_in_hours: 168 // 7 days
    });
    
    handleSupabaseError(error);
    return data; // Returns the token string
  },

  // Generate full invite URL from token
  generateInviteUrl(token) {
    return `${getSiteUrl()}/PartnerInvite?token=${token}`;
  },

  // Validate and use an invite token
  async useInviteToken(token, partner2Email) {
    const { data, error } = await supabase.rpc('use_invite_token', {
      p_token: token,
      p_partner2_email: partner2Email
    });
    
    handleSupabaseError(error);
    
    if (data && data.length > 0) {
      const result = data[0];
      if (!result.is_valid) {
        throw new Error(result.error_message);
      }
      return {
        assessmentId: result.assessment_id,
        partner1Email: result.partner1_email,
        isValid: result.is_valid
      };
    }
    
    throw new Error('Invalid response from token validation');
  },

  // Get invite token details (for checking status)
  async getInviteToken(token) {
    const { data, error } = await supabase
      .from('partner_invite_tokens')
      .select(`
        id,
        token,
        assessment_id,
        partner1_email,
        partner2_email,
        expires_at,
        used_at,
        status,
        created_at
      `)
      .eq('token', token)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error);
    }
    
    return data;
  },

  // Get all invite tokens for an assessment
  async getTokensForAssessment(assessmentId) {
    const { data, error } = await supabase
      .from('partner_invite_tokens')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: false });
    
    handleSupabaseError(error);
    return data || [];
  },

  // Create invite token and return full URL
  async createInviteLink(assessmentId, partner1Email) {
    const token = await this.createInviteToken(assessmentId, partner1Email);
    return this.generateInviteUrl(token);
  }
};