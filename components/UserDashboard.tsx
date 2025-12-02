import React, { useState } from 'react';
import { User, Order } from '../types';

interface UserDashboardProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, isOpen, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       {/* Backdrop */}
       <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-washi w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-fade-in-up">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-stone-400 hover:text-sumi z-10"
        >
          ✕
        </button>

        <div className="p-8 md:p-12 border-b border-stone-200">
           <h2 className="text-3xl font-serif text-sumi mb-2">Welcome, {user.name}</h2>
           <p className="text-xs tracking-widest text-stone-500 uppercase">Member Dashboard</p>
        </div>

        <div className="flex border-b border-stone-200">
          <button 
            className={`flex-1 py-4 text-xs uppercase tracking-widest transition-colors ${activeTab === 'orders' ? 'bg-stone-100 text-sumi border-b-2 border-sumi' : 'text-stone-400 hover:text-stone-600'}`}
            onClick={() => setActiveTab('orders')}
          >
            Order History
          </button>
          <button 
            className={`flex-1 py-4 text-xs uppercase tracking-widest transition-colors ${activeTab === 'profile' ? 'bg-stone-100 text-sumi border-b-2 border-sumi' : 'text-stone-400 hover:text-stone-600'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-stone-50">
          {activeTab === 'orders' ? (
             <div className="space-y-6">
               {user.orders.length === 0 ? (
                 <p className="text-stone-500 font-light italic">No orders placed yet.</p>
               ) : (
                 user.orders.map((order) => (
                   <div key={order.id} className="bg-white border border-stone-200 p-6 shadow-sm">
                     <div className="flex justify-between items-start mb-4 border-b border-stone-100 pb-4">
                       <div>
                         <span className="block text-xs text-stone-400 uppercase tracking-wider mb-1">Order ID</span>
                         <span className="font-serif text-lg text-sumi">#{order.id}</span>
                       </div>
                       <div className="text-right">
                          <span className="block text-xs text-stone-400 uppercase tracking-wider mb-1">Date</span>
                          <span className="text-sm font-light text-sumi">{order.date}</span>
                       </div>
                     </div>
                     
                     <div className="space-y-3 mb-4">
                       {order.items.map((item, idx) => (
                         <div key={`${order.id}-${idx}`} className="flex justify-between text-sm font-light text-stone-600">
                           <span>{item.name} <span className="text-stone-400">x{item.quantity}</span></span>
                           <span>${item.price * item.quantity}</span>
                         </div>
                       ))}
                     </div>
                     
                     <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                       <span className={`text-xs px-2 py-1 uppercase tracking-wider border ${
                         order.status === 'Processing' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' :
                         order.status === 'Shipped' ? 'border-blue-200 bg-blue-50 text-blue-800' :
                         'border-green-200 bg-green-50 text-green-800'
                       }`}>
                         {order.status}
                       </span>
                       <span className="font-serif text-xl text-sumi">${order.total}</span>
                     </div>
                   </div>
                 ))
               )}
             </div>
          ) : (
            <div className="space-y-6 max-w-sm">
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Name</label>
                <div className="w-full bg-white border border-stone-200 p-3 text-sm text-sumi">{user.name}</div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Email</label>
                <div className="w-full bg-white border border-stone-200 p-3 text-sm text-sumi">{user.email}</div>
              </div>
              <div className="pt-8">
                <button 
                  onClick={onLogout}
                  className="px-6 py-2 border border-stone-300 text-stone-500 text-xs uppercase tracking-widest hover:border-red-900 hover:text-red-900 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;