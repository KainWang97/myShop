<script setup>
// Static component
</script>

<template>
  <header
    class="relative w-full h-screen overflow-hidden flex items-center justify-center"
  >
    <!-- Background -->
    <div class="absolute inset-0 z-0">
      <img
        src="https://picsum.photos/1920/1080?grayscale&blur=1"
        alt="Minimalist Interior"
        class="w-full h-full object-cover opacity-90"
      />
      <div class="absolute inset-0 bg-stone-100/20 mix-blend-overlay"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center space-y-6 max-w-4xl px-6">
      <h1
        class="text-stone-700 tracking-[0.3em] text-m uppercase animate-fade-in-up"
      >
        Choose a tasteful life
      </h1>
    </div>

    <!-- Scroll Indicator -->
    <div
      v-if="products && products.length > 0"
      class="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
    >
      <span class="text-[10px] tracking-widest uppercase">Scroll</span>
      <div class="w-[1px] h-12 bg-stone-800"></div>
    </div>
  </header>
</template>
