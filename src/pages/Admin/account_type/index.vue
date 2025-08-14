<template>
  <CrudPage :dictionary="dictionary" />
</template>

<script setup lang="ts">
// Componente de lista de tipos de cuenta
defineOptions({ name: 'AccountTypeIndex' });

import CrudPage from 'components/CrudPage.vue';
import { dictionary } from './dictionary';
</script>

<style scoped>
/* Estilos opcionales para account_type */
</style>
