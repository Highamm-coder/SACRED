
import React, { useState, useEffect } from 'react';
import { BlogPost } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function EducationPage() {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'intimacy', label: 'Intimacy' },
    { id: 'communication', label: 'Communication' },
    { id: 'expectations', label: 'Expectations' },
    { id: 'theology', label: 'Theology' },
    { id: 'preparation', label: 'Preparation' }
  ];

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await BlogPost.filter({ published: true }, '-created_date');
        setAllPosts(posts);
        setFilteredPosts(posts);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredPosts(allPosts);
    } else {
      setFilteredPosts(allPosts.filter(post => post.category === activeCategory));
    }
  }, [activeCategory, allPosts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F4F3F]" />
      </div>
    );
  }

  return (
    <div className="bg-[#F5F1EB] min-h-screen">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        .font-sacred {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          letter-spacing: 0.08em;
        }
        .font-sacred-bold {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          letter-spacing: 0.08em;
        }
      `}</style>

      <div className="max-w-7xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-sacred-bold text-[#2F4F3F] mb-4">Education & Resources</h1>
          <p className="text-xl text-[#6B5B73] font-sacred">
            Thoughtful articles to help you prepare for the beautiful gift of marital intimacy.
          </p>
        </div>

        {/* Category Filters */}
        <div className="border-b border-[#E6D7C9] mb-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-3">
            {categories.map(category => (
              <Button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                variant="ghost"
                className={`rounded-full px-4 font-sacred transition-colors ${
                  activeCategory === category.id 
                    ? 'bg-[#2F4F3F] text-white hover:bg-[#1F3F2F] hover:text-white'
                    : 'text-[#6B5B73] hover:bg-gray-200/50'
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
             <p className="text-gray-500 font-sacred">No articles found in this category.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <Link key={post.id} to={createPageUrl(`BlogPost?slug=${post.slug}`)} className="block group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#E6D7C9] h-full flex flex-col">
                  <div className="aspect-video bg-[#F5F1EB] overflow-hidden">
                    <img
                      src={post.featured_image || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c994f4bda_Screenshot2025-07-20at101100PM.png"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col flex-grow">
                    <Badge variant="outline" className="border-[#C4756B] text-[#C4756B] text-xs font-sacred mb-3 w-fit capitalize">
                      {post.category}
                    </Badge>
                    <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-2 leading-tight flex-grow">{post.title}</h3>
                    <p className="text-sm text-[#6B5B73] font-sacred mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>
                    <p className="text-xs text-[#6B5B73] font-sacred mt-auto pt-2">
                      By {post.author}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
