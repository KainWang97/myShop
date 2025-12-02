<script setup lang="ts">
import { ref } from 'vue';
import type { User } from '../types';

const props = defineProps<{
  user: User;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'logout'): void;
}>();

const activeTab = ref<'orders' | 'profile'>('orders');
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
     <!-- Backdrop -->
     <div 
      class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
      @click="emit('close')"
    />

    <!-- Modal -->
    <div class="relative bg-washi w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-fade-in-up">
      <button 
        @click="emit('close')" 
        class="absolute top-6 right-6 text-stone-400 hover:text-sumi z-10"
      >
        ✕
      </button>

      <div class="p-8 md:p-12 border-b border-stone-200">
         <h2 class="text-3xl font-serif text-sumi mb-2">Welcome, {{ user.name }}</h2>
         <p class="text-xs tracking-widest text-stone-500 uppercase">Member Dashboard</p>
      </div>

      <div class="flex border-b border-stone-200">
        <button 
          class="flex-1 py-4 text-xs uppercase tracking-widest transition-colors"
          :class="activeTab === 'orders' ? 'bg-stone-100 text-sumi border-b-2 border-sumi' : 'text-stone-400 hover:text-stone-600'"
          @click="activeTab = 'orders'"
        >
          Order History
        </button>
        <button 
          class="flex-1 py-4 text-xs uppercase tracking-widest transition-colors"
          :class="activeTab === 'profile' ? 'bg-stone-100 text-sumi border-b-2 border-sumi' : 'text-stone-400 hover:text-stone-600'"
          @click="activeTab = 'profile'"
        >
          Profile
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-8 md:p-12 bg-stone-50">
        <div v-if="activeTab === 'orders'" class="space-y-6">
           <p v-if="user.orders.length === 0" class="text-stone-500 font-light italic">No orders placed yet.</p>
           <div v-else v-for="order in user.orders" :key="order.id" class="bg-white border border-stone-200 p-6 shadow-sm">
             <div class="flex justify-between items-start mb-4 border-b border-stone-100 pb-4">
               <div>
                 <span class="block text-xs text-stone-400 uppercase tracking-wider mb-1">Order ID</span>
                 <span class="font-serif text-lg text-sumi">#{{ order.id }}</span>
               </div>
               <div class="text-right">
                  <span class="block text-xs text-stone-400 uppercase tracking-wider mb-1">Date</span>
                  <span class="text-sm font-light text-sumi">{{ order.date }}</span>
               </div>
             </div>
             
             <div class="space-y-3 mb-4">
               <div v-for="(item, idx) in order.items" :key="idx" class="flex justify-between text-sm font-light text-stone-600">
                 <span>{{ item.name }} <span class="text-stone-400">x{{ item.quantity }}</span></span>
                 <span>${{ item.price * item.quantity }}</span>
               </div>
             </div>
             
             <div class="flex justify-between items-center pt-4 border-t border-stone-100">
               <span 
                  class="text-xs px-2 py-1 uppercase tracking-wider border"
                  :class="{
                    'border-yellow-200 bg-yellow-50 text-yellow-800': order.status === 'Processing',
                    'border-blue-200 bg-blue-50 text-blue-800': order.status === 'Shipped',
                    'border-green-200 bg-green-50 text-green-800': order.status !== 'Processing' && order.status !== 'Shipped'
                  }"
               >
                 {{ order.status }}
               </span>
               <span class="font-serif text-xl text-sumi">${{ order.total }}</span>
             </div>
           </div>
        </div>

        <div v-else class="space-y-6 max-w-sm">
          <div>
            <label class="block text-xs uppercase tracking-widest text-stone-500 mb-2">Name</label>
            <div class="w-full bg-white border border-stone-200 p-3 text-sm text-sumi">{{ user.name }}</div>
          </div>
          <div>
            <label class="block text-xs uppercase tracking-widest text-stone-500 mb-2">Email</label>
            <div class="w-full bg-white border border-stone-200 p-3 text-sm text-sumi">{{ user.email }}</div>
          </div>
          <div class="pt-8">
            <button 
              @click="emit('logout')"
              class="px-6 py-2 border border-stone-300 text-stone-500 text-xs uppercase tracking-widest hover:border-red-900 hover:text-red-900 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>