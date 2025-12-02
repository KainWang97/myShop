<script setup lang="ts">
import { ref } from 'vue';
import type { User } from '../types';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'login', user: User): void;
}>();

const isLogin = ref(true);
const email = ref('');
const name = ref('');

const handleSubmit = () => {
  // Check for admin
  const isAdmin = email.value === 'admin@komorebi.com';

  const mockUser: User = {
    name: name.value || (isLogin.value ? (isAdmin ? 'Admin' : 'Hikaru Tanaka') : 'New Member'),
    email: email.value || 'user@example.com',
    orders: [],
    role: isAdmin ? 'ADMIN' : 'USER'
  };

  emit('login', mockUser);
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
      @click="emit('close')"
    />
    
    <!-- Modal -->
    <div class="relative bg-washi w-full max-w-md p-12 shadow-xl animate-fade-in-up">
      <button 
        @click="emit('close')" 
        class="absolute top-4 right-4 text-stone-400 hover:text-sumi"
      >
        ✕
      </button>

      <h2 class="text-2xl font-serif text-center mb-8 text-sumi">
        {{ isLogin ? 'Sign In' : 'Membership' }}
      </h2>

      <form class="space-y-6" @submit.prevent="handleSubmit">
         <div v-if="!isLogin">
            <label class="block text-xs uppercase tracking-widest text-stone-500 mb-2">Name</label>
            <input 
              type="text" 
              v-model="name"
              class="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-400 rounded-none" 
            />
          </div>
        
        <div>
          <label class="block text-xs uppercase tracking-widest text-stone-500 mb-2">Email</label>
          <input 
            type="email" 
            v-model="email"
            :placeholder="isLogin ? 'Try: admin@komorebi.com' : ''"
            class="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-400 rounded-none" 
          />
        </div>
        
        <div>
          <label class="block text-xs uppercase tracking-widest text-stone-500 mb-2">Password</label>
          <input type="password" class="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-400 rounded-none" />
        </div>

        <button class="w-full bg-sumi text-washi py-3 uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-colors">
          {{ isLogin ? 'Enter' : 'Join' }}
        </button>
      </form>

      <div class="mt-8 text-center">
        <button 
          @click="isLogin = !isLogin"
          class="text-xs text-stone-500 border-b border-transparent hover:border-stone-500 transition-colors"
        >
          {{ isLogin ? "Create an account" : "Already a member?" }}
        </button>
      </div>
    </div>
  </div>
</template>