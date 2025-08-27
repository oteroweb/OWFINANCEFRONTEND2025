<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>Área de Usuario</q-toolbar-title>
        <q-space />
        <q-btn flat round dense icon="logout" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="column items-center q-gutter-sm q-mb-md">
            <q-avatar size="72px">
              <img :src="avatarUrl" alt="avatar" />
            </q-avatar>
            <div class="text-subtitle1 ellipsis">{{ auth.user?.name || 'Usuario' }}</div>
            <div class="text-caption text-grey">{{ auth.user?.email }}</div>
          </div>
          <q-list padding>
            <q-item v-for="link in menuLinks" :key="link.to" clickable v-ripple :to="link.to" exact>
              <q-item-section avatar><q-icon :name="link.icon" /></q-item-section>
              <q-item-section>{{ link.title }}</q-item-section>
            </q-item>
          </q-list>
        </div>
        <div v-if="isJarsRoute" class="q-mb-md">
          <BigJarSidebar />
          <q-separator class="q-my-md" />
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Floating action button to create a new transaction -->
    <q-btn fab color="primary" icon="add" class="fab-add" @click="openGlobalNewTransaction">
      <q-tooltip>Nueva transacción</q-tooltip>
    </q-btn>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { userMenuLinks, defaultAvatarUrl } from 'src/pages/user/config';
import { useUiStore } from 'stores/ui';
import BigJarSidebar from 'components/BigJarSidebar.vue';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const leftDrawerOpen = ref(true);
const avatarUrl = computed(() => defaultAvatarUrl);
const menuLinks = userMenuLinks;
const ui = useUiStore();
const isJarsRoute = computed(() => route.path.includes('/user/jars'));

async function handleLogout() {
  auth.logout();
  await router.push('/login');
}

function openGlobalNewTransaction() {
  // Open the global dialog without changing the current route
  ui.openNewTransactionDialog();
}
</script>

<style scoped>
.q-drawer {
  width: 260px;
}
.fab-add {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 2000;
}
</style>
