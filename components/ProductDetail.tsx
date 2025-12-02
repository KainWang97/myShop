import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { generateCuratorNote } from '../services/geminiService';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onAddToCart }) => {
  const [curatorNote, setCuratorNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Reset scroll when mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAskCurator = async () => {
    setLoading(true);
    const note = await generateCuratorNote(product);
    setCuratorNote(note);
    setLoading(false);
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-washi overflow-y-auto no-scrollbar animate-fade-in">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 z-50 p-4 mix-blend-difference text-white hover:scale-110 transition-transform"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Image Section - Left Half */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen bg-stone-200 relative">
           <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section - Right Half */}
        <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-screen p-8 md:p-20 flex flex-col justify-center bg-washi">
          <div className="max-w-md mx-auto w-full space-y-8 animate-slide-up">
            
            <div className="space-y-2 border-l-2 border-stone-800 pl-6">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500">{product.origin}</p>
              <h2 className="text-4xl md:text-5xl font-serif text-sumi">{product.name}</h2>
              <p className="text-xl font-light text-stone-800 pt-2">${product.price}</p>
            </div>

            <div className="py-8 space-y-6 text-stone-600 font-light leading-relaxed">
              <p>{product.details}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-stone-200 pt-6">
                <div>
                  <span className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Material</span>
                  {product.material}
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Category</span>
                  {product.category}
                </div>
              </div>
            </div>

            {/* Gemini Section */}
            <div className="bg-stone-100 p-6 border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-sumi italic">Curator's Note</h3>
                {!curatorNote && !loading && (
                   <button 
                   onClick={handleAskCurator}
                   className="text-xs uppercase tracking-widest border-b border-stone-800 hover:text-stone-500 hover:border-stone-500 transition-colors pb-0.5"
                 >
                   Reveal Story
                 </button>
                )}
              </div>
              
              {loading ? (
                <div className="flex space-x-1 items-center h-12">
                  <div className="w-1 h-1 bg-stone-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1 h-1 bg-stone-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1 h-1 bg-stone-400 rounded-full animate-bounce delay-150"></div>
                </div>
              ) : (
                <p className={`text-sm italic text-stone-600 transition-opacity duration-1000 ${curatorNote ? 'opacity-100' : 'opacity-0 h-0'}`}>
                  {curatorNote}
                </p>
              )}
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={addedAnimation}
              className={`w-full py-4 uppercase tracking-[0.2em] text-xs transition-all duration-500 relative overflow-hidden ${
                addedAnimation ? 'bg-stone-200 text-sumi' : 'bg-sumi text-washi hover:bg-stone-800'
              }`}
            >
              <span className={`relative z-10 ${addedAnimation ? 'opacity-0' : 'opacity-100'}`}>Add to Cart</span>
              <span className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300 ${addedAnimation ? 'opacity-100' : 'opacity-0'}`}>
                Added to Collection
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;