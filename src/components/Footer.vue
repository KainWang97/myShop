<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToContact = () => {
  router.push("/contact");
};

const goToCollection = () => {
  router.push("/collection");
};

const goHome = () => {
  router.push("/");
};
</script>

<template>
  <footer class="bg-sumi text-stone-400 py-16 px-6">
    <div
      class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12"
    >
      <div>
        <h2 class="text-2xl font-serif text-washi mb-4 tracking-widest">
          CHOOSE
        </h2>
        <p class="text-xs font-light max-w-xs leading-relaxed">
          為生活所選，依品味所選。<br />
          選擇有品味的生活，這是更好的選擇。
        </p>
      </div>

      <div class="flex gap-12 text-xs tracking-widest uppercase">
        <div class="flex flex-col gap-4">
          <span class="text-washi">Shop</span>
          <button
            @click="goHome"
            class="hover:text-washi transition-colors text-left"
          >
            New Arrivals
          </button>
          <button
            @click="goToCollection"
            class="hover:text-washi transition-colors text-left"
          >
            Collection
          </button>
        </div>
        <div class="flex flex-col gap-4">
          <span class="text-washi">Support</span>
          <button
            @click="goToContact"
            class="hover:text-washi transition-colors text-left"
          >
            Contact
          </button>
        </div>
      </div>
    </div>

    <div
      class="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-800 text-[10px] flex justify-between"
    >
      <span>© 2025 CHOOSE SELECT</span>
      <span>Taipei</span>
    </div>
  </footer>
</template>
