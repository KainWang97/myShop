<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'submit', name: string, email: string, message: string): void;
}>();

const name = ref('');
const email = ref('');
const message = ref('');
const submitted = ref(false);

const handleSubmit = () => {
  emit('submit', name.value, email.value, message.value);
  submitted.value = true;
  setTimeout(() => {
    submitted.value = false;
    name.value = '';
    email.value = '';
    message.value = '';
  }, 3000);
};
</script>

<template>
  <section class="py-24 bg-stone-100 border-t border-stone-200">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-3xl font-serif text-sumi mb-12">Inquiries</h2>
      
      <form @submit.prevent="handleSubmit" class="max-w-lg mx-auto space-y-6 text-left">
        <div>
          <label class="block text-xs uppercase tracking-widest text-stone-500 mb-2">Name</label>
          <input 
            required
            type="text" 
            v-model="name"
            class="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors rounded-none"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-widest text-stone-500 mb-2">Email</label>
          <input 
            required
            type="email" 
            v-model="email"
            class="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors rounded-none"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-widest text-stone-500 mb-2">Message</label>
          <textarea 
            required
            rows="4"
            v-model="message"
            class="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors resize-none rounded-none"
          ></textarea>
        </div>
        
        <div class="text-center pt-8">
          <button 
            :disabled="submitted"
            class="px-12 py-3 border border-sumi text-sumi uppercase text-xs tracking-[0.2em] transition-all"
            :class="submitted ? 'bg-stone-800 text-washi border-stone-800' : 'hover:bg-sumi hover:text-washi'"
          >
            {{ submitted ? 'Sent' : 'Send' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>