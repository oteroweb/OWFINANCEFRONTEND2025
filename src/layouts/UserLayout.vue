<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Usuario</q-toolbar-title>
        <q-btn label="Logout" color="negative" @click="handleLogout" flat class="q-ml-md" />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const auth = useAuthStore();

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>
