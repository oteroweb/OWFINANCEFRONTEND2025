<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="topbar">
        <!-- Botón menú móvil -->
        <q-btn
          v-if="$q.screen.lt.md"
          flat
          round
          dense
          icon="menu"
          aria-label="Abrir menú"
          @click="drawerOpen = true"
        />
        <!-- Perfil -->
        <div class="profile-mini row items-center no-wrap q-gutter-sm">
          <q-avatar size="34px" class="bg-white text-primary">
            <img :src="avatarUrl" alt="avatar" />
          </q-avatar>
          <div class="user-line ellipsis">
            <span class="name text-weight-medium">{{ auth.user?.name || 'Usuario' }}</span>
            <span class="sep">•</span>
            <span class="email">{{ auth.user?.email }}</span>
            <span v-if="defaultCurrencyCode" class="currency-chip">{{ defaultCurrencyCode }}</span>
          </div>
        </div>

        <!-- Menú retirado de la izquierda -->

        <q-space />

        <!-- Menú (derecha) + Logout (oculto en móvil, menú pasa a drawer/bottom-nav) -->
        <div class="actions" v-if="!$q.screen.lt.md">
          <div class="menu-row">
            <q-btn
              v-for="link in menuLinks"
              :key="link.to"
              dense
              no-caps
              flat
              :to="link.to"
              :icon="link.icon"
              :label="link.title"
              class="menu-btn"
            />
          </div>
          <q-btn flat round dense icon="logout" aria-label="Cerrar sesión" @click="handleLogout" />
        </div>
      </q-toolbar>
      <!-- Moneda por defecto + tasas actuales del usuario -->
      <div class="bg-primary text-white q-px-md q-pb-sm q-pt-xs rates-strip">
        <div class="row items-center q-gutter-xs no-wrap scroll-x">
          <q-chip dense color="white" text-color="primary" class="text-weight-medium">
            {{ defaultCurrencyCode || 'USD' }}
          </q-chip>
          <template v-for="r in currentRates" :key="r.code">
            <q-chip dense color="white" text-color="primary" class="rate-chip-item">
              {{ r.code }}: {{ r.rateLabel }}
              <q-badge v-if="r.is_official" color="teal" class="q-ml-xs">oficial</q-badge>
            </q-chip>
          </template>
        </div>
      </div>
      <!-- Barra de periodos global -->
      <div class="bg-white text-dark">
        <PeriodFilterBar />
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Drawer lateral para móvil -->
    <q-drawer
      v-model="drawerOpen"
      side="left"
      overlay
      bordered
      :width="250"
      content-class="bg-white"
      v-if="$q.screen.lt.md"
    >
      <div class="drawer-profile q-pa-md row items-center q-gutter-sm">
        <q-avatar size="40px" class="bg-primary text-white">
          <img :src="avatarUrl" alt="avatar" />
        </q-avatar>
        <div class="col">
          <div class="text-body2 text-weight-medium ellipsis">
            {{ auth.user?.name || 'Usuario' }}
          </div>
          <div class="text-caption ellipsis">{{ auth.user?.email }}</div>
        </div>
      </div>
      <q-separator />
      <q-list padding>
        <q-item
          v-for="link in menuLinks"
          :key="link.to"
          clickable
          v-ripple
          :to="link.to"
          @click="drawerOpen = false"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.title }}</q-item-section>
        </q-item>
      </q-list>
      <div class="q-pa-md">
        <q-btn
          color="primary"
          outline
          icon="logout"
          label="Cerrar sesión"
          class="full-width"
          @click="
            () => {
              drawerOpen = false;
              handleLogout();
            }
          "
        />
      </div>
    </q-drawer>

    <!-- Bottom navigation para móvil -->
    <q-footer v-if="$q.screen.lt.md" elevated class="bg-white text-primary">
      <q-tabs
        v-model="bottomNav"
        dense
        active-color="primary"
        indicator-color="primary"
        class="full-width text-primary bottom-nav-tabs"
        @update:model-value="onBottomNav"
      >
        <q-tab
          v-for="link in bottomNavLinks"
          :key="link.to"
          :name="link.to"
          :icon="link.icon"
          :label="truncateLabel(link.title)"
        />
      </q-tabs>
    </q-footer>

    <TransactionCreateDialog />
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { userMenuLinks, defaultAvatarUrl } from 'src/pages/user/config';
import { TransactionCreateDialog } from 'components';
import { PeriodFilterBar } from 'components/models';
import { useUiStore } from 'stores/ui';
import { useQuasar } from 'quasar';
import { useUserRates } from 'src/composables/useUserRates';
const auth = useAuthStore();
const avatarUrl = computed(() => defaultAvatarUrl);
const { defaultCurrencyCode, currentRates } = useUserRates();
const menuLinks = userMenuLinks;
const ui = useUiStore();
const $q = useQuasar();
const router = useRouter();
const drawerOpen = ref(false);
// bottom navigation state
const bottomNav = ref<string>('');
// Seleccionar subconjunto (máx 4) para bottom nav
const bottomNavLinks = computed(() => menuLinks.slice(0, 4));
watch(
  () => router.currentRoute.value.fullPath,
  (path) => {
    // Marcar tab activa si coincide
    const match = bottomNavLinks.value.find((l) => path.startsWith(l.to));
    if (match) bottomNav.value = match.to;
  },
  { immediate: true }
);
function onBottomNav(val: string) {
  if (val && val !== router.currentRoute.value.fullPath) {
    router.push(val).catch(() => undefined);
  }
}
function truncateLabel(t: string): string {
  if (!t) return '';
  return t.length > 12 ? t.slice(0, 10) + '…' : t;
}

// (widgets removed for now; leave hooks ready if needed later)
async function handleLogout() {
  // 1) Mostrar modal con botón OK y, al confirmarlo, proceder a cerrar sesión
  try {
    await new Promise<void>((resolve) => {
      $q.dialog({
        title: 'Cerrando sesión',
        message: 'Tu sesión se cerrará ahora.',
        ok: { label: 'OK', color: 'primary' },
        persistent: true,
      }).onOk(() => resolve());
    });
  } catch {
    /* ignore dialog errors */
  }

  // 2) Mostrar overlay de carga mientras se ejecuta el logout y la navegación
  try {
    $q.loading.show({ message: 'Cerrando sesión…' });
  } catch {
    /* ignore loading errors */
  }
  // Cerrar diálogos que puedan disparar watchers (como el de transacciones)
  try {
    ui.closeNewTransactionDialog();
  } catch {
    /* ignore dialog close errors */
  }
  try {
    auth.logout();
    await router.replace('/login');
  } catch {
    try {
      $q.notify({ type: 'negative', message: 'No se pudo redirigir al login' });
    } catch {
      /* ignore notify errors */
    }
  } finally {
    try {
      $q.loading.hide();
    } catch {
      /* ignore loading errors */
    }
  }
}

// Nueva transacción se invocará desde vistas específicas o accesos dedicados
// Moneda por defecto global disponible en defaultCurrencyCode
</script>

<style scoped>
/* topbar actions spacing handled inline */
/* Top single toolbar */
.topbar {
  min-height: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.profile-mini {
  max-width: 420px;
}
.user-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.user-line .name,
.user-line .email {
  white-space: nowrap;
}
.user-line .email {
  opacity: 0.9;
  font-size: 12px;
}
.user-line .sep {
  opacity: 0.6;
}
.currency-chip {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.5px;
  font-weight: 600;
  backdrop-filter: saturate(180%) blur(4px);
}
.rates-strip .q-chip {
  height: 22px;
}
.scroll-x {
  overflow-x: auto;
}
.rate-chip-item {
  white-space: nowrap;
}
.actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
.menu-scroll {
  height: 42px;
  max-width: 100%;
}
.menu-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 8px;
}
.bottom-nav-tabs :deep(.q-tab__content) {
  padding: 2px 2px 4px;
  min-height: 44px;
}
/* Hacer que cada tab ocupe el mismo ancho y minimizar espacios */
.bottom-nav-tabs :deep(.q-tabs__content) {
  width: 100%;
}
.bottom-nav-tabs :deep(.q-tab) {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
}
.bottom-nav-tabs :deep(.q-tab__content) {
  width: 100%;
  justify-content: center;
}
.bottom-nav-tabs :deep(.q-tab__icon) {
  font-size: 22px;
  line-height: 1;
}
.bottom-nav-tabs :deep(.q-tab__label) {
  font-size: 10px;
  line-height: 1.05;
  margin-top: 2px;
  letter-spacing: 0.3px;
}
.bottom-nav-tabs :deep(.q-tab--active .q-tab__label) {
  font-weight: 600;
}
.bottom-nav-tabs :deep(.q-tab__indicator) {
  height: 2px;
}
@media (max-width: 380px) {
  .bottom-nav-tabs :deep(.q-tab__label) {
    font-size: 9px;
  }
  .bottom-nav-tabs :deep(.q-tab__icon) {
    font-size: 20px;
  }
}
@media (max-width: 1023px) {
  /* ocultar fila de menú en pantallas pequeñas */
  .menu-row {
    display: none;
  }
}
@media (max-width: 1023px) {
  .actions {
    display: none;
  }
}
.menu-btn :deep(.q-btn__content) {
  gap: 6px;
}
@media (max-width: 599px) {
  .profile-mini {
    max-width: 260px;
  }
  .menu-scroll {
    height: 38px;
  }
}
/* Drawer tweaks */
.drawer-profile {
  background: var(--q-primary);
  color: #fff;
}
.drawer-profile .text-caption {
  opacity: 0.85;
}
</style>
