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
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { userMenuLinks, defaultAvatarUrl } from 'src/pages/user/config';

const router = useRouter();
const auth = useAuthStore();
const leftDrawerOpen = ref(true);
const avatarUrl = computed(() => defaultAvatarUrl);
const menuLinks = userMenuLinks;

async function handleLogout() {
  auth.logout();
  await router.push('/login');
}
</script>

<style scoped>
.q-drawer {
  width: 260px;
}
</style>
