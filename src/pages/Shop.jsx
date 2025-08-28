import React, { useState, useEffect } from 'react';
import { Product } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AuthWrapper from '../components/auth/AuthWrapper';

const ProductCard = ({ product }) => (
  <a href={product.external_url || product.affiliateUrl} target="_blank" rel="noopener noreferrer" className="block group">
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#E6D7C9] h-full flex flex-col">
      <div className="aspect-square bg-[#F5F1EB] overflow-hidden">
        <img 
          src={product.featured_image || product.imageUrl} 
          alt={product.title || product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <Badge variant="outline" className="border-[#C4756B] text-[#C4756B] text-xs font-sacred mb-3 w-fit capitalize">
          {product.product_type || product.category}
        </Badge>
        <h3 className="text-lg font-sacred-bold text-[#2F4F3F] mb-2 leading-tight flex-grow">{product.title || product.name}</h3>
        <p className="text-sm text-[#6B5B73] font-sacred mb-4 line-clamp-3 flex-grow">{product.description}</p>
        {product.price && (
          <p className="text-base font-sacred-medium text-[#2F4F3F] mt-auto pt-2">${product.price}</p>
        )}
      </div>
    </div>
  </a>
);

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await Product.list();
        setProducts(fetchedProducts);
        
        const uniqueCategories = ['All', ...new Set(fetchedProducts.map(p => p.product_type || p.category))];
        setCategories(uniqueCategories);

      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => (p.product_type || p.category) === activeCategory);

  const featuredProducts = products.filter(p => p.featured);

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
    <div className="bg-[#F5F1EB] min-h-screen">
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
          .font-sacred { font-family: 'Cormorant Garamond', serif; font-weight: 300; letter-spacing: 0.08em; }
          .font-sacred-bold { font-family: 'Cormorant Garamond', serif; font-weight: 400; letter-spacing: 0.08em; }
          .font-sacred-medium { font-family: 'Cormorant Garamond', serif; font-weight: 500; letter-spacing: 0.08em; }
        `
      }} />
      
      <div className="max-w-7xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-sacred-bold text-[#2F4F3F] mb-4">Shop</h1>
          <p className="text-xl text-[#6B5B73] font-sacred">
            A curated collection of resources to enrich your journey.
          </p>
        </div>

        {/* Category Filters */}
        <div className="border-b border-[#E6D7C9] mb-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-3">
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setActiveCategory(category)}
                variant="ghost"
                className={`rounded-full px-4 font-sacred transition-colors ${
                  activeCategory === category 
                    ? 'bg-[#2F4F3F] text-white hover:bg-[#1F3F2F] hover:text-white'
                    : 'text-[#6B5B73] hover:bg-gray-200/50'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-[#7A9B8A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-12 h-12 bg-[#7A9B8A]/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛍️</span>
                </div>
              </div>
              <h3 className="text-2xl font-sacred-bold text-[#2F4F3F] mb-4">Coming Soon</h3>
              <p className="text-[#6B5B73] font-sacred text-lg mb-6">
                We're curating a thoughtful collection of resources to enrich your sacred journey together.
              </p>
              <p className="text-[#6B5B73] font-sacred">
                Beautiful books, meaningful gifts, and tools for deeper intimacy are on the way.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Section */}
            {activeCategory === 'All' && featuredProducts.length > 0 && (
              <section>
                <h2 className="text-3xl font-sacred-medium text-[#2F4F3F] mb-8">Featured</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Main Product Grid */}
            <section>
              {activeCategory !== 'All' && (
                <h2 className="text-3xl font-sacred-medium text-[#2F4F3F] mb-8">{activeCategory}</h2>
              )}
              {filteredProducts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                 <div className="text-center py-12">
                   <p className="text-gray-500 font-sacred">No products found in this category.</p>
                 </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
    </AuthWrapper>
  );
}