<template>
  <CrudPage :dictionary="dictionary" />
</template>

<script setup lang="ts">
defineOptions({ name: 'UserCategoriesPage' });
import CrudPage from 'components/CrudPage.vue';
import { dictionary } from './dictionary';
</script>
