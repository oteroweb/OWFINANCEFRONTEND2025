<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <!-- Top bar: toggle widgets, title, tabs, user menu -->
      <q-toolbar class="q-py-xs">
        <q-btn
          flat
          round
          dense
          icon="widgets"
          @click="leftDrawerOpen = !leftDrawerOpen"
        >
          <q-tooltip>Panel de widgets</q-tooltip>
        </q-btn>
        <q-toolbar-title class="ellipsis">Área de Usuario</q-toolbar-title>
        <q-space />
        <!-- Navigation tabs (top menu) -->
        <div class="q-mr-md hide-on-xs">
          <q-tabs inline-label shrink stretch>
            <q-route-tab
              v-for="link in menuLinks"
              :key="link.to"
              :to="link.to"
              :label="link.title"
              :icon="link.icon"
              exact
            />
          </q-tabs>
        </div>
        <!-- User profile dropdown -->
        <q-btn flat round dense>
          <q-avatar size="32px">
            <img :src="avatarUrl" alt="avatar" />
          </q-avatar>
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 220px">
              <q-item>
                <q-item-section avatar>
                  <q-avatar size="40px"><img :src="avatarUrl" alt="avatar" /></q-avatar>
                </q-item-section>
                <q-item-section>
                  <div class="text-subtitle2 ellipsis">{{ auth.user?.name || 'Usuario' }}</div>
                  <div class="text-caption ellipsis">{{ auth.user?.email }}</div>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-ripple @click="goProfile">
                <q-item-section avatar><q-icon name="person" /></q-item-section>
                <q-item-section>Perfil</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="handleLogout">
                <q-item-section avatar><q-icon name="logout" /></q-item-section>
                <q-item-section>Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
      <!-- Secondary row on mobile: tabs below -->
      <q-toolbar class="show-on-xs q-py-none">
        <q-tabs inline-label shrink stretch>
          <q-route-tab
            v-for="link in menuLinks"
            :key="link.to + '-m'"
            :to="link.to"
            :label="link.title"
            :icon="link.icon"
            exact
          />
        </q-tabs>
      </q-toolbar>
    </q-header>

    <!-- Left drawer repurposed as widgets panel -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area class="fit">
        <div class="q-pa-md column q-gutter-md">
          <div>
            <div class="text-subtitle2 q-mb-xs">Widgets</div>
            <div class="text-caption text-grey-7">Aquí podrás fijar balance, atajos y más.</div>
          </div>
          <div v-if="isJarsRoute">
            <BigJarSidebar />
            <q-separator class="q-my-md" />
          </div>
          <!-- Placeholder for future widgets (balances, exchange, etc.) -->
          <div class="text-caption text-grey">Próximamente: Balances, cambio de divisas, etc.</div>
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
    <TransactionCreateDialog />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { userMenuLinks, defaultAvatarUrl } from 'src/pages/user/config';
import { useUiStore } from 'stores/ui';
import BigJarSidebar from 'components/BigJarSidebar.vue';
// @ts-expect-error Vue SFC default export is declared in env.d.ts
import TransactionCreateDialog from 'components/TransactionCreateDialog.vue';

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

function goProfile() {
  void router.push('/user/settings');
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

/* Responsive helpers for tabs */
.hide-on-xs {
  display: inline-block;
}
.show-on-xs {
  display: none;
}
@media (max-width: 599px) {
  .hide-on-xs {
    display: none;
  }
  .show-on-xs {
    display: block;
  }
}
</style>
