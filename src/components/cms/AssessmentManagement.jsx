import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Save,
  Search,
  Move,
  Eye,
  Settings,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { assessmentService } from '@/api/services/assessment';

export default function AssessmentManagement() {
  const [activeTab, setActiveTab] = useState('questions');
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [interpretations, setInterpretations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [questionForm, setQuestionForm] = useState({
    question_id: '',
    section: '',
    question_text: '',
    question_type: 'multiple_choice',
    options: '',
    is_required: true,
    order_index: 0,
    help_text: '',
    scoring_weight: 1.0,
    discussion_question: ''
  });

  const [sectionForm, setSectionForm] = useState({
    section_id: '',
    title: '',
    description: '',
    icon: '',
    order_index: 0,
    instructions: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectionsData, questionsData, interpretationsData] = await Promise.all([
        assessmentService.listSections(),
        assessmentService.listQuestions(),
        assessmentService.listInterpretations()
      ]);
      
      setSections(sectionsData);
      setQuestions(questionsData);
      setInterpretations(interpretationsData);
    } catch (error) {
      console.error('Failed to load assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === 'all' || question.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      let questionData = { ...questionForm };
      
      // Parse options if it's a string
      if (typeof questionData.options === 'string' && questionData.options.trim()) {
        try {
          questionData.options = JSON.parse(questionData.options);
        } catch (e) {
          // If JSON parsing fails, treat as comma-separated values
          const options = questionData.options.split(',').map(opt => opt.trim()).filter(Boolean);
          questionData.options = { options };
        }
      }

      if (editingItem && editingItem.type === 'question') {
        await assessmentService.updateQuestion(editingItem.id, questionData);
      } else {
        await assessmentService.createQuestion(questionData);
      }

      resetForm();
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question. Please try again.');
    }
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.type === 'section') {
        await assessmentService.updateSection(editingItem.id, sectionForm);
      } else {
        await assessmentService.createSection(sectionForm);
      }

      resetForm();
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save section:', error);
      alert('Failed to save section. Please try again.');
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    if (type === 'question') {
      setQuestionForm({
        ...item,
        options: typeof item.options === 'object' ? JSON.stringify(item.options, null, 2) : item.options || ''
      });
    } else if (type === 'section') {
      setSectionForm(item);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      if (type === 'question') {
        await assessmentService.deleteQuestion(id);
      } else if (type === 'section') {
        await assessmentService.deleteSection(id);
      }
      loadData();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      alert(`Failed to delete ${type}. Please try again.`);
    }
  };

  const resetForm = () => {
    setQuestionForm({
      question_id: '',
      section: '',
      question_text: '',
      question_type: 'multiple_choice',
      options: '',
      is_required: true,
      order_index: 0,
      help_text: '',
      scoring_weight: 1.0
    });
    setSectionForm({
      section_id: '',
      title: '',
      description: '',
      icon: '',
      order_index: 0,
      instructions: ''
    });
    setEditingItem(null);
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple_choice': return '☑️';
      case 'scale': return '📊';
      case 'text': return '📝';
      case 'boolean': return '✅';
      case 'ranking': return '🔢';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-8 h-8 border-4 border-[#C4756B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-sacred text-[#2F4F3F] flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Assessment Management
              </CardTitle>
              <CardDescription className="font-sacred">
                Manage assessment questions, sections, and interpretations
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => { resetForm(); setIsDialogOpen(true); }} 
                className="bg-[#C4756B] hover:bg-[#B86761]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#F5F1EB] rounded-lg">
              <div className="text-2xl font-sacred-bold text-[#2F4F3F]">
                {sections.length}
              </div>
              <div className="text-sm text-[#6B5B73] font-sacred">Sections</div>
            </div>
            <div className="text-center p-4 bg-[#F5F1EB] rounded-lg">
              <div className="text-2xl font-sacred-bold text-[#2F4F3F]">
                {questions.length}
              </div>
              <div className="text-sm text-[#6B5B73] font-sacred">Questions</div>
            </div>
            <div className="text-center p-4 bg-[#F5F1EB] rounded-lg">
              <div className="text-2xl font-sacred-bold text-[#2F4F3F]">
                {questions.filter(q => q.is_active).length}
              </div>
              <div className="text-sm text-[#6B5B73] font-sacred">Active Questions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/80">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="interpretations">Interpretations</TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B5B73] w-4 h-4" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section.section_id} value={section.section_id}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredQuestions.length === 0 ? (
                <div className="p-8 text-center text-[#6B5B73] font-sacred">
                  No questions found matching your criteria.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredQuestions.map((question) => (
                    <div key={question.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {question.question_id}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {question.section}
                            </Badge>
                            <span className="text-lg">{getQuestionTypeIcon(question.question_type)}</span>
                            <span className="text-xs text-[#6B5B73]">{question.question_type}</span>
                            {!question.is_active && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-sacred text-[#2F4F3F] mb-2">
                            {question.question_text}
                          </h3>
                          
                          {question.help_text && (
                            <p className="text-sm text-[#6B5B73] font-sacred mb-2">
                              💡 {question.help_text}
                            </p>
                          )}
                          
                          {question.discussion_question && (
                            <p className="text-sm text-[#C4756B] font-sacred mb-2 p-2 bg-[#F5F1EB] rounded">
                              💬 Discussion: {question.discussion_question}
                            </p>
                          )}
                          
                          {question.options && (
                            <div className="text-sm text-[#6B5B73] font-sacred">
                              Options: {JSON.stringify(question.options)}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-[#6B5B73] font-sacred mt-2">
                            <span>Order: {question.order_index}</span>
                            <span>Weight: {question.scoring_weight}</span>
                            {question.is_required && <span>Required</span>}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(question, 'question')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(question.id, 'question')}
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
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {sections.map((section) => (
                  <div key={section.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{section.section_id}</Badge>
                          <span className="text-lg">{section.icon}</span>
                        </div>
                        <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-2">
                          {section.title}
                        </h3>
                        <p className="text-[#6B5B73] font-sacred mb-2">
                          {section.description}
                        </p>
                        {section.instructions && (
                          <p className="text-sm text-[#6B5B73] font-sacred">
                            Instructions: {section.instructions}
                          </p>
                        )}
                        <div className="text-xs text-[#6B5B73] font-sacred mt-2">
                          Order: {section.order_index} • 
                          Questions: {questions.filter(q => q.section === section.section_id).length}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(section, 'section')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(section.id, 'section')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interpretations Tab */}
        <TabsContent value="interpretations" className="space-y-4">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-[#6B5B73] font-sacred mb-4">
                  Assessment interpretations management coming soon...
                </p>
                <p className="text-sm text-[#6B5B73] font-sacred">
                  This will allow you to set score ranges and their interpretations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-sacred text-[#2F4F3F]">
              {editingItem ? 
                `Edit ${editingItem.type === 'question' ? 'Question' : 'Section'}` : 
                `Add New ${activeTab === 'questions' ? 'Question' : 'Section'}`
              }
            </DialogTitle>
          </DialogHeader>
          
          {/* Question Form */}
          {(activeTab === 'questions' || editingItem?.type === 'question') && (
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Question ID *</Label>
                  <Input
                    value={questionForm.question_id}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, question_id: e.target.value }))}
                    placeholder="Q1, Q2A, etc."
                    required
                  />
                </div>
                <div>
                  <Label>Section *</Label>
                  <Select 
                    value={questionForm.section} 
                    onValueChange={(value) => setQuestionForm(prev => ({ ...prev, section: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.section_id} value={section.section_id}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Question Text *</Label>
                <Textarea
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, question_text: e.target.value }))}
                  placeholder="Enter the question text"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Question Type</Label>
                  <Select 
                    value={questionForm.question_type} 
                    onValueChange={(value) => setQuestionForm(prev => ({ ...prev, question_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="scale">Scale (1-10)</SelectItem>
                      <SelectItem value="text">Text Input</SelectItem>
                      <SelectItem value="boolean">Yes/No</SelectItem>
                      <SelectItem value="ranking">Ranking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Order Index</Label>
                  <Input
                    type="number"
                    value={questionForm.order_index}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              {questionForm.question_type === 'multiple_choice' && (
                <div>
                  <Label>Options (JSON or comma-separated)</Label>
                  <Textarea
                    value={questionForm.options}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, options: e.target.value }))}
                    placeholder='{"options": ["Option 1", "Option 2"]} or Option 1, Option 2, Option 3'
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label>Help Text (optional)</Label>
                <Input
                  value={questionForm.help_text}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, help_text: e.target.value }))}
                  placeholder="Additional explanation or context"
                />
              </div>

              <div>
                <Label>Discussion Question for Misalignments (optional)</Label>
                <Textarea
                  value={questionForm.discussion_question}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, discussion_question: e.target.value }))}
                  placeholder="Question to ask couples when they give different answers to this question..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This question helps couples discuss their differences when they answer this question differently.
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={questionForm.is_required}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, is_required: e.target.checked }))}
                  />
                  <Label htmlFor="required">Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="weight">Scoring Weight:</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={questionForm.scoring_weight}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, scoring_weight: parseFloat(e.target.value) }))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#C4756B] hover:bg-[#B86761]">
                  <Save className="w-4 h-4 mr-2" />
                  Save Question
                </Button>
              </div>
            </form>
          )}

          {/* Section Form */}
          {(activeTab === 'sections' || editingItem?.type === 'section') && (
            <form onSubmit={handleSaveSection} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Section ID *</Label>
                  <Input
                    value={sectionForm.section_id}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, section_id: e.target.value }))}
                    placeholder="expectations, communication, etc."
                    required
                  />
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Section Title"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this section"
                  rows={2}
                />
              </div>

              <div>
                <Label>Instructions</Label>
                <Textarea
                  value={sectionForm.instructions}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Instructions shown to users before this section"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Icon (emoji or text)</Label>
                  <Input
                    value={sectionForm.icon}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="💕, ⭐, etc."
                  />
                </div>
                <div>
                  <Label>Order Index</Label>
                  <Input
                    type="number"
                    value={sectionForm.order_index}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#C4756B] hover:bg-[#B86761]">
                  <Save className="w-4 h-4 mr-2" />
                  Save Section
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}