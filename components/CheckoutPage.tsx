import React, { useState } from 'react';
import { CartItem, PaymentMethod, ShippingDetails } from '../types';

interface CheckoutPageProps {
  cartItems: CartItem[];
  userEmail?: string;
  userName?: string;
  onPlaceOrder: (details: ShippingDetails) => void;
  onBack: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ 
  cartItems, 
  userEmail, 
  userName, 
  onPlaceOrder, 
  onBack 
}) => {
  const [step, setStep] = useState<'INFO' | 'PAYMENT'>('INFO');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  
  // Form State
  const [formData, setFormData] = useState<ShippingDetails>({
    fullName: userName || '',
    email: userEmail || '',
    phone: '',
    method: 'BANK_TRANSFER',
    city: '',
    address: '',
    storeCode: '',
    storeName: ''
  });

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = total > 200 ? 0 : 15;
  const finalTotal = total + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('PAYMENT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceOrder({ ...formData, method: paymentMethod });
  };

  return (
    <div className="min-h-screen bg-washi pt-32 pb-24 animate-fade-in">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Column: Forms */}
        <div>
          <button 
            onClick={onBack}
            className="text-xs uppercase tracking-widest text-stone-400 hover:text-sumi mb-8 flex items-center gap-2"
          >
            ← Back to Cart
          </button>
          
          <h1 className="text-3xl font-serif text-sumi mb-12">Checkout</h1>

          {step === 'INFO' ? (
            <form onSubmit={handleSubmitInfo} className="space-y-8 animate-slide-up">
              <h2 className="text-sm uppercase tracking-widest text-stone-500 border-b border-stone-200 pb-2">Contact Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Email</label>
                  <input 
                    required
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Full Name</label>
                  <input 
                    required
                    name="fullName"
                    type="text" 
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Phone</label>
                  <input 
                    required
                    name="phone"
                    type="tel" 
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors rounded-none"
                  />
                </div>
              </div>

              <div className="pt-8">
                <button type="submit" className="bg-sumi text-washi px-8 py-3 uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-colors w-full md:w-auto">
                  Continue to Payment
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-10 animate-slide-up">
              
              {/* Payment Method Selection */}
              <div>
                <h2 className="text-sm uppercase tracking-widest text-stone-500 border-b border-stone-200 pb-2 mb-6">Payment & Delivery Method</h2>
                
                <div className="space-y-4">
                  <label className={`block border p-6 cursor-pointer transition-all duration-300 ${paymentMethod === 'BANK_TRANSFER' ? 'border-sumi bg-stone-50' : 'border-stone-200 opacity-60 hover:opacity-100'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="method" 
                        checked={paymentMethod === 'BANK_TRANSFER'} 
                        onChange={() => setPaymentMethod('BANK_TRANSFER')}
                        className="accent-sumi"
                      />
                      <div>
                        <span className="block font-serif text-lg">Bank Transfer (匯款)</span>
                        <span className="text-xs text-stone-500 font-light">Direct transfer. Delivery to home address.</span>
                      </div>
                    </div>
                  </label>

                  <label className={`block border p-6 cursor-pointer transition-all duration-300 ${paymentMethod === 'STORE_PICKUP' ? 'border-sumi bg-stone-50' : 'border-stone-200 opacity-60 hover:opacity-100'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="method" 
                        checked={paymentMethod === 'STORE_PICKUP'} 
                        onChange={() => setPaymentMethod('STORE_PICKUP')}
                        className="accent-sumi"
                      />
                      <div>
                        <span className="block font-serif text-lg">Store Pickup / COD (店到店貨到付款)</span>
                        <span className="text-xs text-stone-500 font-light">Pay when you pick up at a convenience store.</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dynamic Shipping Fields */}
              <div className="bg-white p-6 border border-stone-200">
                {paymentMethod === 'BANK_TRANSFER' ? (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="font-serif text-sumi">Shipping Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">City</label>
                        <input 
                          required
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi rounded-none"
                        />
                      </div>
                      <div>
                         {/* Spacer for layout */}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Address</label>
                      <input 
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi rounded-none"
                      />
                    </div>
                    
                    <div className="bg-stone-100 p-4 text-xs text-stone-600 space-y-1 font-mono mt-4">
                      <p className="uppercase tracking-widest text-stone-400 mb-2">Bank Details</p>
                      <p>Bank: Komorebi Bank (808)</p>
                      <p>Account: 1234-5678-9012</p>
                      <p>Name: Komorebi Select Ltd.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="font-serif text-sumi">Store Details</h3>
                    <p className="text-xs text-stone-500">Please provide the convenience store details.</p>
                    
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Store Code (店號)</label>
                      <input 
                        required
                        name="storeCode"
                        value={formData.storeCode}
                        onChange={handleChange}
                        placeholder="e.g. 123456"
                        className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-stone-400 mb-2">Store Name (店名)</label>
                      <input 
                        required
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        placeholder="e.g. 7-11 Shinjuku Branch"
                        className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi rounded-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setStep('INFO')}
                  className="px-6 py-3 border border-stone-300 text-stone-500 uppercase tracking-widest text-xs hover:border-sumi hover:text-sumi transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-sumi text-washi px-8 py-3 uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-colors"
                >
                  Place Order — ${finalTotal}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-stone-50 p-8 h-fit border border-stone-200">
          <h2 className="font-serif text-xl text-sumi mb-6">Order Summary</h2>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-20 bg-stone-200 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-sm text-sumi">{item.name}</h3>
                    <p className="text-sm font-light text-stone-600">${item.price * item.quantity}</p>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 pt-6 space-y-2">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span>${total}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'Free' : `$${shippingCost}`}</span>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-stone-200 mt-4">
              <span className="text-xs uppercase tracking-widest text-stone-500">Total</span>
              <span className="font-serif text-2xl text-sumi">${finalTotal}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;