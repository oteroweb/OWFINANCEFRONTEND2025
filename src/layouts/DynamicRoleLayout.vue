<template>
  <!-- El router-view está dentro de cada layout hijo, no aquí -->
  <component :is="activeLayout" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useQuasar } from 'quasar';

// Lazy loading the specific layout components so we only fetch those that the user actively uses
const LiteMobileLayout = defineAsyncComponent(() => import('./LiteMobileLayout.vue'));
const LiteDesktopLayout = defineAsyncComponent(() => import('./LiteDesktopLayout.vue'));
const ProLayout = defineAsyncComponent(() => import('./ProLayout.vue'));
const LegacyLayout = defineAsyncComponent(() => import('./LegacyLayout.vue'));

const auth = useAuthStore();
const $q = useQuasar();

const activeLayout = computed(() => {
  const mode = auth.settings?.layout_mode || 'legacy';
  
  if (mode === 'lite') {
    // For Lite mode, choose layout based on screen size/device type
    return $q.platform.is.desktop || $q.screen.gt.sm ? LiteDesktopLayout : LiteMobileLayout;
  }
  
  if (mode === 'pro') return ProLayout;
  return LegacyLayout;
});
</script>
