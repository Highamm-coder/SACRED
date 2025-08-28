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
  Heart,
  ArrowUp,
  ArrowDown,
  Check,
  X
} from 'lucide-react';
import { reflectionQuestionsService } from '@/api/services/cms';
import { formatDistanceToNow } from 'date-fns';

export default function ReflectionManagement() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    order_index: 0,
    status: 'draft'
  });

  useEffect(() => {
    loadQuestions();
  }, [statusFilter]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await reflectionQuestionsService.list(filters, {
        orderBy: { column: 'order_index', ascending: true }
      });
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load reflection questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let questionData = { ...formData };
      
      // Ensure order_index is a number
      questionData.order_index = parseInt(questionData.order_index) || 0;

      if (editingQuestion) {
        await reflectionQuestionsService.update(editingQuestion.id, questionData);
      } else {
        // If no order specified, put at the end
        if (questionData.order_index === 0) {
          questionData.order_index = questions.length + 1;
        }
        await reflectionQuestionsService.create(questionData);
      }

      await loadQuestions();
      resetForm();
    } catch (error) {
      console.error('Failed to save reflection question:', error);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      content: question.content || '',
      order_index: question.order_index,
      status: question.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this reflection question?')) {
      try {
        await reflectionQuestionsService.delete(questionId);
        await loadQuestions();
      } catch (error) {
        console.error('Failed to delete reflection question:', error);
      }
    }
  };

  const handleStatusChange = async (questionId, newStatus) => {
    try {
      if (newStatus === 'published') {
        await reflectionQuestionsService.publish(questionId);
      } else {
        await reflectionQuestionsService.unpublish(questionId);
      }
      await loadQuestions();
    } catch (error) {
      console.error('Failed to update question status:', error);
    }
  };

  const handleReorder = async (questionId, direction) => {
    try {
      const questionIndex = questions.findIndex(q => q.id === questionId);
      const question = questions[questionIndex];
      
      let newOrder;
      if (direction === 'up' && questionIndex > 0) {
        newOrder = questions[questionIndex - 1].order_index;
        await reflectionQuestionsService.update(questions[questionIndex - 1].id, { 
          order_index: question.order_index 
        });
      } else if (direction === 'down' && questionIndex < questions.length - 1) {
        newOrder = questions[questionIndex + 1].order_index;
        await reflectionQuestionsService.update(questions[questionIndex + 1].id, { 
          order_index: question.order_index 
        });
      } else {
        return;
      }

      await reflectionQuestionsService.update(questionId, { order_index: newOrder });
      await loadQuestions();
    } catch (error) {
      console.error('Failed to reorder question:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      order_index: 0,
      status: 'draft'
    });
    setEditingQuestion(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-sacred-bold text-[#2F4F3F]">Reflection Questions</h2>
          <p className="text-[#6B5B73] font-sacred">
            Manage thoughtful questions for Sacred Reflections
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#C4756B] hover:bg-[#B86761]">
              <Plus className="w-4 h-4 mr-2" />
              New Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-sacred">
                {editingQuestion ? 'Edit Reflection Question' : 'Create New Reflection Question'}
              </DialogTitle>
              <DialogDescription className="font-sacred">
                Create meaningful questions to guide couples in their sacred journey.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-sacred">Question Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter the reflection question..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content" className="font-sacred">Description (Optional)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Add context or guidance for this question..."
                  rows={4}
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
                  {editingQuestion ? 'Update Question' : 'Create Question'}
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
            placeholder="Search questions..."
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
            <SelectItem value="all">All Questions</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#C4756B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6B5B73] font-sacred">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Heart className="w-12 h-12 text-[#C4756B]/50 mx-auto mb-4" />
              <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-2">No Questions Found</h3>
              <p className="text-[#6B5B73] font-sacred mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No questions match your current filters.' 
                  : 'Create your first reflection question to get started.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question, index) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#C4756B]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#C4756B] font-sacred-bold text-sm">{question.order_index}</span>
                      </div>
                      <h3 className="text-lg font-sacred-bold text-[#2F4F3F] line-clamp-1">
                        {question.title}
                      </h3>
                      {getStatusBadge(question.status)}
                    </div>
                    
                    {question.content && (
                      <p className="text-[#6B5B73] font-sacred text-sm line-clamp-2 ml-11">
                        {question.content}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-sacred mt-3 ml-11">
                      <span>
                        Created {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                      </span>
                      {question.updated_at !== question.created_at && (
                        <span>
                          Updated {formatDistanceToNow(new Date(question.updated_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(question.id, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(question.id, 'down')}
                        disabled={index === filteredQuestions.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Status toggle */}
                    {question.status === 'published' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(question.id, 'draft')}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(question.id, 'published')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(question.id)}
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