<template>
  <CrudPage :dictionary="dictionary" />
</template>

<script setup lang="ts">
// Agregar nombre de componente para ESLint vue/multi-word-component-names
defineOptions({ name: 'TransactionsIndex' });

import CrudPage from 'components/CrudPage.vue';
import { dictionary } from './dictionary';
</script>
