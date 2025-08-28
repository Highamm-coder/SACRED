import React, { useState, useEffect } from 'react';
import { blogPostService } from '@/api/services/cms';
import { format } from 'date-fns';
import { Loader2, Calendar, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function BlogPostPage() {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        
        if (!slug) {
          setError('No blog post specified.');
          setIsLoading(false);
          return;
        }

        const post = await blogPostService.getBySlug(slug);
        if (post) {
          console.log('📝 Blog post loaded:', post);
          setPost(post);
        } else {
          setError('Blog post not found.');
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load the blog post.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 text-center">
        <h1 className="text-3xl font-sacred-bold text-[#C4756B] mb-4">
          {error || 'Post Not Found'}
        </h1>
        <p className="text-lg text-[#6B5B73] font-sacred mb-8">
          We couldn't load the article you were looking for. It might have been moved, or there was a problem retrieving it.
        </p>
        <Link to={createPageUrl('Education')}>
          <Button className="bg-[#2F4F3F] hover:bg-[#1F3F2F] text-white font-sacred">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <AuthWrapper requireAuth={true}>
      <div className="bg-white min-h-screen">
        <style jsx global>{`
          .blog-content {
            font-family: 'Inter', system-ui, sans-serif;
          }
          
          .blog-content h1 {
            font-size: 2.25rem;
            font-weight: 700;
            color: #2F4F3F;
            margin-bottom: 1.5rem;
            margin-top: 2.5rem;
            line-height: 1.2;
            font-family: inherit;
          }
          
          .blog-content h2 {
            font-size: 1.875rem;
            font-weight: 600;
            color: #2F4F3F;
            margin-bottom: 1.25rem;
            margin-top: 2rem;
            line-height: 1.3;
            font-family: inherit;
          }
          
          .blog-content h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #2F4F3F;
            margin-bottom: 1rem;
            margin-top: 1.5rem;
            line-height: 1.4;
            font-family: inherit;
          }
          
          .blog-content p {
            font-size: 1.125rem;
            line-height: 1.75;
            color: #6B5B73;
            margin-bottom: 1.5rem;
            font-family: inherit;
          }
          
          .blog-content ul, .blog-content ol {
            margin: 1.5rem 0;
            padding-left: 1.75rem;
            color: #6B5B73;
            font-size: 1.125rem;
            line-height: 1.75;
          }
          
          .blog-content ul {
            list-style-type: disc;
            list-style-position: outside;
          }
          
          .blog-content ol {
            list-style-type: decimal;
            list-style-position: outside;
          }
          
          .blog-content li {
            margin-bottom: 0.75rem;
            display: list-item;
          }
          
          .blog-content a {
            color: #C4756B;
            text-decoration: underline;
            font-weight: 500;
          }
          
          .blog-content a:hover {
            color: #B86761;
          }
          
          .blog-content blockquote {
            border-left: 4px solid #C4756B;
            padding-left: 1.5rem;
            margin: 2rem 0;
            font-style: italic;
            color: #6B5B73;
            font-size: 1.25rem;
            background-color: #F5F1EB;
            padding: 1.5rem;
            border-radius: 0.5rem;
          }
          
          .blog-content strong {
            font-weight: 600;
            color: #2F4F3F;
          }
          
          .blog-content em {
            font-style: italic;
            color: #6B5B73;
          }
          
          .blog-content code {
            background-color: #F5F1EB;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            color: #2F4F3F;
            font-family: 'Monaco', 'Consolas', monospace;
          }
          
          .blog-content pre {
            background-color: #F5F1EB;
            padding: 1.5rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1.5rem 0;
          }
          
          .blog-content pre code {
            background: none;
            padding: 0;
          }
          
          .blog-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 2rem 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
        `}</style>

        {/* Hero Header - Beige Background */}
        <div className="bg-[#F5F1EB] py-12">
          <div className="max-w-4xl mx-auto px-6">
            {/* Back Button */}
            <div className="mb-8">
              <Link to={createPageUrl('Blog')}>
                <Button variant="ghost" className="text-[#6B5B73] hover:bg-white/50 font-sacred">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </div>

            {/* Article Header */}
            <div className="text-center">
              {post.tags && post.tags.length > 0 && (
                <Badge className="bg-[#C4756B] text-white font-sacred text-sm mb-4 capitalize">
                  {post.tags[0]}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-sacred-bold text-[#2F4F3F] leading-tight mb-4">
                {post.title}
              </h1>
              <div className="flex justify-center items-center gap-6 text-[#6B5B73] font-sacred text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{post.author || 'SACRED Team'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.published_at || post.created_at && !isNaN(new Date(post.published_at || post.created_at)) 
                    ? format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')
                    : 'Date unavailable'
                  }</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - White Background */}
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Featured Image */}
            {post.featured_image && (
              <div className="mb-8 rounded-lg overflow-hidden shadow-sm">
                <img 
                  src={post.featured_image} 
                  alt={post.title} 
                  className="w-full h-auto object-cover" 
                  loading="lazy" 
                  decoding="async" 
                />
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <div className="mb-8 text-lg text-[#6B5B73] font-sacred leading-relaxed italic text-center border-b border-[#E6D7C9] pb-8">
                <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
              </div>
            )}

            {/* Blog Content */}
            <div 
              className="blog-content max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Back to Blog */}
            <div className="text-center mt-16 pt-8 border-t border-[#E6D7C9]">
              <Link to={createPageUrl('Blog')}>
                <Button 
                  variant="outline" 
                  className="border-[#C4756B] text-[#C4756B] hover:bg-[#C4756B] hover:text-white font-sacred px-8 py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Posts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}