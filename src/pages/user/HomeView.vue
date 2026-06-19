<template>
  <LiteHomeView v-if="!isPro" />
  <ProHomeView v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from 'stores/auth';
import LiteHomeView from './LiteHomeView.vue';
import ProHomeView from './ProHomeView.vue';

defineOptions({ name: 'HomeView' });

const auth = useAuthStore();
const isPro = computed(() => (auth.settings?.layout_mode ?? auth.user?.layout_mode) === 'pro');
</script>
