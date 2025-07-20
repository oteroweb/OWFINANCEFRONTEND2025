<template>
  <q-page class="q-pa-md">
    <h2>Hola, {{ auth.user?.name }}</h2>
    <p>Esta es tu vista de usuario final</p>
  </q-page>
</template>

<script setup lang="ts">
import { useAuthStore } from 'stores/auth';

const auth = useAuthStore();
</script>
