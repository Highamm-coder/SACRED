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
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { blogPostService } from '@/api/services/cms';
import RichTextEditor from '@/components/ui/rich-text-editor';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function BlogEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const blogId = searchParams.get('id');
  const isEditing = !!blogId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft',
    featured: false,
    featured_image: '',
    meta_title: '',
    meta_description: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadBlogPost();
    }
  }, [blogId]);

  const loadBlogPost = async () => {
    try {
      setLoading(true);
      const post = await blogPostService.get(blogId);
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        status: post.status || 'draft',
        featured: post.featured || false,
        featured_image: post.featured_image || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        tags: post.tags || []
      });
    } catch (error) {
      console.error('Error loading blog post:', error);
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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
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
        result = await blogPostService.update(blogId, dataToSave);
      } else {
        result = await blogPostService.create(dataToSave);
      }

      // Navigate back to CMS with success message
      navigate(createPageUrl('AdminCMS') + '?tab=blog&success=saved');
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Error saving blog post: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    
    if (confirm('Are you sure you want to delete this blog post? This cannot be undone.')) {
      try {
        await blogPostService.delete(blogId);
        navigate(createPageUrl('AdminCMS') + '?tab=blog&success=deleted');
      } catch (error) {
        console.error('Error deleting blog post:', error);
        alert('Error deleting blog post: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="flex justify-center items-center h-64">
          <div className="text-[#6B5B73] font-sacred">Loading blog post...</div>
        </div>
      </AuthWrapper>
    );
  }

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
                  onClick={() => navigate(createPageUrl('AdminCMS') + '?tab=blog')}
                  className="text-[#6B5B73] hover:text-[#2F4F3F]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to CMS
                </Button>
                <div>
                  <h1 className="text-2xl font-sacred-bold text-[#2F4F3F]">
                    {isEditing ? 'Edit Blog Post' : 'New Blog Post'}
                  </h1>
                  <p className="text-[#6B5B73] font-sacred text-sm">
                    {isEditing ? 'Make changes to your blog post' : 'Create a new blog post for your audience'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
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
                      placeholder="Enter your blog post title..."
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
                    <p className="text-xs text-[#6B5B73]">This will be the URL: /blog/{formData.slug}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-sacred text-[#2F4F3F]">Excerpt</Label>
                    <RichTextEditor
                      value={formData.excerpt}
                      onChange={(value) => setFormData({ ...formData, excerpt: value })}
                      placeholder="Write a brief excerpt that will appear in blog listings..."
                      height="120px"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-sacred text-[#2F4F3F]">Content *</Label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      placeholder="Write your blog post content here..."
                      height="500px"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sacred text-[#2F4F3F]">Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      Featured post
                    </Label>
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

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sacred text-[#2F4F3F]">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        Add
                      </Button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* SEO */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sacred text-[#2F4F3F]">SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-sacred text-sm">Meta Title</Label>
                    <Input
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="SEO title..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-sacred text-sm">Meta Description</Label>
                    <Input
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="SEO description..."
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