import { supabase, handleSupabaseError } from '../supabaseClient';

// Helper function for generating unique slugs across all CMS services
const generateUniqueSlug = async (tableName, title) => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq('slug', slug)
        .limit(1);
      
      if (error) {
        console.error('Error checking slug:', error);
        break;
      }
      
      if (!data || data.length === 0) {
        break; // Slug is available
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    } catch (error) {
      console.error('Error in slug generation:', error);
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
};

// CMS Base Service Class
class CMSService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async list(filters = {}, options = {}) {
    let query = supabase.from(this.tableName).select('*');
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Apply sorting
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending || false 
      });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data;
  }

  async get(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('slug', slug)
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async create(data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    handleSupabaseError(error);
    return result;
  }

  async update(id, data) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    handleSupabaseError(error);
    return result;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    handleSupabaseError(error);
    return { success: true };
  }

  async count(filters = {}) {
    let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { count, error } = await query;
    handleSupabaseError(error);
    return count;
  }
}

// Blog Posts Service
export class BlogPostService extends CMSService {
  constructor() {
    super('blog_posts');
  }

  async listPublished(options = {}) {
    return this.list({ status: 'published' }, {
      orderBy: { column: 'published_at', ascending: false },
      ...options
    });
  }

  async listFeatured(limit = 3) {
    return this.list({ status: 'published', featured: true }, { limit });
  }

  async publish(id) {
    return this.update(id, { 
      status: 'published', 
      published_at: new Date().toISOString() 
    });
  }

  async unpublish(id) {
    return this.update(id, { status: 'draft' });
  }

  async generateSlug(title) {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      try {
        await this.getBySlug(slug);
        slug = `${baseSlug}-${counter}`;
        counter++;
      } catch (error) {
        // Slug doesn't exist, we can use it
        break;
      }
    }
    
    return slug;
  }
}

// Education Resources Service
export class EducationResourceService extends CMSService {
  constructor() {
    super('resources');
  }

  // Override create to handle slug generation
  async create(data) {
    // Auto-generate slug if not provided
    if (!data.slug && data.title) {
      data.slug = await generateUniqueSlug(this.tableName, data.title);
    }
    
    return super.create(data);
  }

  // Override update to handle slug generation
  async update(id, data) {
    // Auto-generate slug if title changed but slug wasn't provided
    if (data.title && !data.slug) {
      data.slug = this.generateSlugFromTitle(data.title);
    }
    
    return super.update(id, data);
  }

  async listPublished(filters = {}, options = {}) {
    return this.list({ status: 'published', ...filters }, {
      orderBy: { column: 'order_index', ascending: true },
      ...options
    });
  }

  async listByType(resourceType, options = {}) {
    return this.listPublished({ resource_type: resourceType }, options);
  }

  async reorderResources(resourceIds) {
    const updates = resourceIds.map((id, index) => 
      this.update(id, { order_index: index })
    );
    
    return Promise.all(updates);
  }

  // Helper method for generating slugs
  generateSlugFromTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  async publish(id) {
    return this.update(id, { 
      status: 'published', 
      published_at: new Date().toISOString() 
    });
  }

  async unpublish(id) {
    return this.update(id, { status: 'draft' });
  }
}

// Product Recommendations Service
export class ProductRecommendationService extends CMSService {
  constructor() {
    super('products');
  }

  // Override create to handle slug generation
  async create(data) {
    // Auto-generate slug if not provided
    if (!data.slug && data.title) {
      data.slug = await generateUniqueSlug(this.tableName, data.title);
    }
    
    return super.create(data);
  }

  // Override update to handle slug generation
  async update(id, data) {
    // Auto-generate slug if title changed but slug wasn't provided
    if (data.title && !data.slug) {
      data.slug = this.generateSlugFromTitle(data.title);
    }
    
    return super.update(id, data);
  }

  async listActive(options = {}) {
    return this.list({ status: 'active' }, {
      orderBy: { column: 'order_index', ascending: true },
      ...options
    });
  }

  async listFeatured(limit = 6) {
    return this.list({ status: 'active', featured: true }, { limit });
  }

  // Helper method for generating slugs
  generateSlugFromTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  async activate(id) {
    return this.update(id, { status: 'active' });
  }

  async deactivate(id) {
    return this.update(id, { status: 'inactive' });
  }
}

// Reflection Questions Service
export class ReflectionQuestionsService extends CMSService {
  constructor() {
    super('reflection_questions');
  }

  // Override create to handle slug generation
  async create(data) {
    // Auto-generate slug if not provided
    if (!data.slug && data.title) {
      data.slug = this.generateSlugFromTitle(data.title);
    }
    
    return super.create(data);
  }

  // Override update to handle slug generation
  async update(id, data) {
    // Auto-generate slug if title changed but slug wasn't provided
    if (data.title && !data.slug) {
      data.slug = this.generateSlugFromTitle(data.title);
    }
    
    return super.update(id, data);
  }

  async listPublished(options = {}) {
    return this.list({ status: 'published' }, {
      orderBy: { column: 'order_index', ascending: true },
      ...options
    });
  }

  async reorderQuestions(questionIds) {
    const updates = questionIds.map((id, index) => 
      this.update(id, { order_index: index })
    );
    
    return Promise.all(updates);
  }

  // Helper method for generating slugs
  generateSlugFromTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  async publish(id) {
    return this.update(id, { 
      status: 'published', 
      published_at: new Date().toISOString() 
    });
  }

  async unpublish(id) {
    return this.update(id, { status: 'draft' });
  }

  async listByCategory(category, options = {}) {
    return this.listPublished({ category }, options);
  }
}

// Page Content Service
export class PageContentService extends CMSService {
  constructor() {
    super('page_content');
  }

  // Override create to handle slug generation
  async create(data) {
    // Set slug from page_slug if not provided
    if (!data.slug && data.page_slug) {
      data.slug = data.page_slug;
    }
    
    return super.create(data);
  }

  async getPageContent(pageSlug) {
    try {
      return await this.getBySlug(pageSlug);
    } catch (error) {
      // Try finding by page_slug for backward compatibility
      const { data, error: pageSlugError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('page_slug', pageSlug)
        .single();
      
      if (pageSlugError) {
        throw pageSlugError;
      }
      
      return data;
    }
  }

  async updatePageContent(pageSlug, content) {
    try {
      const existing = await this.getPageContent(pageSlug);
      return this.update(existing.id, content);
    } catch (error) {
      // Page doesn't exist, create it
      return this.create({ 
        page_slug: pageSlug, 
        slug: pageSlug,
        ...content 
      });
    }
  }
}

// Media Library Service
export class MediaLibraryService extends CMSService {
  constructor() {
    super('media_library');
  }

  async upload(file, metadata = {}) {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `media/${fileName}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);
    
    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    // Save to media library
    const mediaRecord = await this.create({
      filename: fileName,
      original_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      ...metadata
    });
    
    return {
      ...mediaRecord,
      url: urlData.publicUrl
    };
  }

  async deleteFile(id) {
    // Get file info first
    const media = await this.get(id);
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([media.file_path]);
    
    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
    }
    
    // Delete from database
    return this.delete(id);
  }

  async getUrl(filePath) {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
}

// User Management Service (Admin only)
export class UserManagementService {
  async listUsers(options = {}) {
    let query = supabase.from('profiles').select(`
      id,
      email,
      full_name,
      role,
      is_active,
      has_paid,
      onboarding_completed,
      last_login_at,
      created_at,
      updated_at
    `);
    
    if (options.role) {
      query = query.eq('role', options.role);
    }
    
    if (options.search) {
      query = query.or(`full_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
    }
    
    query = query.order('created_at', { ascending: false });
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data;
  }

  async updateUserRole(userId, role) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async toggleUserStatus(userId, isActive) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single();
    
    handleSupabaseError(error);
    return data;
  }

  async getUserStats() {
    // Get user counts by role
    const { data: roleStats, error: roleError } = await supabase
      .from('profiles')
      .select('role')
      .not('role', 'is', null);
    
    handleSupabaseError(roleError);
    
    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentSignups, error: signupError } = await supabase
      .from('profiles')
      .select('id')
      .gte('created_at', sevenDaysAgo.toISOString());
    
    handleSupabaseError(signupError);
    
    // Process stats
    const roleCounts = roleStats.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalUsers: roleStats.length,
      roleDistribution: roleCounts,
      recentSignups: recentSignups.length
    };
  }
}

// Analytics Service (Admin only)
export class AnalyticsService {
  async trackEvent(eventType, eventData = {}, contentId = null, contentType = null) {
    const promises = [];
    
    // Track user event
    promises.push(
      supabase.from('user_analytics').insert({
        event_type: eventType,
        event_data: eventData,
        page_path: window.location.pathname
      })
    );
    
    // Track content event if provided
    if (contentId && contentType) {
      promises.push(
        supabase.from('content_analytics').insert({
          content_type: contentType,
          content_id: contentId,
          event_type: eventType
        })
      );
    }
    
    await Promise.all(promises);
  }

  async getContentAnalytics(contentType, startDate, endDate) {
    let query = supabase
      .from('content_analytics')
      .select('*')
      .eq('content_type', contentType);
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data;
  }

  async getUserAnalytics(startDate, endDate) {
    let query = supabase
      .from('user_analytics')
      .select('*');
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data, error } = await query;
    handleSupabaseError(error);
    return data;
  }

  async getDashboardStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get various stats for admin dashboard
    const [blogStats, resourceStats, userStats, analyticsStats] = await Promise.all([
      this.getContentStats('blog_posts'),
      this.getContentStats('education_resources'),
      this.getUserStats(),
      this.getAnalyticsStats(thirtyDaysAgo.toISOString())
    ]);
    
    return {
      blog: blogStats,
      resources: resourceStats,
      users: userStats,
      analytics: analyticsStats
    };
  }

  async getContentStats(tableName) {
    const { data, error } = await supabase
      .from(tableName)
      .select('status');
    
    handleSupabaseError(error);
    
    return data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }

  async getUserStats() {
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at, has_paid');
    
    handleSupabaseError(error);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent = data.filter(user => 
      new Date(user.created_at) > thirtyDaysAgo
    );
    
    const paid = data.filter(user => user.has_paid);
    
    return {
      total: data.length,
      recentSignups: recent.length,
      paidUsers: paid.length,
      conversionRate: data.length > 0 ? (paid.length / data.length * 100).toFixed(1) : 0
    };
  }

  async getAnalyticsStats(startDate) {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('event_type')
      .gte('created_at', startDate);
    
    handleSupabaseError(error);
    
    return data.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});
  }
}

// Initialize services
export const blogPostService = new BlogPostService();
export const educationResourceService = new EducationResourceService();
export const productRecommendationService = new ProductRecommendationService();
export const reflectionQuestionsService = new ReflectionQuestionsService();
export const pageContentService = new PageContentService();
export const mediaLibraryService = new MediaLibraryService();
export const userManagementService = new UserManagementService();
export const analyticsService = new AnalyticsService();

// Admin permission check utility
export const requireAdmin = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error('Authentication required');
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  if (profileError || profile.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return true;
};