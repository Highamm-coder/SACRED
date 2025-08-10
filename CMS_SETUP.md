# SACRED CMS Setup Guide

## Overview

The SACRED CMS is a comprehensive content management system built for the SACRED platform. It provides admin users with full control over blog posts, education resources, product recommendations, user management, and analytics.

## Architecture

### Database Schema
- **blog_posts**: Blog content management with SEO features
- **education_resources**: Articles, videos, courses, and guides
- **product_recommendations**: Book, course, tool, and service recommendations
- **page_content**: Dynamic page content management
- **media_library**: File upload and media management
- **user_analytics**: User behavior tracking
- **content_analytics**: Content performance metrics
- **profiles**: Extended user management with roles

### Role-Based Access Control
- **admin**: Full CMS access, user management, analytics
- **editor**: Content creation and editing (own content)
- **user**: Standard platform access

## Setup Instructions

### 1. Database Setup
Run the SQL schema in your Supabase dashboard:

```bash
# Execute the SQL file in Supabase SQL Editor
# File: /database/cms_schema.sql
```

### 2. Storage Setup
Create a storage bucket for media files:

1. Go to Supabase Dashboard → Storage
2. Create bucket named "media"
3. Set bucket policy to allow authenticated users to read
4. Set bucket policy to allow admin/editor roles to upload/delete

### 3. Create Admin User

After creating your first user account, promote it to admin:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### 4. Environment Variables
Ensure these are set in your `.env.local`:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_ENVIRONMENT=development
```

## CMS Features

### Dashboard Overview
- Content statistics (blog posts, resources, products)
- User metrics (total users, recent signups, conversion rate)
- Quick actions for common tasks
- Recent activity feed (coming soon)

### Blog Management
- ✅ Create, edit, delete blog posts
- ✅ Publish/unpublish posts
- ✅ SEO meta fields
- ✅ Featured posts
- ✅ Tag management
- ✅ Status filtering and search
- ✅ Auto-generated slugs

### Resource Management
- 📋 Coming Soon: Education resource management
- 📋 Article, video, course, and guide types
- 📋 Difficulty levels and duration tracking
- 📋 Order management for courses

### Product Management
- 📋 Coming Soon: Product recommendation system
- 📋 Book, course, tool, service recommendations
- 📋 Affiliate link management
- 📋 Rating and pricing information

### User Management
- 📋 Coming Soon: Full user administration
- 📋 Role assignment (user, editor, admin)
- 📋 Account status management
- 📋 User statistics and insights

### Media Management
- 📋 Coming Soon: File upload interface
- 📋 Image optimization and resizing
- 📋 Media library organization
- 📋 Alt text and caption management

### Analytics Dashboard
- 📋 Coming Soon: Comprehensive analytics
- 📋 User behavior tracking
- 📋 Content performance metrics
- 📋 Conversion tracking

### Page Content Management
- 📋 Coming Soon: Dynamic page editing
- 📋 Landing page customization
- 📋 Flexible content blocks
- 📋 A/B testing capabilities

## Access URLs

- **Main Admin Panel**: `/Admin` (basic user management)
- **Full CMS Dashboard**: `/AdminCMS` (comprehensive CMS)

## Security Features

- Role-based access control with Row Level Security (RLS)
- Admin-only endpoints with authentication checks
- Input validation and sanitization
- Secure file upload handling
- Audit logging for admin actions

## API Services

### CMS Service Classes
- `BlogPostService`: Blog post CRUD operations
- `EducationResourceService`: Education content management
- `ProductRecommendationService`: Product recommendation system
- `MediaLibraryService`: File and media management
- `UserManagementService`: User administration
- `AnalyticsService`: Data tracking and reporting
- `PageContentService`: Dynamic page content

### Key Methods
- `list(filters, options)`: Get paginated content with filters
- `create(data)`: Create new content
- `update(id, data)`: Update existing content
- `delete(id)`: Delete content
- `publish/unpublish`: Content status management

## Development Notes

### Component Structure
```
src/
├── pages/
│   ├── AdminCMS.jsx          # Main CMS dashboard
│   └── Admin.jsx             # Basic admin panel
├── components/cms/
│   ├── BlogManagement.jsx    # Blog post management
│   ├── ResourceManagement.jsx
│   ├── ProductManagement.jsx
│   ├── UserManagement.jsx
│   ├── MediaManagement.jsx
│   ├── AnalyticsDashboard.jsx
│   └── PageContentManagement.jsx
└── api/services/
    └── cms.js                # CMS service layer
```

### Styling
- Consistent with SACRED brand colors
- Uses Tailwind CSS with custom color palette
- Font: Cormorant Garamond (serif, elegant)
- Responsive design for mobile and desktop

### Performance Optimizations
- Pagination for large datasets
- Lazy loading for content sections
- Optimistic UI updates
- Caching for frequently accessed data

## Next Steps

1. **Database Setup**: Execute the SQL schema in Supabase
2. **Admin User**: Create and promote your first admin user
3. **Storage Bucket**: Set up media storage in Supabase
4. **Content Creation**: Start creating blog posts and resources
5. **Customization**: Adapt components to your specific needs

## Support

For technical support or questions about the CMS implementation, refer to:
- Supabase documentation for database operations
- React and component library documentation
- SACRED platform development team

---

**Status**: Core infrastructure complete, individual management interfaces in development
**Version**: 1.0.0
**Last Updated**: 2025-01-10