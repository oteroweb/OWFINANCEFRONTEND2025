<template>
  <component :is="activeLayout">
    <template #page-content>
      <router-view />
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useQuasar } from 'quasar';

const LiteDesktopLayout = defineAsyncComponent(() => import('./LiteDesktopLayout.vue'));
const LiteMobileLayout = defineAsyncComponent(() => import('./LiteMobileLayout.vue'));
const ProLayout = defineAsyncComponent(() => import('./ProLayout.vue'));
const LegacyLayout = defineAsyncComponent(() => import('./LegacyLayout.vue'));

const auth = useAuthStore();
const $q = useQuasar();

const activeLayout = computed<Component>(() => {
  const mode = auth.settings?.layout_mode || auth.user?.layout_mode || 'lite';

  if (mode === 'lite') {
    return ($q.platform.is.desktop || $q.screen.gt.sm) ? LiteDesktopLayout : LiteMobileLayout;
  }

  if (mode === 'pro') return ProLayout;
  return LegacyLayout;
});
</script>
