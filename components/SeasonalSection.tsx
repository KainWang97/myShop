import React, { useRef, useEffect, useState } from 'react';
import { Product } from '../types';

interface SeasonalSectionProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const SeasonalItem: React.FC<{ 
  product: Product; 
  index: number; 
  onClick: (p: Product) => void;
}> = ({ product, index, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isEven = index % 2 === 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      onClick={() => onClick(product)}
      className={`
        flex flex-col md:flex-row items-center gap-12 md:gap-24 cursor-pointer group
        transition-all duration-1000 ease-out transform
        ${isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isEven ? '-translate-x-24' : 'translate-x-24'}`}
        ${!isEven ? 'md:flex-row-reverse' : ''}
      `}
    >
      {/* Large Image */}
      <div className="w-full md:w-3/5 aspect-[4/3] overflow-hidden relative bg-stone-200">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-500" />
      </div>

      {/* Editorial Text */}
      <div className="w-full md:w-2/5 space-y-6 text-center md:text-left px-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-stone-400">Seasonal Feature 0{index + 1}</span>
          <h3 className="text-3xl md:text-4xl font-serif text-sumi">{product.name}</h3>
        </div>
        <p className="text-sm font-light text-stone-600 leading-relaxed max-w-sm mx-auto md:mx-0">
          {product.shortDescription}
        </p>
        <button className="text-xs uppercase tracking-widest border-b border-sumi pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

const SeasonalSection: React.FC<SeasonalSectionProps> = ({ products, onProductClick }) => {
  return (
    <section className="bg-washi py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-24 text-center">
         <h2 className="text-xl font-serif text-sumi tracking-widest mb-4">今季の主役</h2>
         <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Seasonal Essentials</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-32 px-6">
        {products.map((product, index) => (
          <SeasonalItem 
            key={product.id} 
            product={product} 
            index={index} 
            onClick={onProductClick}
          />
        ))}
      </div>
    </section>
  );
};

export default SeasonalSection;