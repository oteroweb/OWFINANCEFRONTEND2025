<template>
  <CrudPage :dictionary="dictionary" />
</template>

<script setup lang="ts">
import CrudPage from 'components/CrudPage.vue';
import { dictionary } from './transactionsDictionary';
</script>
