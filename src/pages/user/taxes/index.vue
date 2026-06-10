<template>
  <CrudPage :dictionary="dictionary" />
</template>

<script setup lang="ts">
defineOptions({ name: 'user_taxes_page' });
import CrudPage from 'components/CrudPage.vue';
import { dictionary } from './dictionary';
</script>
