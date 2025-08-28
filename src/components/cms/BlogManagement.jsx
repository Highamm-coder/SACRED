import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Calendar,
  User,
  Tag,
  ExternalLink
} from 'lucide-react';
import { blogPostService } from '@/api/services/cms';
import { formatDistanceToNow } from 'date-fns';

export default function BlogManagement() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: [],
    featured: false
  });

  useEffect(() => {
    loadPosts();
  }, [statusFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await blogPostService.list(filters);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let postData = { ...formData };
      
      // Generate slug if not provided
      if (!postData.slug) {
        postData.slug = await blogPostService.generateSlug(postData.title);
      }
      
      // Convert tags string to array
      if (typeof postData.tags === 'string') {
        postData.tags = postData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }

      if (editingPost) {
        await blogPostService.update(editingPost.id, postData);
      } else {
        await blogPostService.create(postData);
      }

      resetForm();
      setIsDialogOpen(false);
      loadPosts();
    } catch (error) {
      console.error('Failed to save blog post:', error);
      alert('Failed to save blog post. Please try again.');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      ...post,
      tags: post.tags?.join(', ') || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      await blogPostService.delete(postId);
      loadPosts();
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      alert('Failed to delete blog post. Please try again.');
    }
  };

  const handlePublishToggle = async (post) => {
    try {
      if (post.status === 'published') {
        await blogPostService.unpublish(post.id);
      } else {
        await blogPostService.publish(post.id);
      }
      loadPosts();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      status: 'draft',
      meta_title: '',
      meta_description: '',
      tags: [],
      featured: false
    });
    setEditingPost(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-sacred text-[#2F4F3F]">Blog Management</CardTitle>
              <CardDescription className="font-sacred">
                Create and manage blog posts for the SACRED platform
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button 
                onClick={() => navigate('/BlogEditor')} 
                className="bg-[#C4756B] hover:bg-[#B86761]"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-sacred text-[#2F4F3F]">
                    {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                  </DialogTitle>
                  <DialogDescription className="font-sacred">
                    {editingPost ? 'Update your blog post content' : 'Create a new blog post for the SACRED platform'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-sacred text-[#2F4F3F]">Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Blog post title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-sacred text-[#2F4F3F]">Slug</Label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="url-friendly-slug (auto-generated if empty)"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-sacred text-[#2F4F3F]">Excerpt</Label>
                    <RichTextEditor
                      value={formData.excerpt}
                      onChange={(value) => handleInputChange('excerpt', value)}
                      placeholder="Brief description or summary of the post..."
                      height="100px"
                    />
                    <p className="text-xs text-[#6B5B73] font-sacred">Short excerpt that appears in blog listings and previews</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-sacred text-[#2F4F3F]">Content *</Label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => handleInputChange('content', value)}
                      placeholder="Write your blog post content here. Use the formatting toolbar to add headings, lists, bold text, images, and more..."
                      height="400px"
                    />
                    <p className="text-xs text-[#6B5B73] font-sacred">Use the toolbar to format your text with headings, bold, italic, lists, and more</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-sacred text-[#2F4F3F]">Featured Image URL</Label>
                      <Input
                        value={formData.featured_image}
                        onChange={(e) => handleInputChange('featured_image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-sacred text-[#2F4F3F]">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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
                  </div>

                  <div className="space-y-2">
                    <Label className="font-sacred text-[#2F4F3F]">Tags (comma-separated)</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="marriage, intimacy, christian"
                    />
                  </div>

                  {/* SEO Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-sacred text-[#2F4F3F]">Meta Title</Label>
                      <Input
                        value={formData.meta_title}
                        onChange={(e) => handleInputChange('meta_title', e.target.value)}
                        placeholder="SEO title (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-sacred text-[#2F4F3F]">Meta Description</Label>
                      <Input
                        value={formData.meta_description}
                        onChange={(e) => handleInputChange('meta_description', e.target.value)}
                        placeholder="SEO description (optional)"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                    />
                    <Label htmlFor="featured" className="font-sacred text-[#2F4F3F]">Featured Post</Label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#C4756B] hover:bg-[#B86761]">
                      {editingPost ? 'Update Post' : 'Create Post'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B5B73] w-4 h-4" />
              <Input
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-[#C4756B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#6B5B73] font-sacred">Loading blog posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#6B5B73] font-sacred">No blog posts found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-sacred-bold text-[#2F4F3F] truncate">
                          {post.title}
                        </h3>
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        {post.featured && (
                          <Badge variant="outline" className="text-[#C4756B] border-[#C4756B]">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      {post.excerpt && (
                        <p className="text-[#6B5B73] font-sacred text-sm mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-[#6B5B73] font-sacred">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {post.tags.slice(0, 3).join(', ')}
                            {post.tags.length > 3 && '...'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishToggle(post)}
                        className={post.status === 'published' ? 'text-orange-600' : 'text-green-600'}
                      >
                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/BlogEditor?id=${post.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}