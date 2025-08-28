import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Eye, Trash2, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { educationResourceService } from '@/api/services/cms';
import RichTextEditor from '@/components/ui/rich-text-editor';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function ResourceEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resourceId = searchParams.get('id');
  const isEditing = !!resourceId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    resource_type: 'article',
    status: 'draft',
    featured: false,
    featured_image: '',
    external_url: '',
    author: '',
    order_index: 0
  });

  const resourceTypes = [
    { value: 'article', label: 'Article' },
    { value: 'video', label: 'Video' },
    { value: 'course', label: 'Course' },
    { value: 'guide', label: 'Guide' },
    { value: 'tool', label: 'Tool' },
    { value: 'book', label: 'Book' }
  ];

  useEffect(() => {
    if (isEditing) {
      loadResource();
    }
  }, [resourceId]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const resource = await educationResourceService.get(resourceId);
      setFormData({
        title: resource.title || '',
        slug: resource.slug || '',
        description: resource.description || '',
        content: resource.content || '',
        resource_type: resource.resource_type || 'article',
        status: resource.status || 'draft',
        featured: resource.featured || false,
        featured_image: resource.featured_image || '',
        external_url: resource.external_url || '',
        author: resource.author || '',
        order_index: resource.order_index || 0
      });
    } catch (error) {
      console.error('Error loading resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleTitleChange = (value) => {
    setFormData({ 
      ...formData, 
      title: value,
      slug: formData.slug || generateSlug(value)
    });
  };

  const handleSave = async (publishStatus = null) => {
    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        status: publishStatus || formData.status
      };

      let result;
      if (isEditing) {
        result = await educationResourceService.update(resourceId, dataToSave);
      } else {
        result = await educationResourceService.create(dataToSave);
      }

      // Navigate back to CMS with success message
      navigate(createPageUrl('AdminCMS') + '?tab=resources&success=saved');
    } catch (error) {
      console.error('Error saving resource:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      console.error('Form data being saved:', JSON.stringify(dataToSave, null, 2));
      alert('Error saving resource: ' + (error.message || error.toString()));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    
    if (confirm('Are you sure you want to delete this resource? This cannot be undone.')) {
      try {
        await educationResourceService.delete(resourceId);
        navigate(createPageUrl('AdminCMS') + '?tab=resources&success=deleted');
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Error deleting resource: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="flex justify-center items-center h-64">
          <div className="text-[#6B5B73] font-sacred">Loading resource...</div>
        </div>
      </AuthWrapper>
    );
  }

  const isExternalResource = formData.resource_type === 'tool' || formData.external_url;

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate(createPageUrl('AdminCMS') + '?tab=resources')}
                  className="text-[#6B5B73] hover:text-[#2F4F3F]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to CMS
                </Button>
                <div>
                  <h1 className="text-2xl font-sacred-bold text-[#2F4F3F]">
                    {isEditing ? 'Edit Resource' : 'New Resource'}
                  </h1>
                  <p className="text-[#6B5B73] font-sacred text-sm">
                    {isEditing ? 'Make changes to your educational resource' : 'Create a new educational resource'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge 
                  variant={formData.resource_type}
                  className="capitalize bg-[#E6D7C9] text-[#2F4F3F]"
                >
                  {formData.resource_type}
                </Badge>
                
                <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
                  {formData.status}
                </Badge>
                
                <Button
                  variant="outline"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="text-[#6B5B73] border-[#E6D7C9]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                
                <Button
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="bg-[#C4756B] hover:bg-[#B86761] text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Publish
                </Button>
                
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sacred text-[#2F4F3F]">Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-sacred text-[#2F4F3F]">Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter your resource title..."
                      className="text-lg font-sacred"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-sacred text-[#2F4F3F]">URL Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="url-friendly-slug"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-[#6B5B73]">This will be the URL: /resources/{formData.slug}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-sacred text-[#2F4F3F]">Description</Label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      placeholder="Write a brief description that will appear in resource listings..."
                      height="120px"
                    />
                    <p className="text-xs text-[#6B5B73]">Brief description that appears in resource listings</p>
                  </div>

                  {!isExternalResource && (
                    <div className="space-y-2">
                      <Label className="font-sacred text-[#2F4F3F]">Full Content</Label>
                      <RichTextEditor
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        placeholder="Write the full content of your resource here..."
                        height="500px"
                      />
                      <p className="text-xs text-[#6B5B73]">The main content that will be displayed on the resource page</p>
                    </div>
                  )}

                  {isExternalResource && (
                    <div className="bg-[#F5F1EB] border border-[#E6D7C9] rounded-lg p-4">
                      <div className="flex items-center gap-2 text-[#C4756B] mb-2">
                        <ExternalLink className="w-4 h-4" />
                        <span className="font-sacred-bold">External Resource</span>
                      </div>
                      <p className="text-[#6B5B73] font-sacred text-sm">
                        This resource links to external content. Users will be directed to the external URL when they access this resource.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Resource Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sacred text-[#2F4F3F]">Resource Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-sacred">Resource Type</Label>
                    <Select
                      value={formData.resource_type}
                      onValueChange={(value) => setFormData({ ...formData, resource_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-sacred">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="featured" className="font-sacred text-sm">
                      Featured resource
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-sacred text-sm">Order Index</Label>
                    <Input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-24"
                    />
                    <p className="text-xs text-[#6B5B73]">Lower numbers appear first</p>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sacred text-[#2F4F3F]">Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Input
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      type="url"
                    />
                    {formData.featured_image && (
                      <div className="mt-2">
                        <img 
                          src={formData.featured_image} 
                          alt="Featured image preview" 
                          className="w-full h-32 object-cover rounded border"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* External URL */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sacred text-[#2F4F3F]">External Link</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="font-sacred text-sm">External URL</Label>
                    <Input
                      value={formData.external_url}
                      onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                      placeholder="https://example.com/resource"
                      type="url"
                    />
                    <p className="text-xs text-[#6B5B73]">
                      If provided, users will be directed to this external link instead of viewing content on your site
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Author */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sacred text-[#2F4F3F]">Author Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="font-sacred text-sm">Author Name</Label>
                    <Input
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Author name or organization"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}