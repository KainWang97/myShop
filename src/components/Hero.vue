<script setup lang="ts">
// Static component
</script>

<template>
  <header class="relative w-full h-screen overflow-hidden flex items-center justify-center">
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
      <p class="text-stone-700 tracking-[0.3em] text-xs uppercase animate-fade-in-up">
        Choose a tasteful life
      </p>
      <h1 class="text-5xl md:text-7xl font-serif text-sumi tracking-widest leading-tight">
        生活是<br />
        <span class="text-4xl md:text-6xl block mt-4">你所選</span>
      </h1>
      <div class="w-12 h-[1px] bg-stone-800 mx-auto mt-8"></div>
      <p class="text-stone-600 font-light text-sm tracking-widest pt-4 leading-loose">
        品味也是你所選。<br/>
        選擇有品味的生活，更好的選擇。
      </p>
    </div>
    
    <!-- Scroll Indicator -->
    <div class="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
      <span class="text-[10px] tracking-widest uppercase">Scroll</span>
      <div class="w-[1px] h-12 bg-stone-800"></div>
    </div>
  </header>
</template>