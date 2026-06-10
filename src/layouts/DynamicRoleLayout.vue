<template>
  <LiteDesktopLayout v-if="mode === 'lite' && !isMobile">
    <router-view />
  </LiteDesktopLayout>
  <LiteMobileLayout v-else-if="mode === 'lite' && isMobile">
    <router-view />
  </LiteMobileLayout>
  <ProLayout v-else-if="mode === 'pro'">
    <router-view />
  </ProLayout>
  <LegacyLayout v-else>
    <router-view />
  </LegacyLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useQuasar } from 'quasar';

const auth = useAuthStore();
const $q = useQuasar();

const mode = computed(() => auth.settings?.layout_mode || auth.user?.layout_mode || 'lite');
const isMobile = computed(() => $q.platform.is.mobile || $q.screen.lt.md);
</script>
