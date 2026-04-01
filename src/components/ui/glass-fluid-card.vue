<template>
  <div class="relative overflow-hidden rounded-3xl bg-white/60 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-xl border border-white/80 transition-all">
    <!-- Optional gradient ambient blob -->
    <div v-if="ambient" class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
    <div v-if="ambient" class="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
    
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  ambient?: boolean; // If true, rendering soft color blurred blobs in the background
}>();
</script>
