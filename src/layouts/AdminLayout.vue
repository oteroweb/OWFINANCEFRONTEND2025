<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="adm-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" class="q-mr-sm" />
        <q-toolbar-title class="adm-header__title">
          <span class="adm-header__logo">OWF</span>
          <span class="adm-header__sub">Admin</span>
        </q-toolbar-title>
        <div class="adm-header__user" v-if="auth.user">
          <div class="adm-header__avatar">{{ initials }}</div>
          <span class="adm-header__name">{{ auth.user.name }}</span>
        </div>
        <q-btn flat dense icon="logout" @click="handleLogout" class="q-ml-sm" title="Cerrar sesión" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="drawer" side="left" :width="240" class="adm-drawer">
      <q-list padding>

        <!-- VISIÓN GENERAL -->
        <q-item-label header class="adm-drawer__section">Visión General</q-item-label>
        <q-item clickable v-ripple to="/admin" exact class="adm-drawer__item">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <!-- USUARIOS -->
        <q-item-label header class="adm-drawer__section">Usuarios</q-item-label>
        <q-item clickable v-ripple to="/admin/users" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="group" /></q-item-section>
          <q-item-section>Usuarios</q-item-section>
          <q-item-section side>
            <q-badge v-if="usersCount" :label="usersCount" color="primary" rounded />
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/roles" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="admin_panel_settings" /></q-item-section>
          <q-item-section>Roles</q-item-section>
        </q-item>

        <!-- CATÁLOGOS -->
        <q-item-label header class="adm-drawer__section">Catálogos</q-item-label>
        <q-item clickable v-ripple to="/admin/currencies" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="paid" /></q-item-section>
          <q-item-section>Monedas</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/account_type" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="account_balance" /></q-item-section>
          <q-item-section>Tipos de Cuenta</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/taxes" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="percent" /></q-item-section>
          <q-item-section>Impuestos</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/categories" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="folder" /></q-item-section>
          <q-item-section>Categorías</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/item_categories" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="category" /></q-item-section>
          <q-item-section>Cat. Ítem</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/items" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
          <q-item-section>Ítems</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/providers" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="storefront" /></q-item-section>
          <q-item-section>Proveedores</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/transaction_types" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="swap_horiz" /></q-item-section>
          <q-item-section>Tipos de Tx</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/clients" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="contacts" /></q-item-section>
          <q-item-section>Clientes</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/rates" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="currency_exchange" /></q-item-section>
          <q-item-section>Tasas</q-item-section>
        </q-item>

        <!-- SISTEMA -->
        <q-item-label header class="adm-drawer__section">Sistema</q-item-label>
        <q-item clickable v-ripple to="/admin/system" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="monitor_heart" /></q-item-section>
          <q-item-section>Estado</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/ai" class="adm-drawer__item">
          <q-item-section avatar><q-icon name="smart_toy" /></q-item-section>
          <q-item-section>Monitor IA</q-item-section>
        </q-item>

        <q-separator class="q-mt-md q-mb-sm" />
        <q-item clickable v-ripple @click="handleLogout" class="adm-drawer__item adm-drawer__item--logout">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>Cerrar sesión</q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container class="q-pa-md">
      <router-view v-slot="{ Component }">
        <transition name="slide-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { api } from 'boot/axios';

const router = useRouter();
const auth = useAuthStore();
const drawer = ref(true);
const usersCount = ref<number | null>(null);

const initials = computed(() => {
  const name = auth.user?.name || '';
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
});

onMounted(async () => {
  try {
    const res = await api.get('/admin/users', { params: { per_page: 1 } });
    usersCount.value = res.data?.meta?.total ?? res.data?.total ?? null;
  } catch { /* silencioso */ }
});

async function handleLogout() {
  auth.logout();
  await router.push('/login');
}
</script>

<style scoped>
.adm-header {
  background: #1E3A8A;
  color: #fff;
}
.adm-header__title {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.adm-header__logo {
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 0.04em;
}
.adm-header__sub {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.7;
}
.adm-header__user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.adm-header__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}
.adm-header__name {
  font-size: 13px;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.adm-drawer {
  background: #fff;
  border-right: 1px solid #E2E8F0;
}
.adm-drawer__section {
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: 0.07em !important;
  color: #94A3B8 !important;
  padding-top: 16px !important;
  padding-bottom: 4px !important;
}
.adm-drawer__item {
  border-radius: 8px;
  margin: 1px 8px;
  min-height: 38px;
  color: #334155;
  font-size: 13.5px;
}
.adm-drawer__item .q-icon {
  font-size: 18px;
  color: #64748B;
}
.adm-drawer__item.q-router-link--active,
.adm-drawer__item.q-router-link--exact-active {
  background: #EFF6FF !important;
  color: #1E3A8A !important;
}
.adm-drawer__item.q-router-link--active .q-icon,
.adm-drawer__item.q-router-link--exact-active .q-icon {
  color: #1E3A8A !important;
}
.adm-drawer__item--logout {
  color: #EF4444 !important;
}
.adm-drawer__item--logout .q-icon {
  color: #EF4444 !important;
}
</style>
