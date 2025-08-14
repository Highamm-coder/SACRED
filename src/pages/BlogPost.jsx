import React, { useState, useEffect } from 'react';
import { BlogPost } from '@/api/entities';
// Removed ReactMarkdown - content is stored as HTML, not Markdown
import { format } from 'date-fns';
import { Loader2, Calendar, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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

        const posts = await BlogPost.filter({ slug: slug });
        if (posts.length > 0) {
          console.log('📝 Blog post loaded:', posts[0]);
          setPost(posts[0]);
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
    <div className="bg-[#F5F1EB] py-12">
       <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
          .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0.08em; }
          .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 400; letter-spacing: 0.08em; }
          .prose-sacred h1, .prose-sacred h2, .prose-sacred h3 {
            font-family: 'Cormorant Garamond', serif;
            font-weight: 400;
            color: #2F4F3F;
          }
          .prose-sacred p, .prose-sacred li {
            font-family: 'Cormorant Garamond', serif;
            font-weight: 300;
            font-size: 1.125rem;
            line-height: 1.8;
            color: #6B5B73;
          }
          .prose-sacred a {
            color: #C4756B;
            text-decoration: underline;
          }
          .prose-sacred blockquote {
            border-left-color: #C4756B;
            font-style: italic;
            color: #6B5B73;
          }
        `
      }} />
      
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <Link to={createPageUrl('Education')}>
          <Button variant="ghost" className="text-[#6B5B73] hover:bg-black/5 font-sacred">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-6">
        <header className="mb-8 text-center">
          <Badge variant="outline" className="border-[#C4756B] text-[#C4756B] text-sm font-sacred mb-4 capitalize">
            {post.category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-sacred-bold text-[#2F4F3F] leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex justify-center items-center gap-6 text-[#6B5B73] font-sacred">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>{post.author || post.author_name || 'SACRED Team'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.created_at && !isNaN(new Date(post.created_at)) 
                ? format(new Date(post.created_at), 'MMMM d, yyyy')
                : 'Date unavailable'
              }</span>
            </div>
          </div>
        </header>

        {post.featured_image && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg aspect-video">
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </div>
        )}

        <div 
            className="bg-white rounded-2xl shadow-sm border border-[#E6D7C9] p-8 md:p-12 prose-sacred max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}