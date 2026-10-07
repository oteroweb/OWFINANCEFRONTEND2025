<template>
  <div>
    <!-- OWF-370 Fase 2: arranque de una empresa nueva (se auto-oculta fuera de contexto empresa) -->
    <BusinessEmptyState />
    <LiteHomeView v-if="!isPro" />
    <ProHomeView v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from 'stores/auth';
import LiteHomeView from './LiteHomeView.vue';
import ProHomeView from './ProHomeView.vue';
import BusinessEmptyState from 'components/business/BusinessEmptyState.vue';

defineOptions({ name: 'HomeView' });

const auth = useAuthStore();
const isPro = computed(() => (auth.settings?.layout_mode ?? auth.user?.layout_mode) === 'pro');
</script>
