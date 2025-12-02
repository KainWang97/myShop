
import React from 'react';
import { CartItem, Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  products: Product[]; // Need real-time products to check stock
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, quantity: number) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  products,
  onRemoveItem, 
  onUpdateQuantity,
  onSetQuantity,
  onCheckout
}) => {
  
  // Calculate total only for available items that are within stock limits
  const total = cartItems.reduce((acc, item) => {
    const realTimeProduct = products.find(p => p.id === item.id);
    const isSoldOut = (realTimeProduct?.stock || 0) <= 0;
    if (isSoldOut) return acc;
    return acc + (item.price * item.quantity);
  }, 0);

  // Check issues for validation
  let hasSoldOutItems = false;
  let hasInsufficientStockItems = false;

  cartItems.forEach(item => {
    const realTimeProduct = products.find(p => p.id === item.id);
    const stock = realTimeProduct?.stock || 0;
    
    if (stock <= 0) {
        hasSoldOutItems = true;
    } else if (item.quantity > stock) {
        hasInsufficientStockItems = true;
    }
  });

  const disableCheckout = hasSoldOutItems || hasInsufficientStockItems;

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
            cartItems.map((item) => {
              // Check real-time stock
              const realTimeProduct = products.find(p => p.id === item.id);
              const stock = realTimeProduct?.stock || 0;
              const isSoldOut = stock <= 0;
              const isOverStock = !isSoldOut && item.quantity > stock;
              const isAtMax = !isSoldOut && item.quantity === stock;

              return (
                <div 
                  key={item.id} 
                  className={`flex gap-4 animate-fade-in relative transition-all duration-300 ${
                    isSoldOut ? 'opacity-50 grayscale' : ''
                  }`}
                >
                  {/* Sold Out Overlay */}
                  {isSoldOut && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <span className="bg-stone-800 text-washi px-3 py-1 text-[10px] uppercase tracking-widest font-bold transform -rotate-12 border border-washi">
                        Sold Out
                      </span>
                    </div>
                  )}

                  <div className="w-20 h-24 bg-stone-200 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-sumi">{item.name}</h3>
                        <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">{item.category}</p>
                        {isOverStock && (
                            <p className="text-[10px] text-red-700 font-medium mt-1">
                                Only {stock} available
                            </p>
                        )}
                        {isAtMax && (
                            <p className="text-[10px] text-red-800 font-medium mt-1 animate-pulse">
                                Max limit reached
                            </p>
                        )}
                      </div>
                      <p className={`text-sm font-light ${isSoldOut ? 'text-stone-400 line-through' : 'text-sumi'}`}>
                        ${item.price * item.quantity}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      {isSoldOut ? (
                         <div className="text-[10px] text-red-800 uppercase tracking-widest font-medium">
                           Item Unavailable
                         </div>
                      ) : (
                        <div className="flex items-center border border-stone-300">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="px-2 py-1 text-stone-500 hover:bg-stone-100 transition-colors"
                          >
                            -
                          </button>
                          
                          <input 
                            type="number"
                            min="1"
                            max={stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) {
                                onSetQuantity(item.id, val);
                              } else {
                                onSetQuantity(item.id, 1);
                              }
                            }}
                            className={`w-12 text-center bg-transparent text-xs font-mono focus:outline-none appearance-none m-0 [&::-webkit-inner-spin-button]:appearance-none ${isOverStock || isAtMax ? 'text-red-800 font-bold' : 'text-stone-800'}`}
                          />
                          
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className={`px-2 py-1 text-stone-500 hover:bg-stone-100 transition-colors ${item.quantity >= stock ? 'opacity-30 cursor-not-allowed' : ''}`}
                            disabled={item.quantity >= stock}
                          >
                            +
                          </button>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        className={`text-[10px] uppercase tracking-widest text-stone-400 hover:text-red-900 transition-colors ${isSoldOut ? 'pointer-events-auto z-20 underline' : ''}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 md:p-8 bg-stone-50 border-t border-stone-200 space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-xs uppercase tracking-widest text-stone-500">Subtotal</span>
              <span className="font-serif text-2xl text-sumi">${total}</span>
            </div>
            
            {(hasSoldOutItems || hasInsufficientStockItems) && (
              <div className="text-center bg-red-50 border border-red-100 p-2">
                <p className="text-[10px] uppercase tracking-widest text-red-800">
                  {hasSoldOutItems 
                    ? "Please remove sold out items" 
                    : "Quantity exceeds available stock"}
                </p>
              </div>
            )}

            <button 
              onClick={onCheckout}
              disabled={disableCheckout}
              className={`w-full py-4 uppercase tracking-[0.2em] text-xs transition-colors ${
                disableCheckout 
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
                  : 'bg-sumi text-washi hover:bg-stone-800'
              }`}
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
