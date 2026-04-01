<template>
  <component :is="activeLayout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useAuthStore } from 'stores/auth';

// Lazy loading the specific layout components so we only fetch those that the user actively uses
const LiteMobileLayout = defineAsyncComponent(() => import('./LiteMobileLayout.vue'));
const ProLayout = defineAsyncComponent(() => import('./ProLayout.vue'));
const LegacyLayout = defineAsyncComponent(() => import('./LegacyLayout.vue'));

const auth = useAuthStore();

const activeLayout = computed(() => {
  const mode = auth.settings?.layout_mode || 'legacy';
  if (mode === 'lite') return LiteMobileLayout;
  if (mode === 'pro') return ProLayout;
  return LegacyLayout;
});
</script>
