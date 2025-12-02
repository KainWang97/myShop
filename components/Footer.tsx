import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-sumi text-stone-400 py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        <div>
          <h2 className="text-2xl font-serif text-washi mb-4 tracking-widest">KOMOREBI</h2>
          <p className="text-xs font-light max-w-xs leading-relaxed">
            Sunlight filtering through trees.<br/>
            A collection of objects for a quieter life.
          </p>
        </div>

        <div className="flex gap-12 text-xs tracking-widest uppercase">
          <div className="flex flex-col gap-4">
            <span className="text-washi">Shop</span>
            <a href="#" className="hover:text-washi transition-colors">New Arrivals</a>
            <a href="#" className="hover:text-washi transition-colors">Home</a>
            <a href="#" className="hover:text-washi transition-colors">Apparel</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-washi">Social</span>
            <a href="#" className="hover:text-washi transition-colors">Instagram</a>
            <a href="#" className="hover:text-washi transition-colors">Pinterest</a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-800 text-[10px] flex justify-between">
        <span>© 2024 KOMOREBI SELECT</span>
        <span>TOKYO / NEW YORK</span>
      </div>
    </footer>
  );
};

export default Footer;
