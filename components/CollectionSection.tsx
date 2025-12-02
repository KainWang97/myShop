import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard';
import FilterBar from './FilterBar';
import { Product } from '../types';
import { CATEGORIES } from '../constants';

interface CollectionSectionProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const CollectionSection: React.FC<CollectionSectionProps> = ({ products, onProductClick }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  // Scroll to top when entering this view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(product => product.category === activeCategory);
  }, [activeCategory, products]);

  return (
    <div className="min-h-screen bg-washi pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center mb-16 space-y-6">
           <h2 className="text-4xl font-serif text-sumi tracking-wider">All Items</h2>
           <p className="text-xs tracking-[0.2em] text-stone-500 uppercase">Curated Objects</p>
        </div>
        
        <FilterBar 
          categories={CATEGORIES} 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory} 
        />
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 animate-fade-in">
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index}
                onClick={onProductClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-stone-500 font-serif italic">
            No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionSection;