// SACRED API - Supabase Services
// This file provides the same interface as Base44 entities but uses Supabase

// Core assessment entities
export { Question } from './services/questions';
export { CoupleAssessment } from './services/assessments';
export { Answer } from './services/answers';
export { OpenEndedQuestion, OpenEndedAnswer } from './services/openEnded';

// User authentication and management
export { User } from './services/users';

// Content entities (for future use)
export const BlogPost = {
  async list() {
    // TODO: Implement blog post functionality
    return [];
  },
  async get(id) {
    // TODO: Implement blog post functionality
    return null;
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
    // TODO: Implement resource functionality
    return [];
  },
  async get(id) {
    // TODO: Implement resource functionality
    return null;
  }
};

export const Product = {
  async list() {
    // TODO: Implement product functionality
    return [];
  },
  async get(id) {
    // TODO: Implement product functionality
    return null;
  }
};

// Re-export Supabase client for direct access if needed
export { supabase } from './supabaseClient';