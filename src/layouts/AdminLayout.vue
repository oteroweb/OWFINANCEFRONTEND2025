<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Admin Panel</q-toolbar-title>
        <q-btn label="Logout" color="negative" @click="handleLogout" flat class="q-ml-md" />
      </q-toolbar>
    </q-header>
    <q-drawer show-if-above v-model="drawer" side="left" bordered>
      <q-list>
        <q-item clickable v-ripple to="/admin/users">
          <q-item-section>Usuarios</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/reports">
          <q-item-section>Reportes</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/transactions">
          <q-item-section>Transacciones</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const auth = useAuthStore();
const drawer = ref(true);

async function handleLogout() {
  auth.logout();
  await router.push('/login');
}
</script>
