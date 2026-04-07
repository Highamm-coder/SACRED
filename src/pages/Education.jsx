import React, { useState, useEffect, useRef } from 'react';
import { educationResourceService } from '@/api/services/cms';
import { User } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, User as UserIcon, Search, ArrowRight, X } from 'lucide-react';
import { format } from 'date-fns';

const stripHtmlTags = (html) => {
  if (!html) return '';
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || tempDiv.innerText || '')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
  }
};

function FeaturedCard({ resource }) {
  const excerpt = stripHtmlTags(resource.description);
  return (
    <Link
      to={`/blog/${resource.slug}`}
      className="group block"
    >
      <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl" style={{ background: '#1E2D22' }}>
        <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
          {resource.featured_image ? (
            <img
              src={resource.featured_image}
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full min-h-[240px]" style={{ background: 'linear-gradient(135deg, #2F4F3F, #7A5E63)' }} />
          )}
        </div>
        <div className="flex flex-col justify-center p-8 md:p-12">
          <span className="font-sacred-bold text-[#C4756B] text-xs tracking-[0.2em] uppercase mb-4 capitalize">
            {resource.resource_type}
          </span>
          <h2 className="font-sacred-medium text-white leading-[1.1] mb-4 group-hover:text-[#E6D7C9] transition-colors"
            style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)' }}>
            {resource.title}
          </h2>
          {excerpt && (
            <p className="text-white/60 font-sacred leading-relaxed mb-6 line-clamp-3">
              {excerpt.substring(0, 180)}{excerpt.length > 180 ? '…' : ''}
            </p>
          )}
          <div className="flex items-center gap-4 text-white/40 font-sacred text-sm mb-6">
            {resource.author && (
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                {resource.author}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(resource.published_at || resource.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          <span className="inline-flex items-center gap-2 text-[#C4756B] font-sacred-bold text-sm group-hover:gap-3 transition-all">
            Read article <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ resource }) {
  const excerpt = stripHtmlTags(resource.description);
  return (
    <Link
      to={`/blog/${resource.slug}`}
      className="group block"
    >
      <div className="overflow-hidden rounded-xl border border-[#E6D7C9] bg-white hover:shadow-md transition-shadow duration-300">
        <div className="aspect-[16/9] overflow-hidden bg-[#F5F1EB]">
          {resource.featured_image ? (
            <img
              src={resource.featured_image}
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #2F4F3F22, #C4756B22)' }} />
          )}
        </div>
        <div className="p-6">
          <span className="font-sacred-bold text-[#C4756B] text-xs tracking-[0.18em] uppercase capitalize">
            {resource.resource_type}
          </span>
          <h3 className="font-sacred-medium text-[#2F4F3F] mt-2 mb-3 leading-[1.2] group-hover:text-[#C4756B] transition-colors"
            style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)' }}>
            {resource.title}
          </h3>
          {excerpt && (
            <p className="text-[#6B5B73] font-sacred text-sm leading-relaxed line-clamp-2 mb-4">
              {excerpt.substring(0, 120)}{excerpt.length > 120 ? '…' : ''}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#6B5B73]/70 font-sacred">
              {resource.author && <span>{resource.author}</span>}
              <span>{format(new Date(resource.published_at || resource.created_at), 'MMM d, yyyy')}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#C4756B] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function EducationPage() {
  const [allResources, setAllResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const headerRef = useRef(null);

  useEffect(() => {
    User.me().then(setUser).catch(() => {}); // silent — page is public
  }, []);

  // Nav scroll behaviour — same as Landing
  useEffect(() => {
    const onScroll = () => {
      if (headerRef.current) {
        const scrolled = window.scrollY > 60;
        headerRef.current.classList.toggle('nav-scrolled', scrolled);
        headerRef.current.classList.toggle('nav-at-top', !scrolled);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    educationResourceService.listPublished()
      .then(resources => {
        setAllResources(resources);
        setFilteredResources(resources);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let filtered = allResources;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(r => r.resource_type === activeCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.author?.toLowerCase().includes(q)
      );
    }
    setFilteredResources(filtered);
  }, [activeCategory, searchTerm, allResources]);

  const categories = [
    { id: 'all', label: 'All' },
    ...[...new Set(allResources.map(r => r.resource_type).filter(Boolean))]
      .map(type => ({ id: type, label: type.charAt(0).toUpperCase() + type.slice(1) + 's' }))
  ];

  const [featured, ...rest] = filteredResources;

  return (
    <div className="min-h-screen" style={{ background: '#141E16' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
        .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0; }
        .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 600; letter-spacing: 0; }
        .font-sacred-medium { font-family: 'Cormorant Garamond', serif; font-weight: 500; letter-spacing: 0; }
        .nav-at-top {
          background: transparent;
          box-shadow: none;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .nav-at-top .nav-logo { color: rgba(255,255,255,0.9); }
        .nav-at-top .nav-link { color: rgba(255,255,255,0.75); }
        .nav-at-top .nav-link:hover { color: rgba(255,255,255,1); }
        .nav-scrolled {
          background: rgba(245,241,235,0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 1px 12px rgba(0,0,0,0.08);
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .nav-scrolled .nav-logo { color: #2F4F3F; }
        .nav-scrolled .nav-link { color: #2F4F3F; opacity: 0.75; }
        .nav-scrolled .nav-link:hover { opacity: 1; color: #C4756B; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      {/* Nav */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-20 py-4 px-6 md:px-10 nav-at-top"
      >
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <a href="/" className="nav-logo text-3xl font-sacred tracking-widest transition-colors duration-300">
            SACRED
          </a>
          <div className="flex items-center gap-6">
            <Link to="/blog" className="nav-link font-sacred text-base transition-colors duration-300">
              Blog
            </Link>
            {user ? (
              <Button
                asChild
                className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full px-6 text-sm transition-all duration-300"
              >
                <Link to={createPageUrl('Dashboard')}>My Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link to={createPageUrl('Login')} className="nav-link font-sacred text-base transition-colors duration-300">
                  Sign in
                </Link>
                <Button
                  asChild
                  className="bg-[#C4756B] hover:bg-[#B86761] text-white font-sacred-bold rounded-full px-6 text-sm transition-all duration-300"
                >
                  <Link to={createPageUrl('Signup')}>Begin Assessment</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <p className="font-sacred-bold text-[#C4756B] text-xs tracking-[0.25em] uppercase mb-6">Education & Resources</p>
          <h1
            className="font-sacred-medium italic text-white leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
          >
            Wisdom for the<br />journey ahead
          </h1>
          <p className="text-white/60 font-sacred text-lg md:text-xl leading-relaxed max-w-2xl">
            Thoughtful articles to help Christian engaged couples prepare for the gift of marital intimacy.
          </p>
        </div>
      </section>

      {/* Content */}
      <div style={{ background: '#F5F1EB' }} className="rounded-t-3xl">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5B73]" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 border border-[#E6D7C9] rounded-full bg-white text-[#2F4F3F] placeholder-[#6B5B73]/60 font-sacred text-sm focus:outline-none focus:border-[#2F4F3F]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B5B73]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {categories.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full font-sacred text-sm transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-[#2F4F3F] text-white'
                        : 'bg-white border border-[#E6D7C9] text-[#6B5B73] hover:border-[#2F4F3F] hover:text-[#2F4F3F]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-24">
              <Loader2 className="w-7 h-7 animate-spin text-[#2F4F3F]" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && allResources.length === 0 && (
            <div className="text-center py-24">
              <h3 className="text-2xl font-sacred-medium text-[#2F4F3F] mb-3">Coming Soon</h3>
              <p className="text-[#6B5B73] font-sacred max-w-sm mx-auto leading-relaxed">
                We're carefully crafting resources to help you prepare for the beautiful gift of marital intimacy.
              </p>
            </div>
          )}

          {/* No search results */}
          {!isLoading && allResources.length > 0 && filteredResources.length === 0 && (
            <div className="text-center py-24">
              <p className="text-[#6B5B73] font-sacred mb-4">No articles found for "{searchTerm}"</p>
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                className="text-[#C4756B] font-sacred-bold text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Articles */}
          {!isLoading && filteredResources.length > 0 && (
            <div className="space-y-12">
              {/* Featured — first article gets the large treatment */}
              {featured && <FeaturedCard resource={featured} />}

              {/* Grid — remaining articles */}
              {rest.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map(resource => (
                    <ArticleCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
