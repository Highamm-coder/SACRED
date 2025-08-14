// SACRED API - Supabase Services
// This file provides the same interface as Base44 entities but uses Supabase

// Core assessment entities
export { Question } from './services/questions';
export { CoupleAssessment } from './services/assessments';
export { Answer } from './services/answers';
export { OpenEndedQuestion, OpenEndedAnswer } from './services/openEnded';

// User authentication and management
export { User } from './services/users';

// Partner invite system
export { PartnerInvite } from './services/partnerInvite';

// Content entities using CMS services
import { 
  blogPostService, 
  educationResourceService, 
  productRecommendationService 
} from './services/cms';

export const BlogPost = {
  async list() {
    return await blogPostService.listPublished();
  },
  async get(id) {
    return await blogPostService.get(id);
  },
  async filter(filters = {}) {
    return await blogPostService.list(filters);
  }
};

export const RecommendedVideo = {
  async list() {
    // TODO: Implement recommended video functionality
    return [];
  },
  async get(id) {
    // TODO: Implement recommended video functionality
    return null;
  }
};

export const Resource = {
  async list() {
    return await educationResourceService.listPublished();
  },
  async get(id) {
    return await educationResourceService.get(id);
  }
};

export const Product = {
  async list() {
    return await productRecommendationService.listActive();
  },
  async get(id) {
    return await productRecommendationService.get(id);
  },
  async filter(filters = {}) {
    return await productRecommendationService.list(filters);
  }
};

// Re-export Supabase client for direct access if needed
export { supabase } from './supabaseClient';