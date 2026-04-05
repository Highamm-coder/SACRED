import React, { useState, useEffect } from 'react';
import { educationResourceService } from '@/api/services/cms';
import { format } from 'date-fns';
import { Loader2, Calendar, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SITE_URL = 'https://www.sacredonline.co';
const DEFAULT_OG_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cbf682a54_priscilla-du-preez-Wxhsx3X10OA-unsplash.jpg';

// Replace any h1 tags in rich-text content with h2 — the post title is the only H1
function sanitizeContent(html) {
  if (!html) return '';
  return html
    .replace(/<h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');
}

// Inject per-post meta tags into document.head
function setMeta(post) {
  const seoTitle = post.seo_title || `${post.title} | SACRED`;
  const seoDesc = post.seo_description || '';
  const ogImage = post.featured_image || DEFAULT_OG_IMAGE;
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const publishedAt = post.published_at || post.created_at;

  document.title = seoTitle;

  const set = (attr, key, val) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
    el.setAttribute('content', val);
  };

  set('name', 'description', seoDesc);
  set('property', 'og:type', 'article');
  set('property', 'og:url', canonicalUrl);
  set('property', 'og:title', seoTitle);
  set('property', 'og:description', seoDesc);
  set('property', 'og:image', ogImage);
  set('property', 'og:site_name', 'SACRED');
  set('name', 'twitter:card', 'summary_large_image');
  set('name', 'twitter:title', seoTitle);
  set('name', 'twitter:description', seoDesc);
  set('name', 'twitter:image', ogImage);
  if (publishedAt) set('property', 'article:published_time', publishedAt);
  if (post.updated_at) set('property', 'article:modified_time', post.updated_at);

  // Canonical
  let canon = document.querySelector('link[rel="canonical"]');
  if (!canon) { canon = document.createElement('link'); canon.setAttribute('rel', 'canonical'); document.head.appendChild(canon); }
  canon.setAttribute('href', canonicalUrl);

  // JSON-LD schema
  const schemaId = 'sacred-article-schema';
  let schemaEl = document.getElementById(schemaId);
  if (!schemaEl) { schemaEl = document.createElement('script'); schemaEl.id = schemaId; schemaEl.type = 'application/ld+json'; document.head.appendChild(schemaEl); }
  schemaEl.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: seoDesc,
    image: ogImage,
    author: { '@type': 'Person', name: post.author || 'Matt Higham' },
    publisher: { '@type': 'Organization', name: 'SACRED', url: SITE_URL },
    datePublished: publishedAt,
    dateModified: post.updated_at || publishedAt,
    url: canonicalUrl,
  });
}

export default function ResourcePage() {
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Support both /blog/:slug (React Router param) and ?slug= (legacy query param)
  const params = useParams();

  useEffect(() => {
    const fetch = async () => {
      try {
        const slug = params.slug || new URLSearchParams(window.location.search).get('slug');
        const id = new URLSearchParams(window.location.search).get('id');

        if (!slug && !id) { setError('No article specified.'); setIsLoading(false); return; }

        const data = slug
          ? await educationResourceService.getBySlug(slug)
          : await educationResourceService.get(id);

        if (data) {
          setResource(data);
          setMeta(data);
        } else {
          setError('Article not found.');
        }
      } catch {
        setError('Failed to load the article.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[#F5F1EB] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[#6B5B73] font-sacred text-lg">{error || 'Article not found'}</p>
        <Link to="/blog" className="text-[#C4756B] font-sacred-bold hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to all articles
        </Link>
      </div>
    );
  }

  const publishedAt = resource.published_at || resource.created_at;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
        .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; }
        .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 600; }
        .font-sacred-medium { font-family: 'Cormorant Garamond', serif; font-weight: 500; }
        .post-content h2 { font-size: 1.75rem; font-weight: 600; color: #2F4F3F; margin: 2.5rem 0 1rem; line-height: 1.2; font-family: 'Cormorant Garamond', serif; }
        .post-content h3 { font-size: 1.4rem; font-weight: 600; color: #2F4F3F; margin: 2rem 0 0.75rem; font-family: 'Cormorant Garamond', serif; }
        .post-content p { font-size: 1.15rem; line-height: 1.85; color: #6B5B73; margin-bottom: 1.5rem; font-family: 'Cormorant Garamond', serif; }
        .post-content ul, .post-content ol { padding-left: 1.75rem; margin-bottom: 1.5rem; color: #6B5B73; font-size: 1.15rem; line-height: 1.85; font-family: 'Cormorant Garamond', serif; }
        .post-content ul { list-style-type: disc; }
        .post-content ol { list-style-type: decimal; }
        .post-content li { margin-bottom: 0.6rem; }
        .post-content blockquote { border-left: 4px solid #C4756B; padding: 1rem 1.5rem; margin: 2rem 0; background: #fff; border-radius: 0 8px 8px 0; font-style: italic; font-size: 1.2rem; color: #6B5B73; font-family: 'Cormorant Garamond', serif; }
        .post-content strong { font-weight: 600; color: #2F4F3F; }
        .post-content a { color: #C4756B; text-decoration: underline; }
        .post-content img { max-width: 100%; border-radius: 8px; margin: 2rem 0; }
      `}</style>

      <div style={{ background: '#141E16' }}>
        {/* Hero */}
        <div className="pt-16 pb-14 px-6 md:px-10">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 font-sacred text-sm mb-10 transition-colors">
              <ArrowLeft className="w-4 h-4" /> All articles
            </Link>

            <span className="font-sacred-bold text-[#C4756B] text-xs tracking-[0.22em] uppercase block mb-4 capitalize">
              {resource.resource_type || 'Article'}
            </span>

            {/* Single H1 on this page */}
            <h1
              className="font-sacred-medium italic text-white leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
            >
              {resource.title}
            </h1>

            <div className="flex items-center gap-6 text-white/40 font-sacred text-sm">
              {resource.author && (
                <span className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  {resource.author}
                </span>
              )}
              {publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(publishedAt), 'MMMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured image — bridges dark/cream */}
      {resource.featured_image && (
        <div className="max-w-3xl mx-auto px-6 md:px-10 -mt-6 mb-10 relative z-10">
          <img
            src={resource.featured_image}
            alt={resource.title}
            className="w-full rounded-xl shadow-xl"
            loading="eager"
          />
        </div>
      )}

      {/* Body */}
      <div style={{ background: '#F5F1EB' }} className={resource.featured_image ? '' : 'pt-10'}>
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 pb-20">
          {/* Description (intro) */}
          {resource.description && (
            <div
              className="font-sacred text-xl italic text-[#6B5B73] leading-relaxed border-b border-[#E6D7C9] pb-8 mb-10"
              dangerouslySetInnerHTML={{ __html: sanitizeContent(resource.description) }}
            />
          )}

          {/* Main content */}
          {resource.content && (
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: sanitizeContent(resource.content) }}
            />
          )}

          {resource.external_url && (
            <div className="text-center mt-12 pt-8 border-t border-[#E6D7C9]">
              <a
                href={resource.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-3 bg-[#C4756B] hover:bg-[#B86761] text-white rounded-full font-sacred-bold transition-colors"
              >
                Visit resource →
              </a>
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-[#E6D7C9]">
            <Link to="/blog" className="inline-flex items-center gap-2 text-[#C4756B] font-sacred-bold hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to all articles
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
