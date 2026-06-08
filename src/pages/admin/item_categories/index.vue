<template>
  <CrudPage :dictionary="dictionary" />
</template>

<script setup lang="ts">
// Componente de lista de categorías de ítem
defineOptions({ name: 'ItemCategoriesIndex' });

import CrudPage from 'components/CrudPage.vue';
import { dictionary } from './dictionary';
</script>

<style scoped>
/* Estilos opcionales para item_categories */
</style>
