
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogPostService } from '@/api/services/cms';
import { format } from 'date-fns';
import { Loader2, Calendar, User as UserIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import AuthWrapper from '../components/auth/AuthWrapper';

// Helper function to strip HTML tags and get clean text
const stripHtmlTags = (html) => {
  if (!html) return '';
  
  try {
    // Create a temporary div element to decode HTML entities
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get the text content which automatically strips HTML tags
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up any remaining whitespace
    return textContent
      .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
      .trim();                 // Remove leading/trailing whitespace
  } catch (error) {
    // Fallback: use regex-based approach
    return html
      .replace(/<[^>]*>/g, '')  // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Remove HTML entities
      .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
      .trim();                  // Remove leading/trailing whitespace
  }
};

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', label: 'All Posts' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'intimacy', label: 'Intimacy' },
    { id: 'marriage', label: 'Marriage' },
    { id: 'faith', label: 'Faith & Values' },
    { id: 'guidance', label: 'Guidance' }
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await blogPostService.listPublished();
        setPosts(allPosts);
        setFilteredPosts(allPosts);
        
        // Set featured post as the first one or find one marked as featured
        const featured = allPosts.find(post => post.featured) || allPosts[0];
        setFeaturedPost(featured);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => 
        post.category?.toLowerCase() === activeCategory || 
        post.tags?.includes(activeCategory)
      ));
    }
  }, [activeCategory, posts]);

  if (isLoading) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
        </div>
      </AuthWrapper>
    );
  }

  if (error) {
    return (
      <AuthWrapper requireAuth={true}>
        <div className="max-w-4xl mx-auto py-12 px-6 text-center">
          <h1 className="text-3xl font-sacred-bold text-[#C4756B] mb-4">
            {error}
          </h1>
          <p className="text-lg text-[#6B5B73] font-sacred">
            We couldn't load the blog posts. Please try again later.
          </p>
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
              The SACRED Blog
            </h1>
            <p className="text-lg text-[#6B5B73] font-sacred">
              Biblical wisdom and practical guidance for your sacred journey together
            </p>
            
            {/* Category Navigation */}
            <div className="flex justify-center items-center gap-6 mt-8 flex-wrap">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-sacred transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-[#C4756B] text-white' 
                      : 'bg-white text-[#6B5B73] hover:bg-[#E6D7C9] hover:text-[#2F4F3F]'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area - White Background */}
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-6 py-12">

            {/* Featured Article */}
            {featuredPost && (
              <div className="mb-16 pb-8 border-b border-[#E6D7C9]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Featured Image */}
                  <div className="lg:col-span-1">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#F5F1EB]">
                      {featuredPost.featured_image ? (
                        <img 
                          src={featuredPost.featured_image} 
                          alt={featuredPost.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#2F4F3F] to-[#C4756B] flex items-center justify-center">
                          <span className="text-white text-xl font-sacred">SACRED</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Article Info */}
                  <div className="lg:col-span-2 space-y-4">
                    <Badge className="bg-[#C4756B] text-white font-sacred">Featured</Badge>
                    
                    <h2 className="text-2xl md:text-3xl font-sacred-bold text-[#2F4F3F] leading-tight">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-[#6B5B73] font-sacred leading-relaxed">
                      {(() => {
                        const excerptText = stripHtmlTags(featuredPost.excerpt);
                        const contentText = stripHtmlTags(featuredPost.content);
                        const text = excerptText || contentText;
                        return text ? text.substring(0, 200) + (text.length > 200 ? '...' : '') : 'No preview available';
                      })()}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-[#6B5B73] font-sacred">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        <span>{featuredPost.author || 'SACRED Team'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(featuredPost.published_at || featuredPost.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <Link 
                      to={createPageUrl(`BlogPost?slug=${featuredPost.slug}`)}
                      className="inline-block bg-[#C4756B] text-white px-6 py-3 rounded-lg hover:bg-[#B86761] transition-colors font-sacred"
                    >
                      Read Full Article
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Posts Grid */}
            {filteredPosts.filter(post => post.id !== featuredPost?.id).length > 0 && (
              <div>
                <h3 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-8">Recent Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredPosts
                    .filter(post => post.id !== featuredPost?.id)
                    .slice(0, 6)
                    .map((post) => (
                    <Link 
                      key={post.id}
                      to={createPageUrl(`BlogPost?slug=${post.slug}`)}
                      className="group block bg-white border border-[#E6D7C9] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <article>
                        <div className="aspect-video bg-[#F5F1EB] overflow-hidden">
                          {post.featured_image ? (
                            <img 
                              src={post.featured_image} 
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#2F4F3F] to-[#C4756B] flex items-center justify-center">
                              <span className="text-white font-sacred">SACRED</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6 space-y-3">
                          <div className="text-sm text-[#6B5B73] font-sacred">
                            {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
                          </div>
                          
                          <h3 className="text-xl font-sacred-bold text-[#2F4F3F] group-hover:text-[#C4756B] transition-colors">
                            {post.title}
                          </h3>
                          
                          <p className="text-[#6B5B73] font-sacred text-sm line-clamp-3">
                            {(() => {
                              const excerptText = stripHtmlTags(post.excerpt);
                              const contentText = stripHtmlTags(post.content);
                              const text = excerptText || contentText;
                              return text ? text.substring(0, 120) + (text.length > 120 ? '...' : '') : 'No preview available';
                            })()}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs text-[#6B5B73] font-sacred">
                            <UserIcon className="w-3 h-3" />
                            <span>{post.author || 'SACRED Team'}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Posts State */}
            {posts.length === 0 && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-[#F5F1EB] rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">Coming Soon</h3>
                  <p className="text-[#6B5B73] font-sacred text-lg mb-6">
                    We're carefully crafting thoughtful articles to help couples on their sacred journey.
                  </p>
                  <p className="text-[#6B5B73] font-sacred">
                    Check back soon for biblical wisdom and practical guidance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
