
import React, { useState, useEffect } from 'react';
import { educationResourceService } from '@/api/services/cms';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Calendar, User as UserIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function EducationPage() {
  const [allResources, setAllResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Generate dynamic categories based on available resources
  const getAvailableCategories = () => {
    const resourceTypes = [...new Set(allResources.map(resource => resource.resource_type))];
    const dynamicCategories = [{ id: 'all', label: 'All' }];
    
    resourceTypes.forEach(type => {
      if (type) {
        const label = type.charAt(0).toUpperCase() + type.slice(1) + 's';
        dynamicCategories.push({ id: type, label });
      }
    });
    
    return dynamicCategories;
  };

  const categories = getAvailableCategories();

  useEffect(() => {
    const loadResources = async () => {
      try {
        const resources = await educationResourceService.listPublished();
        setAllResources(resources);
        setFilteredResources(resources);
      } catch (error) {
        console.error('Error loading education resources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();
  }, []);

  useEffect(() => {
    let filtered = allResources;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(resource => resource.resource_type === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.resource_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredResources(filtered);
  }, [activeCategory, searchTerm, allResources]);

  if (isLoading) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true}>
      <div className="bg-white min-h-screen">
        {/* Hero Header - Beige Background */}
        <div className="bg-[#F5F1EB] py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-sacred-bold text-[#2F4F3F] mb-4">
              Education & Resources
            </h1>
            <p className="text-lg text-[#6B5B73] font-sacred">
              Thoughtful articles, videos, and resources to help you prepare for the beautiful gift of marital intimacy
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B5B73]" />
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border-2 border-white/50 rounded-full bg-white/90 backdrop-blur-sm text-[#2F4F3F] placeholder-[#6B5B73] focus:border-[#C4756B] focus:ring-0 font-sacred"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - White Background */}
        <div className="bg-white">
          <div className="max-w-6xl mx-auto px-6 py-12">
            
            {/* Category Navigation - Only show if there are resources and multiple categories */}
            {categories.length > 1 && (
              <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-full font-sacred transition-colors ${
                      activeCategory === category.id 
                        ? 'bg-[#C4756B] text-white' 
                        : 'bg-gray-100 text-[#6B5B73] hover:bg-[#E6D7C9] hover:text-[#2F4F3F]'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}
        
            {/* Education Resources Grid */}
            {allResources.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-[#F5F1EB] rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">Coming Soon</h3>
                  <p className="text-[#6B5B73] font-sacred text-lg mb-6">
                    We're carefully crafting thoughtful resources to help you prepare for the beautiful gift of marital intimacy.
                  </p>
                  <p className="text-[#6B5B73] font-sacred">
                    Check back soon for biblical wisdom and practical guidance.
                  </p>
                </div>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-[#F5F1EB] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-[#6B5B73]" />
                  </div>
                  <h3 className="text-xl font-sacred-bold text-[#2F4F3F] mb-2">No Resources Found</h3>
                  <p className="text-[#6B5B73] font-sacred mb-4">
                    {searchTerm 
                      ? `No resources match "${searchTerm}" in the ${activeCategory === 'all' ? 'selected' : activeCategory} category.`
                      : `No resources found in the ${activeCategory} category.`
                    }
                  </p>
                  {(searchTerm || activeCategory !== 'all') && (
                    <div className="flex gap-2 justify-center">
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="px-4 py-2 text-sm bg-[#C4756B] text-white rounded-full hover:bg-[#B86761] transition-colors font-sacred"
                        >
                          Clear Search
                        </button>
                      )}
                      {activeCategory !== 'all' && (
                        <button
                          onClick={() => setActiveCategory('all')}
                          className="px-4 py-2 text-sm border border-[#C4756B] text-[#C4756B] rounded-full hover:bg-[#C4756B] hover:text-white transition-colors font-sacred"
                        >
                          View All Categories
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.map((resource) => (
                  <Link 
                    key={resource.id}
                    to={createPageUrl(`ResourcePage?slug=${resource.slug}`)}
                    className="group block bg-white border border-[#E6D7C9] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <article>
                      <div className="aspect-video bg-[#F5F1EB] overflow-hidden">
                        {resource.featured_image ? (
                          <img
                            src={resource.featured_image}
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#2F4F3F] to-[#C4756B] flex items-center justify-center">
                            <span className="text-white font-sacred text-xl">📚</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 space-y-3">
                        <Badge className="bg-[#C4756B] text-white font-sacred text-xs capitalize">
                          {resource.resource_type}
                        </Badge>
                        
                        <h3 className="text-xl font-sacred-bold text-[#2F4F3F] group-hover:text-[#C4756B] transition-colors">
                          {resource.title}
                        </h3>
                        
                        <p className="text-[#6B5B73] font-sacred text-sm line-clamp-3">
                          {resource.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-[#6B5B73] font-sacred">
                          {resource.author && (
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3" />
                              <span>{resource.author}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(resource.published_at || resource.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
