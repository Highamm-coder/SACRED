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
  BookOpen,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { educationResourceService } from '@/api/services/cms';
import { formatDistanceToNow } from 'date-fns';

export default function ResourceManagement() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingResource, setEditingResource] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    resource_type: 'article',
    external_url: '',
    featured_image: '',
    author: '',
    order_index: 0,
    status: 'draft'
  });

  const resourceTypes = [
    { value: 'article', label: 'Article' },
    { value: 'video', label: 'Video' },
    { value: 'book', label: 'Book' },
    { value: 'course', label: 'Course' },
    { value: 'tool', label: 'Tool' }
  ];

  useEffect(() => {
    loadResources();
  }, [statusFilter, typeFilter]);

  const loadResources = async () => {
    try {
      setLoading(true);
      let filters = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.resource_type = typeFilter;
      
      const data = await educationResourceService.list(filters, {
        orderBy: { column: 'order_index', ascending: true }
      });
      setResources(data);
    } catch (error) {
      console.error('Failed to load education resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let resourceData = { ...formData };
      
      // Ensure order_index is a number
      resourceData.order_index = parseInt(resourceData.order_index) || 0;

      if (editingResource) {
        await educationResourceService.update(editingResource.id, resourceData);
      } else {
        // If no order specified, put at the end
        if (resourceData.order_index === 0) {
          resourceData.order_index = resources.length + 1;
        }
        await educationResourceService.create(resourceData);
      }

      await loadResources();
      resetForm();
    } catch (error) {
      console.error('Failed to save education resource:', error);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      content: resource.content || '',
      resource_type: resource.resource_type,
      external_url: resource.external_url || '',
      featured_image: resource.featured_image || '',
      author: resource.author || '',
      order_index: resource.order_index,
      status: resource.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this education resource?')) {
      try {
        await educationResourceService.delete(resourceId);
        await loadResources();
      } catch (error) {
        console.error('Failed to delete education resource:', error);
      }
    }
  };

  const handleStatusChange = async (resourceId, newStatus) => {
    try {
      await educationResourceService.update(resourceId, { status: newStatus });
      await loadResources();
    } catch (error) {
      console.error('Failed to update resource status:', error);
    }
  };

  const handleReorder = async (resourceId, direction) => {
    try {
      const resourceIndex = resources.findIndex(r => r.id === resourceId);
      const resource = resources[resourceIndex];
      
      let newOrder;
      if (direction === 'up' && resourceIndex > 0) {
        newOrder = resources[resourceIndex - 1].order_index;
        await educationResourceService.update(resources[resourceIndex - 1].id, { 
          order_index: resource.order_index 
        });
      } else if (direction === 'down' && resourceIndex < resources.length - 1) {
        newOrder = resources[resourceIndex + 1].order_index;
        await educationResourceService.update(resources[resourceIndex + 1].id, { 
          order_index: resource.order_index 
        });
      } else {
        return;
      }

      await educationResourceService.update(resourceId, { order_index: newOrder });
      await loadResources();
    } catch (error) {
      console.error('Failed to reorder resource:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      resource_type: 'article',
      external_url: '',
      featured_image: '',
      author: '',
      order_index: 0,
      status: 'draft'
    });
    setEditingResource(null);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      article: { color: 'bg-blue-100 text-blue-800', icon: '📄' },
      video: { color: 'bg-red-100 text-red-800', icon: '🎥' },
      book: { color: 'bg-green-100 text-green-800', icon: '📚' },
      course: { color: 'bg-purple-100 text-purple-800', icon: '🎓' },
      tool: { color: 'bg-orange-100 text-orange-800', icon: '🔧' }
    };
    const config = typeConfig[type] || typeConfig.article;
    return (
      <Badge className={`${config.color} text-xs font-sacred`}>
        {config.icon} {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-sacred-bold text-[#2F4F3F]">Education Resources</h2>
          <p className="text-[#6B5B73] font-sacred">
            Manage articles, videos, books, courses, and tools for the Education page
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button 
            onClick={() => navigate('/ResourceEditor')} 
            className="bg-[#C4756B] hover:bg-[#B86761]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Resource
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-sacred">
                {editingResource ? 'Edit Education Resource' : 'Create New Education Resource'}
              </DialogTitle>
              <DialogDescription className="font-sacred">
                Add educational content to help couples prepare for marriage.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title" className="font-sacred">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter resource title..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resource_type" className="font-sacred">Type</Label>
                  <Select value={formData.resource_type} onValueChange={(value) => setFormData({ ...formData, resource_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author" className="font-sacred">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Author name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="font-sacred">Description</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Write a brief description of this resource..."
                  height="120px"
                />
                <p className="text-xs text-[#6B5B73] font-sacred">Brief description that appears in resource listings</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content" className="font-sacred">Full Content</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Write the full content of your resource here. Use the formatting toolbar to add headings, lists, bold text, and more..."
                  height="300px"
                />
                <p className="text-xs text-[#6B5B73] font-sacred">The main content that will be displayed on the resource page</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="external_url" className="font-sacred">External URL</Label>
                <Input
                  id="external_url"
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  placeholder="https://example.com/resource"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="featured_image" className="font-sacred">Featured Image URL</Label>
                <Input
                  id="featured_image"
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_index" className="font-sacred">Order</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                    placeholder="Order (1, 2, 3...)"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status" className="font-sacred">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#C4756B] hover:bg-[#B86761]">
                  {editingResource ? 'Update Resource' : 'Create Resource'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {resourceTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#C4756B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6B5B73] font-sacred">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="w-12 h-12 text-[#C4756B]/50 mx-auto mb-4" />
              <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-2">No Resources Found</h3>
              <p className="text-[#6B5B73] font-sacred mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No resources match your current filters.' 
                  : 'Create your first education resource to get started.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredResources.map((resource, index) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#C4756B]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#C4756B] font-sacred-bold text-sm">{resource.order_index}</span>
                      </div>
                      <h3 className="text-lg font-sacred-bold text-[#2F4F3F] line-clamp-1">
                        {resource.title}
                      </h3>
                      <div className="flex gap-2">
                        {getTypeBadge(resource.resource_type)}
                        {getStatusBadge(resource.status)}
                      </div>
                    </div>
                    
                    {resource.description && (
                      <p className="text-[#6B5B73] font-sacred text-sm line-clamp-2 ml-11 mb-2">
                        {resource.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-sacred ml-11">
                      {resource.author && (
                        <span>By {resource.author}</span>
                      )}
                      {resource.external_url && (
                        <a 
                          href={resource.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#C4756B] hover:text-[#B86761]"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit
                        </a>
                      )}
                      <span>
                        Created {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(resource.id, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(resource.id, 'down')}
                        disabled={index === filteredResources.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Status toggle */}
                    {resource.status === 'published' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(resource.id, 'draft')}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(resource.id, 'published')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/ResourceEditor?id=${resource.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(resource.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}