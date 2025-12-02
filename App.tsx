
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SeasonalSection from './components/SeasonalSection';
import CollectionSection from './components/CollectionSection';
import ProductDetail from './components/ProductDetail';
import ContactSection from './components/ContactSection';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import UserDashboard from './components/UserDashboard';
import CheckoutPage from './components/CheckoutPage';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import { PRODUCTS, SEASONAL_INDICES } from './constants';
import { Product, User, CartItem, Order, ShippingDetails, PageView, Inquiry } from './types';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<PageView>('HOME');
  
  // App Data State (Lifted for Admin Editing)
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  
  // User orders pool (mock global orders for admin view)
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // UI State
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false); // User Dashboard Modal
  const [isScrolled, setIsScrolled] = useState(false);
  
  // User Data State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Get Seasonal Products from state
  const seasonalProducts = SEASONAL_INDICES.map(index => products[index]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handlers
  const handleProductClick = (product: Product) => {
    setActiveProduct(product);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseProduct = () => {
    setActiveProduct(null);
    document.body.style.overflow = 'auto';
  };

  const handleHomeClick = () => {
    handleCloseProduct();
    setCurrentView('HOME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCollectionClick = () => {
    handleCloseProduct();
    setCurrentView('COLLECTION');
  };

  const handleAdminDashboardClick = () => {
    handleCloseProduct();
    setCurrentView('ADMIN_DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Logic
  const handleAddToCart = (product: Product) => {
    const stock = product.stock || 0;
    if (stock <= 0) return; // Prevent adding if out of stock
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      // Check if adding 1 more exceeds stock
      if (existing && existing.quantity + 1 > stock) {
          // Ideally show a toast, but for now we just return current state
          return prev; 
      }
      
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        // Check stock limit before increasing
        if (delta > 0) {
            const product = products.find(p => p.id === id);
            const stock = product?.stock || 0;
            if (item.quantity + delta > stock) {
                return item; // Do not increase
            }
        }

        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const handleSetQuantity = (id: string, quantity: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const stock = product?.stock || 0;
        
        // Ensure strictly positive integer
        let newQty = Math.floor(quantity);
        if (isNaN(newQty) || newQty < 1) newQty = 1;

        // Clamp to stock
        if (stock > 0 && newQty > stock) {
            newQty = stock;
        }

        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckoutStart = () => {
    if (!user) {
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }
    setIsCartOpen(false);
    setCurrentView('CHECKOUT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = (shippingDetails: ShippingDetails) => {
    // Create Mock Order
    const newOrder: Order = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      date: new Date().toLocaleDateString(),
      items: [...cart],
      total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      status: 'Processing',
      shippingDetails: shippingDetails
    };

    // Update User Orders
    setUser(prev => prev ? { ...prev, orders: [newOrder, ...prev.orders] } : null);
    
    // Add to global orders for Admin
    setAllOrders(prev => [newOrder, ...prev]);

    // Deduct Stock
    cart.forEach(cartItem => {
      setProducts(prev => prev.map(p => {
        if (p.id === cartItem.id) {
          return { ...p, stock: Math.max(0, (p.stock || 0) - cartItem.quantity) };
        }
        return p;
      }));
    });

    // Clear Cart & Redirect
    setCart([]);
    setCurrentView('HOME');
    if (user?.role !== 'ADMIN') {
        setIsDashboardOpen(true); // Open User dashboard
    }
  };

  // Auth Logic
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    
    // Auto-redirect to admin dashboard if admin
    if (loggedInUser.role === 'ADMIN') {
      setCurrentView('ADMIN_DASHBOARD');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsDashboardOpen(false);
    handleHomeClick();
  };

  // Inquiry Logic
  const handleSubmitInquiry = (name: string, email: string, message: string) => {
    const newInquiry: Inquiry = {
      id: Date.now().toString(),
      name,
      email,
      message,
      date: new Date().toLocaleDateString(),
      status: 'PENDING'
    };
    setInquiries(prev => [newInquiry, ...prev]);
  };

  // Admin Actions
  const handleUpdateStock = (id: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, newStock) } : p));
  };

  const handleUpdateOrderStatus = (id: string, status: Order['status']) => {
    setAllOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    // Also update current user's order list if applicable (mock sync)
    if (user) {
        setUser(prev => prev ? {
            ...prev,
            orders: prev.orders.map(o => o.id === id ? { ...o, status } : o)
        } : null);
    }
  };

  const handleReplyInquiry = (id: string) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'REPLIED' } : i));
  };

  return (
    <div className="min-h-screen bg-washi text-stone-900 font-sans selection:bg-stone-200 selection:text-sumi">
      <Navbar 
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenAdmin={handleAdminDashboardClick}
        onHome={handleHomeClick}
        onCollection={handleCollectionClick}
        isScrolled={isScrolled}
        user={user}
        cartItems={cart}
      />

      <main>
        {currentView === 'HOME' && (
          <>
            <Hero />
            <SeasonalSection 
              products={seasonalProducts}
              onProductClick={handleProductClick}
            />
          </>
        )}

        {currentView === 'COLLECTION' && (
          <CollectionSection 
            products={products} // Pass state products
            onProductClick={handleProductClick} 
          />
        )}

        {currentView === 'CHECKOUT' && (
          <CheckoutPage 
            cartItems={cart}
            userEmail={user?.email}
            userName={user?.name}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => {
              setCurrentView('HOME');
              setIsCartOpen(true);
            }}
          />
        )}

        {currentView === 'ADMIN_DASHBOARD' && (
          <AdminDashboard 
            products={products}
            orders={allOrders}
            inquiries={inquiries}
            onUpdateStock={handleUpdateStock}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onReplyInquiry={handleReplyInquiry}
          />
        )}
        
        {/* Show contact form unless in admin dashboard */}
        {currentView !== 'CHECKOUT' && currentView !== 'ADMIN_DASHBOARD' && (
           <ContactSection onSubmit={handleSubmitInquiry} />
        )}
      </main>

      {currentView !== 'ADMIN_DASHBOARD' && <Footer />}

      {/* Overlays */}
      {activeProduct && (
        <ProductDetail 
          product={activeProduct} 
          currentQuantity={cart.find(item => item.id === activeProduct.id)?.quantity || 0}
          onClose={handleCloseProduct}
          onAddToCart={handleAddToCart}
        />
      )}

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        products={products} // Pass global products for real-time stock check
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onSetQuantity={handleSetQuantity}
        onCheckout={handleCheckoutStart}
      />

      {user && (
        <UserDashboard
          user={user}
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;
