import React, { useRef, useEffect, useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index: number;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we can unobserve if we only want the animation once
          if (cardRef.current) observer.unobserve(cardRef.current);
        }
      },
      {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: '50px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) observer.disconnect();
    };
  }, []);

  const isEven = index % 2 === 0;
  
  // Animation classes
  // Even index: Slide from left (translate-x-[-50px] -> 0)
  // Odd index: Slide from right (translate-x-[50px] -> 0)
  const baseClasses = "relative group cursor-pointer transition-all duration-1000 ease-out";
  const opacityClass = isVisible ? "opacity-100" : "opacity-0";
  const translateClass = isVisible 
    ? "translate-x-0" 
    : isEven ? "-translate-x-12" : "translate-x-12";

  return (
    <div 
      ref={cardRef}
      className={`${baseClasses} ${opacityClass} ${translateClass} flex flex-col gap-4`}
      onClick={() => onClick(product)}
      style={{ transitionDelay: `${index % 2 * 100}ms` }} // Slight stagger for grid rows
    >
      <div className="relative overflow-hidden w-full aspect-[3/4] bg-stone-200">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Minimal overlay, no heavy shadow */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-500" />
        
        {/* "View" button appears subtly */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <span className="bg-washi/90 px-6 py-2 text-xs uppercase tracking-widest text-sumi border border-stone-200 backdrop-blur-sm">
            View
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h3 className="font-serif text-lg text-sumi">{product.name}</h3>
        <p className="text-xs text-stone-500 tracking-wider uppercase">{product.category}</p>
        <p className="text-sm font-light text-stone-800 mt-2">${product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
