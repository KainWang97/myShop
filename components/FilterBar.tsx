import React from 'react';

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-16 px-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`
            text-xs uppercase tracking-[0.15em] transition-all duration-300 relative
            ${activeCategory === category ? 'text-sumi' : 'text-stone-400 hover:text-stone-600'}
          `}
        >
          {category}
          <span 
            className={`
              absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-sumi transition-all duration-300
              ${activeCategory === category ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
          />
        </button>
      ))}
    </div>
  );
};

export default FilterBar;