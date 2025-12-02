import React from 'react';
import { User, CartItem } from '../types';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenDashboard: () => void; // User Dashboard
  onOpenAdmin: () => void; // Admin Dashboard
  onHome: () => void;
  onCollection: () => void;
  isScrolled: boolean;
  user: User | null;
  cartItems: CartItem[];
}

const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAuth, 
  onOpenCart, 
  onOpenDashboard,
  onOpenAdmin,
  onHome, 
  onCollection, 
  isScrolled,
  user,
  cartItems
}) => {
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out border-b border-stone-200/0 ${
        isScrolled ? 'bg-washi/90 backdrop-blur-sm py-4 border-stone-200/100' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <button 
          onClick={onHome} 
          className="text-2xl tracking-[0.2em] font-serif text-sumi hover:opacity-70 transition-opacity"
        >
          KOMOREBI
        </button>

        <div className="flex items-center gap-8 text-sm tracking-widest text-stone-600 font-light">
          {/* Admin Link */}
          {isAdmin && (
             <button onClick={onOpenAdmin} className="text-red-900 font-medium hover:text-red-700 transition-colors uppercase border-b border-red-900/20">
               Dashboard
             </button>
          )}

          <button onClick={onCollection} className="hover:text-sumi transition-colors hidden md:block">COLLECTION</button>
          
          {/* Hide Contact on Admin view for cleaner nav, optional */}
          {!isAdmin && (
            <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="hover:text-sumi transition-colors hidden md:block">CONTACT</button>
          )}

          <button 
            onClick={user ? onOpenDashboard : onOpenAuth} 
            className="hover:text-sumi transition-colors uppercase"
          >
            {user ? (isAdmin ? 'Admin' : 'Account') : 'Login'}
          </button>

          <button 
            onClick={onOpenCart} 
            className="hover:text-sumi transition-colors uppercase flex items-center gap-2"
          >
            Cart
            {cartCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 bg-sumi text-washi text-[10px] rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;