<template>
  <div />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
void router.replace({ path: '/login', query: { tab: 'register' } });
</script>
