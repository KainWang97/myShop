<script setup lang="ts">
import { ref } from 'vue';
import type { Product, Order, Inquiry, OrderStatus } from '../types';

const props = defineProps<{
  products: Product[];
  orders: Order[];
  inquiries: Inquiry[];
}>();

const emit = defineEmits<{
  (e: 'update-stock', id: string, newStock: number): void;
  (e: 'update-order-status', id: string, status: OrderStatus): void;
  (e: 'reply-inquiry', id: string): void;
}>();

const activeTab = ref<'INVENTORY' | 'ORDERS' | 'INQUIRIES'>('INVENTORY');

// Helper wrapper for emitting stock updates
const updateStock = (id: string, newStock: number) => {
    emit('update-stock', id, newStock);
};
</script>

<template>
  <div class="min-h-screen bg-stone-100 pt-32 pb-24 px-6 animate-fade-in">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-end mb-12">
        <div>
          <h1 class="text-3xl font-serif text-sumi mb-2">Admin Dashboard</h1>
          <p class="text-xs uppercase tracking-widest text-stone-500">Store Management System</p>
        </div>
        <div class="flex gap-1 bg-white p-1 rounded-sm border border-stone-200">
          <button
            v-for="tab in ['INVENTORY', 'ORDERS', 'INQUIRIES']"
            :key="tab"
            @click="activeTab = tab as any"
            class="px-6 py-2 text-xs uppercase tracking-widest transition-all"
            :class="activeTab === tab ? 'bg-sumi text-washi' : 'text-stone-500 hover:bg-stone-50'"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <div class="bg-white border border-stone-200 shadow-sm min-h-[600px] p-8">
        
        <!-- Inventory Tab -->
        <div v-if="activeTab === 'INVENTORY'" class="space-y-6">
          <h2 class="font-serif text-xl text-sumi border-b border-stone-100 pb-4">Product Inventory</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200">
                  <th class="pb-4 font-normal">Product</th>
                  <th class="pb-4 font-normal">Category</th>
                  <th class="pb-4 font-normal">Price</th>
                  <th class="pb-4 font-normal">Current Stock</th>
                  <th class="pb-4 font-normal">Action</th>
                </tr>
              </thead>
              <tbody class="text-sm font-light text-stone-600">
                <tr v-for="product in products" :key="product.id" class="border-b border-stone-50 hover:bg-stone-50/50">
                  <td class="py-4 pr-4">
                    <div class="flex items-center gap-4">
                      <img :src="product.image" class="w-10 h-10 object-cover bg-stone-200" alt="" />
                      <span class="font-medium text-sumi">{{ product.name }}</span>
                    </div>
                  </td>
                  <td class="py-4">{{ product.category }}</td>
                  <td class="py-4">${{ product.price }}</td>
                  <td class="py-4">
                    <span 
                      class="px-2 py-1"
                      :class="(product.stock || 0) < 5 ? 'bg-red-50 text-red-700' : 'bg-stone-100'"
                    >
                      {{ product.stock || 0 }}
                    </span>
                  </td>
                  <td class="py-4">
                    <div class="flex items-center gap-2">
                       <button 
                         @click="updateStock(product.id, (product.stock || 0) - 1)"
                         class="w-6 h-6 flex items-center justify-center border border-stone-300 hover:bg-stone-100"
                       >-</button>
                       <button 
                         @click="updateStock(product.id, (product.stock || 0) + 1)"
                         class="w-6 h-6 flex items-center justify-center border border-stone-300 hover:bg-stone-100"
                       >+</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Orders Tab -->
        <div v-if="activeTab === 'ORDERS'" class="space-y-6">
          <h2 class="font-serif text-xl text-sumi border-b border-stone-100 pb-4">Recent Orders</h2>
          <p v-if="orders.length === 0" class="text-stone-400 italic">No orders found.</p>
          <div v-else class="space-y-4">
            <div v-for="order in orders" :key="order.id" class="border border-stone-200 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
              <div class="space-y-2">
                <div class="flex items-center gap-4">
                   <span class="font-serif text-lg text-sumi">Order #{{ order.id }}</span>
                   <span class="text-xs text-stone-400">{{ order.date }}</span>
                </div>
                <div class="text-sm text-stone-600">
                   <p class="font-medium">{{ order.shippingDetails?.fullName }}</p>
                   <p class="text-stone-400 text-xs">{{ order.shippingDetails?.email }}</p>
                </div>
                <div class="text-xs text-stone-500 mt-2">
                  {{ order.items.map(i => `${i.name} (x${i.quantity})`).join(', ') }}
                </div>
              </div>

              <div class="flex flex-col items-end gap-4 min-w-[200px]">
                <span class="font-serif text-xl">${{ order.total }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs uppercase tracking-widest text-stone-400">Status:</span>
                  <select 
                    :value="order.status"
                    @change="emit('update-order-status', order.id, ($event.target as HTMLSelectElement).value as OrderStatus)"
                    class="bg-stone-50 border border-stone-200 text-xs uppercase p-2 focus:outline-none focus:border-sumi"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inquiries Tab -->
        <div v-if="activeTab === 'INQUIRIES'" class="space-y-6">
          <h2 class="font-serif text-xl text-sumi border-b border-stone-100 pb-4">Customer Inquiries</h2>
          <p v-if="inquiries.length === 0" class="text-stone-400 italic">No new messages.</p>
          <div v-else class="grid grid-cols-1 gap-4">
            <div 
              v-for="inquiry in inquiries" 
              :key="inquiry.id" 
              class="p-6 border"
              :class="inquiry.status === 'PENDING' ? 'border-sumi/20 bg-stone-50' : 'border-stone-100 opacity-60'"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="font-serif text-sumi">{{ inquiry.name }}</h3>
                  <p class="text-xs text-stone-400">{{ inquiry.email }}</p>
                </div>
                <span class="text-xs text-stone-400">{{ inquiry.date }}</span>
              </div>
              <p class="text-sm text-stone-600 font-light mb-4 leading-relaxed bg-white p-4 border border-stone-100">
                {{ inquiry.message }}
              </p>
              <div class="flex justify-end">
                <button 
                  v-if="inquiry.status === 'PENDING'"
                  @click="emit('reply-inquiry', inquiry.id)"
                  class="px-4 py-2 bg-sumi text-washi text-xs uppercase tracking-widest hover:bg-stone-800"
                >
                  Mark as Replied
                </button>
                <span v-else class="text-xs uppercase tracking-widest text-green-700 flex items-center gap-2">
                  ✓ Replied
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>