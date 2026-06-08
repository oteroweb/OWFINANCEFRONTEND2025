<template>
  <component :is="activeHomeView" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useAuthStore } from 'stores/auth';

// Lazy loading the specific home views to save bundle size
const LiteHomeView = defineAsyncComponent(() => import('src/components/views/LiteHomeView.vue'));
const LegacyHomeView = defineAsyncComponent(() => import('src/pages/user/user_dashboard.vue'));
// const ProHomeView = defineAsyncComponent(() => import('src/components/views/ProHomeView.vue'));

const auth = useAuthStore();

const activeHomeView = computed(() => {
  const mode = auth.settings?.layout_mode || 'legacy';
  if (mode === 'lite') return LiteHomeView;
  // if (mode === 'pro') return ProHomeView; // Uncomment when building ProHomeView
  return LegacyHomeView;
});
</script>
