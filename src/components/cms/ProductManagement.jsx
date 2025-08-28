import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  ExternalLink,
  Star,
  DollarSign
} from 'lucide-react';
import { productRecommendationService } from '@/api/services/cms';
import { formatDistanceToNow } from 'date-fns';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product_type: 'book',
    external_url: '',
    featured_image: '',
    price: '',
    author: '',
    order_index: 0,
    status: 'active',
    featured: false
  });

  const productTypes = [
    { value: 'book', label: 'Book' },
    { value: 'course', label: 'Course' },
    { value: 'tool', label: 'Tool' },
    { value: 'service', label: 'Service' },
    { value: 'gift', label: 'Gift' }
  ];

  useEffect(() => {
    loadProducts();
  }, [statusFilter, typeFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let filters = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.product_type = typeFilter;
      
      const data = await productRecommendationService.list(filters, {
        orderBy: { column: 'order_index', ascending: true }
      });
      setProducts(data);
    } catch (error) {
      console.error('Failed to load shop products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let productData = { ...formData };
      
      // Handle column mapping - products table expects 'name' field
      if (productData.title) {
        productData.name = productData.title; // Map title to name for database
      }
      
      // Ensure order_index is a number
      productData.order_index = parseInt(productData.order_index) || 0;
      
      // Handle price formatting - convert empty strings to null
      if (productData.price && productData.price.toString().trim() !== '') {
        productData.price = parseFloat(productData.price.toString().replace('$', ''));
      } else {
        productData.price = null; // Set to null instead of empty string
      }

      if (editingProduct) {
        await productRecommendationService.update(editingProduct.id, productData);
      } else {
        // If no order specified, put at the end
        if (productData.order_index === 0) {
          productData.order_index = products.length + 1;
        }
        await productRecommendationService.create(productData);
      }

      await loadProducts();
      resetForm();
    } catch (error) {
      console.error('Failed to save shop product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      product_type: product.product_type || 'book',
      external_url: product.external_url || '',
      featured_image: product.featured_image || '',
      price: product.price || '',
      author: product.author || '',
      order_index: product.order_index,
      status: product.status,
      featured: product.featured || false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this shop product?')) {
      try {
        await productRecommendationService.delete(productId);
        await loadProducts();
      } catch (error) {
        console.error('Failed to delete shop product:', error);
      }
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await productRecommendationService.update(productId, { status: newStatus });
      await loadProducts();
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  const handleFeaturedToggle = async (productId, featured) => {
    try {
      await productRecommendationService.update(productId, { featured: !featured });
      await loadProducts();
    } catch (error) {
      console.error('Failed to update product featured status:', error);
    }
  };

  const handleReorder = async (productId, direction) => {
    try {
      const productIndex = products.findIndex(p => p.id === productId);
      const product = products[productIndex];
      
      let newOrder;
      if (direction === 'up' && productIndex > 0) {
        newOrder = products[productIndex - 1].order_index;
        await productRecommendationService.update(products[productIndex - 1].id, { 
          order_index: product.order_index 
        });
      } else if (direction === 'down' && productIndex < products.length - 1) {
        newOrder = products[productIndex + 1].order_index;
        await productRecommendationService.update(products[productIndex + 1].id, { 
          order_index: product.order_index 
        });
      } else {
        return;
      }

      await productRecommendationService.update(productId, { order_index: newOrder });
      await loadProducts();
    } catch (error) {
      console.error('Failed to reorder product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      product_type: 'book',
      external_url: '',
      featured_image: '',
      price: '',
      author: '',
      order_index: 0,
      status: 'active',
      featured: false
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      book: { color: 'bg-blue-100 text-blue-800', icon: '📚' },
      course: { color: 'bg-purple-100 text-purple-800', icon: '🎓' },
      tool: { color: 'bg-orange-100 text-orange-800', icon: '🔧' },
      service: { color: 'bg-green-100 text-green-800', icon: '⚙️' },
      gift: { color: 'bg-pink-100 text-pink-800', icon: '🎁' }
    };
    const config = typeConfig[type] || typeConfig.book;
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
          <h2 className="text-2xl font-sacred-bold text-[#2F4F3F]">Shop Products</h2>
          <p className="text-[#6B5B73] font-sacred">
            Manage product recommendations for the Shop page
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#C4756B] hover:bg-[#B86761]">
              <Plus className="w-4 h-4 mr-2" />
              New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-sacred">
                {editingProduct ? 'Edit Shop Product' : 'Create New Shop Product'}
              </DialogTitle>
              <DialogDescription className="font-sacred">
                Add product recommendations to help couples on their sacred journey.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title" className="font-sacred">Product Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter product title..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product_type" className="font-sacred">Type</Label>
                  <Select value={formData.product_type} onValueChange={(value) => setFormData({ ...formData, product_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author" className="font-sacred">Author/Brand</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Author or brand name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="font-sacred">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this product and why you recommend it..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="external_url" className="font-sacred">Purchase URL</Label>
                  <Input
                    id="external_url"
                    type="url"
                    value={formData.external_url}
                    onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                    placeholder="https://example.com/product"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-sacred">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.99"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="featured_image" className="font-sacred">Product Image URL</Label>
                <Input
                  id="featured_image"
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://example.com/product-image.jpg"
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="featured" className="font-sacred">Featured Product</Label>
              </div>
              
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#C4756B] hover:bg-[#B86761]">
                  {editingProduct ? 'Update Product' : 'Create Product'}
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
            placeholder="Search products..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {productTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#C4756B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6B5B73] font-sacred">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-[#C4756B]/50 mx-auto mb-4" />
              <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-2">No Products Found</h3>
              <p className="text-[#6B5B73] font-sacred mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No products match your current filters.' 
                  : 'Create your first shop product to get started.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product, index) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#C4756B]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#C4756B] font-sacred-bold text-sm">{product.order_index}</span>
                      </div>
                      <h3 className="text-lg font-sacred-bold text-[#2F4F3F] line-clamp-1">
                        {product.title}
                      </h3>
                      <div className="flex gap-2">
                        {getTypeBadge(product.product_type)}
                        {getStatusBadge(product.status)}
                        {product.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {product.description && (
                      <p className="text-[#6B5B73] font-sacred text-sm line-clamp-2 ml-11 mb-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-sacred ml-11">
                      {product.author && (
                        <span>By {product.author}</span>
                      )}
                      {product.price && (
                        <span className="flex items-center gap-1 text-green-600">
                          <DollarSign className="w-3 h-3" />
                          {parseFloat(product.price).toFixed(2)}
                        </span>
                      )}
                      {product.external_url && (
                        <a 
                          href={product.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#C4756B] hover:text-[#B86761]"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit
                        </a>
                      )}
                      <span>
                        Created {formatDistanceToNow(new Date(product.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(product.id, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(product.id, 'down')}
                        disabled={index === filteredProducts.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Featured toggle */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeaturedToggle(product.id, product.featured)}
                      className={product.featured ? "text-yellow-600 hover:text-yellow-700" : ""}
                    >
                      <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                    </Button>
                    
                    {/* Status toggle */}
                    {product.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(product.id, 'inactive')}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(product.id, 'active')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
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