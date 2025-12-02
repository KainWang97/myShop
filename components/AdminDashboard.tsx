import React, { useState } from 'react';
import { Product, Order, Inquiry } from '../types';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  inquiries: Inquiry[];
  onUpdateStock: (id: string, newStock: number) => void;
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onReplyInquiry: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  orders, 
  inquiries,
  onUpdateStock,
  onUpdateOrderStatus,
  onReplyInquiry
}) => {
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'ORDERS' | 'INQUIRIES'>('INVENTORY');

  return (
    <div className="min-h-screen bg-stone-100 pt-32 pb-24 px-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-3xl font-serif text-sumi mb-2">Admin Dashboard</h1>
            <p className="text-xs uppercase tracking-widest text-stone-500">Store Management System</p>
          </div>
          <div className="flex gap-1 bg-white p-1 rounded-sm border border-stone-200">
            {['INVENTORY', 'ORDERS', 'INQUIRIES'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-sumi text-washi' 
                    : 'text-stone-500 hover:bg-stone-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 shadow-sm min-h-[600px] p-8">
          
          {/* Inventory Tab */}
          {activeTab === 'INVENTORY' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl text-sumi border-b border-stone-100 pb-4">Product Inventory</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200">
                      <th className="pb-4 font-normal">Product</th>
                      <th className="pb-4 font-normal">Category</th>
                      <th className="pb-4 font-normal">Price</th>
                      <th className="pb-4 font-normal">Current Stock</th>
                      <th className="pb-4 font-normal">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-light text-stone-600">
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-4">
                            <img src={product.image} className="w-10 h-10 object-cover bg-stone-200" alt="" />
                            <span className="font-medium text-sumi">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-4">{product.category}</td>
                        <td className="py-4">${product.price}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 ${
                            (product.stock || 0) < 5 ? 'bg-red-50 text-red-700' : 'bg-stone-100'
                          }`}>
                            {product.stock || 0}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => onUpdateStock(product.id, (product.stock || 0) - 1)}
                               className="w-6 h-6 flex items-center justify-center border border-stone-300 hover:bg-stone-100"
                             >-</button>
                             <button 
                               onClick={() => onUpdateStock(product.id, (product.stock || 0) + 1)}
                               className="w-6 h-6 flex items-center justify-center border border-stone-300 hover:bg-stone-100"
                             >+</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl text-sumi border-b border-stone-100 pb-4">Recent Orders</h2>
              {orders.length === 0 ? (
                <p className="text-stone-400 italic">No orders found.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-stone-200 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                           <span className="font-serif text-lg text-sumi">Order #{order.id}</span>
                           <span className="text-xs text-stone-400">{order.date}</span>
                        </div>
                        <div className="text-sm text-stone-600">
                           <p className="font-medium">{order.shippingDetails?.fullName}</p>
                           <p className="text-stone-400 text-xs">{order.shippingDetails?.email}</p>
                        </div>
                        <div className="text-xs text-stone-500 mt-2">
                          {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4 min-w-[200px]">
                        <span className="font-serif text-xl">${order.total}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-widest text-stone-400">Status:</span>
                          <select 
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="bg-stone-50 border border-stone-200 text-xs uppercase p-2 focus:outline-none focus:border-sumi"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === 'INQUIRIES' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl text-sumi border-b border-stone-100 pb-4">Customer Inquiries</h2>
              {inquiries.length === 0 ? (
                 <p className="text-stone-400 italic">No new messages.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className={`p-6 border ${inquiry.status === 'PENDING' ? 'border-sumi/20 bg-stone-50' : 'border-stone-100 opacity-60'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-serif text-sumi">{inquiry.name}</h3>
                          <p className="text-xs text-stone-400">{inquiry.email}</p>
                        </div>
                        <span className="text-xs text-stone-400">{inquiry.date}</span>
                      </div>
                      <p className="text-sm text-stone-600 font-light mb-4 leading-relaxed bg-white p-4 border border-stone-100">
                        {inquiry.message}
                      </p>
                      <div className="flex justify-end">
                        {inquiry.status === 'PENDING' ? (
                          <button 
                            onClick={() => onReplyInquiry(inquiry.id)}
                            className="px-4 py-2 bg-sumi text-washi text-xs uppercase tracking-widest hover:bg-stone-800"
                          >
                            Mark as Replied
                          </button>
                        ) : (
                          <span className="text-xs uppercase tracking-widest text-green-700 flex items-center gap-2">
                            ✓ Replied
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;