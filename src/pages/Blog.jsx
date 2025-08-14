
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPostService } from '@/api/services/cms';
import { format } from 'date-fns';
import { Loader2, Calendar, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function BlogPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        // If no slug provided, show blog listing instead
        setError('Loading blog posts...');
        setIsLoading(false);
        return;
      }
      try {
        const fetchedPost = await blogPostService.getBySlug(slug);
        if (fetchedPost && fetchedPost.status === 'published') {
          setPost(fetchedPost);
        } else {
          setError('Blog post not found or not published.');
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Blog post not found.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

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
        <p className="text-lg text-[#6B5B73] font-sacred">
          We couldn't load the article you were looking for. It might have been moved, or there was a problem retrieving it.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F1EB] py-12">
      <style>{`
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
      `}</style>
      <article className="max-w-4xl mx-auto px-6">
        {/* Back to Blog List */}
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <header className="mb-8 text-center">
          {post.tags && post.tags.length > 0 && (
            <div className="mb-4">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="border-[#C4756B] text-[#C4756B] text-sm font-sacred mr-2 capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-sacred-bold text-[#2F4F3F] leading-tight mb-4">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-lg text-[#6B5B73] font-sacred mb-6 max-w-2xl mx-auto">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex justify-center items-center gap-6 text-[#6B5B73] font-sacred">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>SACRED Team</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}</span>
            </div>
          </div>
        </header>

        {post.featured_image && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg aspect-video">
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-[#E6D7C9] p-8 md:p-12">
          <div className="prose-sacred max-w-none" dangerouslySetInnerHTML={{__html: post.content}} />
        </div>
      </article>
    </div>
  );
}
