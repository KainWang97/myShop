import React from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  onUpdateQuantity,
  onCheckout
}) => {
  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[70] bg-stone-900/30 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-[80] w-full max-w-md bg-washi shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-stone-200 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-stone-200">
          <h2 className="font-serif text-2xl text-sumi">Your Selection</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-sumi transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-500 space-y-4">
              <p className="font-serif italic text-lg">Your collection is empty.</p>
              <button onClick={onClose} className="text-xs uppercase tracking-widest border-b border-stone-400 pb-1">Continue Browsing</button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 animate-fade-in">
                <div className="w-20 h-24 bg-stone-200 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-sumi">{item.name}</h3>
                      <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">{item.category}</p>
                    </div>
                    <p className="text-sm font-light text-sumi">${item.price * item.quantity}</p>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-stone-300">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="px-2 py-1 text-stone-500 hover:bg-stone-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="px-2 py-1 text-stone-500 hover:bg-stone-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-red-900 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 md:p-8 bg-stone-50 border-t border-stone-200 space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-xs uppercase tracking-widest text-stone-500">Subtotal</span>
              <span className="font-serif text-2xl text-sumi">${total}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-sumi text-washi py-4 uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;