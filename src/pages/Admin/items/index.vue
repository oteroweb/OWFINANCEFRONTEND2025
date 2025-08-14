<template>
  <CrudPage :dictionary="dictionary" />
</template>

<script setup lang="ts">
// Componente de lista de items
defineOptions({ name: 'ItemsIndex' });

import CrudPage from 'components/CrudPage.vue';
import { dictionary } from './dictionary';
</script>

<style scoped>
/* Estilos opcionales para items */
</style>
