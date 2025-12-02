import React from 'react';

const Hero: React.FC = () => {
  return (
    <header className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Background Image with slight parallax or static clean look */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/1920/1080?grayscale&blur=1" 
          alt="Minimalist Interior" 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-stone-100/20 mix-blend-overlay"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 max-w-lg px-6">
        <p className="text-stone-700 tracking-[0.3em] text-xs uppercase animate-fade-in-up">
          Curated for Life
        </p>
        <h1 className="text-5xl md:text-7xl font-serif text-sumi tracking-widest leading-tight">
          日常の<br />
          <span className="text-4xl md:text-6xl block mt-4">美学</span>
        </h1>
        <div className="w-12 h-[1px] bg-stone-800 mx-auto mt-8"></div>
        <p className="text-stone-600 font-light text-sm tracking-widest pt-4">
          Beauty in the ordinary.
        </p>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-stone-800"></div>
      </div>
    </header>
  );
};

export default Hero;
