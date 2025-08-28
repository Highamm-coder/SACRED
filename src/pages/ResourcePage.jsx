import React, { useState, useEffect } from 'react';
import { educationResourceService } from '@/api/services/cms';
import { format } from 'date-fns';
import { Loader2, Calendar, User as UserIcon, ArrowLeft, ExternalLink, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Helper function to format content for better readability
const formatContent = (content) => {
  if (!content) return '';
  
  // If content already contains HTML tags, return as-is
  if (content.includes('<p>') || content.includes('<h1>') || content.includes('<h2>')) {
    return content;
  }
  
  // If it's plain text, format it with proper paragraphs and line breaks
  return content
    .split('\n\n') // Split on double line breaks for paragraphs
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => {
      // Handle single line breaks within paragraphs
      const formattedParagraph = paragraph.replace(/\n/g, '<br />');
      return `<p>${formattedParagraph}</p>`;
    })
    .join('');
};

export default function ResourcePage() {
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        const id = urlParams.get('id'); // fallback for old links
        
        if (!slug && !id) {
          setError('No resource specified.');
          setIsLoading(false);
          return;
        }

        let resourceData;
        if (slug) {
          resourceData = await educationResourceService.getBySlug(slug);
        } else {
          resourceData = await educationResourceService.get(id);
        }

        if (resourceData) {
          console.log('📚 Resource loaded:', resourceData);
          setResource(resourceData);
        } else {
          setError('Resource not found.');
        }
      } catch (err) {
        console.error('Error fetching resource:', err);
        setError('Failed to load the resource.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResource();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#E6D7C9]">
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#E6D7C9]"></div>
                <Loader2 className="w-16 h-16 animate-spin text-[#2F4F3F] absolute top-0 left-0" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-2">Loading Resource</h3>
                <p className="text-sm text-[#6B5B73] font-sacred">Please wait while we fetch your content...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#E6D7C9] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-[#C4756B] to-[#B86761] rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-sacred-bold text-[#2F4F3F] mb-4">
              {error || 'Resource Not Found'}
            </CardTitle>
            <p className="text-lg text-[#6B5B73] font-sacred leading-relaxed">
              We couldn't load the resource you were looking for. It might have been moved, or there was a problem retrieving it.
            </p>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Link to={createPageUrl('Education')}>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#2F4F3F] to-[#1F3F2F] hover:from-[#1F3F2F] hover:to-[#0F2F1F] text-white font-sacred shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Education
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If resource has external URL and no content, redirect to external URL
  if (resource.external_url && !resource.content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#E6D7C9] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <Badge className="bg-gradient-to-r from-[#C4756B] to-[#B86761] text-white font-sacred text-sm mb-6 capitalize shadow-lg">
              {resource.resource_type}
            </Badge>
            <CardTitle className="text-3xl md:text-4xl font-sacred-bold text-[#2F4F3F] mb-4 leading-tight">
              {resource.title}
            </CardTitle>
            <p className="text-lg text-[#6B5B73] font-sacred leading-relaxed">
              This resource is hosted externally. Click the button below to visit it in a new tab.
            </p>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={resource.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#C4756B] to-[#B86761] hover:from-[#B86761] hover:to-[#A85651] text-white rounded-lg font-sacred transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
              >
                <ExternalLink className="w-5 h-5 mr-3" />
                Visit Resource
              </a>
              <Link to={createPageUrl('Education')}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-[#6B5B73] text-[#6B5B73] hover:bg-[#6B5B73] hover:text-white font-sacred transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Education
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .resource-content {
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .resource-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          color: #2F4F3F;
          margin-bottom: 1.5rem;
          margin-top: 2.5rem;
          line-height: 1.2;
          font-family: inherit;
        }
        
        .resource-content h2 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #2F4F3F;
          margin-bottom: 1.25rem;
          margin-top: 2rem;
          line-height: 1.3;
          font-family: inherit;
        }
        
        .resource-content h3 {
          font-size: 1.625rem;
          font-weight: 600;
          color: #2F4F3F;
          margin-bottom: 1.25rem;
          margin-top: 2rem;
          line-height: 1.4;
          font-family: inherit;
        }
        
        .resource-content p {
          font-size: 1.1875rem;
          line-height: 1.8;
          color: #6B5B73;
          margin-bottom: 1.75rem;
          font-family: inherit;
        }
        
        .resource-content ul, .resource-content ol {
          margin: 2rem 0;
          padding-left: 2rem;
          color: #6B5B73;
          font-size: 1.1875rem;
          line-height: 1.8;
        }
        
        .resource-content ul {
          list-style-type: disc;
          list-style-position: outside;
        }
        
        .resource-content ol {
          list-style-type: decimal;
          list-style-position: outside;
        }
        
        .resource-content li {
          margin-bottom: 1rem;
          display: list-item;
          padding-left: 0.5rem;
        }
        
        .resource-content a {
          color: #C4756B;
          text-decoration: underline;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .resource-content a:hover {
          color: #B86761;
          text-decoration-thickness: 2px;
        }
        
        .resource-content blockquote {
          border-left: 5px solid #C4756B;
          margin: 3rem 0;
          font-style: italic;
          color: #6B5B73;
          font-size: 1.375rem;
          background: linear-gradient(135deg, #F5F1EB 0%, #E6D7C9 100%);
          padding: 2rem;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 4px 20px rgba(196, 117, 107, 0.1);
        }
        
        .resource-content blockquote::before {
          content: '"';
          font-size: 4rem;
          color: #C4756B;
          position: absolute;
          top: -0.5rem;
          left: 1rem;
          font-family: serif;
          opacity: 0.3;
        }
        
        .resource-content strong {
          font-weight: 600;
          color: #2F4F3F;
          background: linear-gradient(135deg, rgba(196, 117, 107, 0.1) 0%, rgba(184, 103, 97, 0.1) 100%);
          padding: 0.125rem 0.25rem;
          border-radius: 4px;
        }
        
        .resource-content em {
          font-style: italic;
          color: #6B5B73;
        }
        
        .resource-content code {
          background: linear-gradient(135deg, #F5F1EB 0%, #E6D7C9 100%);
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #2F4F3F;
          font-family: 'Monaco', 'Consolas', monospace;
          border: 1px solid rgba(196, 117, 107, 0.2);
        }
        
        .resource-content pre {
          background: linear-gradient(135deg, #F5F1EB 0%, #E6D7C9 100%);
          padding: 2rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 2rem 0;
          border: 1px solid rgba(196, 117, 107, 0.2);
          box-shadow: 0 4px 20px rgba(196, 117, 107, 0.1);
        }
        
        .resource-content pre code {
          background: none;
          padding: 0;
          border: none;
        }
        
        .resource-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 3rem 0;
          box-shadow: 0 8px 32px rgba(47, 79, 63, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .resource-content img:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(47, 79, 63, 0.2);
        }

        .progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(to right, #C4756B, #B86761);
          z-index: 1000;
          transition: width 0.1s ease;
        }
        
        @media (max-width: 768px) {
          .resource-content h1 {
            font-size: 2rem;
          }
          
          .resource-content h2 {
            font-size: 1.75rem;
          }
          
          .resource-content h3 {
            font-size: 1.5rem;
          }
          
          .resource-content p {
            font-size: 1.125rem;
          }
        }
      `}</style>

      {/* Main Content */}
      <div className="bg-white min-h-screen">
        
        {/* Clean Hero Header */}
        <div className="bg-[#F5F1EB] py-12">
          <div className="max-w-4xl mx-auto px-6">
            {/* Simple Back Button */}
            <div className="mb-8">
              <Link to={createPageUrl('Education')}>
                <Button variant="ghost" className="text-[#6B5B73] hover:bg-white/50 font-sacred">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Education
                </Button>
              </Link>
            </div>

            {/* Clean Resource Header */}
            <div className="text-center">
              <Badge className="bg-[#C4756B] text-white font-sacred text-sm mb-4 capitalize">
                {resource.resource_type}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-sacred-bold text-[#2F4F3F] leading-tight mb-4">
                {resource.title}
              </h1>
              
              <div className="flex justify-center items-center gap-6 text-[#6B5B73] font-sacred text-sm">
                {resource.author && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>{resource.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {resource.created_at && !isNaN(new Date(resource.created_at)) 
                      ? format(new Date(resource.created_at), 'MMMM d, yyyy')
                      : 'Date unavailable'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - White Background */}
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-6 py-12">
            
            {/* Featured Image */}
            {resource.featured_image && (
              <div className="mb-8 rounded-lg overflow-hidden shadow-sm">
                <img 
                  src={resource.featured_image} 
                  alt={resource.title} 
                  className="w-full h-auto object-cover" 
                  loading="lazy" 
                  decoding="async" 
                />
              </div>
            )}

            {/* Resource Description */}
            {resource.description && (
              <div className="mb-8 text-lg text-[#6B5B73] font-sacred leading-relaxed italic text-center border-b border-[#E6D7C9] pb-8">
                <div 
                  className="resource-content"
                  dangerouslySetInnerHTML={{ __html: resource.description }}
                />
              </div>
            )}

            {/* Resource Content */}
            {resource.content && (
              <div 
                className="resource-content max-w-none"
                dangerouslySetInnerHTML={{ __html: resource.content }}
              />
            )}

            {/* External Link */}
            {resource.external_url && (
              <div className="text-center mt-12 pt-8 border-t border-[#E6D7C9]">
                <p className="text-[#6B5B73] font-sacred mb-6">
                  This resource is available on an external website.
                </p>
                <a
                  href={resource.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-[#C4756B] hover:bg-[#B86761] text-white rounded-lg font-sacred transition-colors text-lg"
                >
                  <ExternalLink className="w-5 h-5 mr-3" />
                  Visit Resource
                </a>
              </div>
            )}

            {/* Back to Education */}
            <div className="text-center mt-16 pt-8 border-t border-[#E6D7C9]">
              <Link to={createPageUrl('Education')}>
                <Button 
                  variant="outline" 
                  className="border-[#C4756B] text-[#C4756B] hover:bg-[#C4756B] hover:text-white font-sacred px-8 py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}