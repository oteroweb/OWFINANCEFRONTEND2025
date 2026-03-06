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
            <span v-if="!$q.screen.lt.md" class="sep">•</span>
            <span v-if="!$q.screen.lt.md" class="email">{{ auth.user?.email }}</span>
            <span v-if="defaultCurrencyCode" class="currency-chip q-ml-sm">{{
              defaultCurrencyCode
            }}</span>
          </div>
        </div>

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
          <q-btn
            flat round dense
            :icon="ui.hideValues ? 'visibility_off' : 'visibility'"
            :aria-label="ui.hideValues ? 'Mostrar valores' : 'Ocultar valores'"
            :title="ui.hideValues ? 'Mostrar valores' : 'Ocultar valores'"
            @click="ui.toggleHideValues()"
          />
          <q-btn flat round dense icon="logout" aria-label="Cerrar sesión" @click="handleLogout" />
        </div>
      </q-toolbar>

      <!-- Moneda por defecto + tasas actuales del usuario -->
      <div class="bg-primary text-white q-px-md q-pb-sm q-pt-xs rates-strip">
        <div
          class="row items-center q-gutter-xs no-wrap"
          :class="{ 'scroll-x': !$q.screen.lt.md, 'justify-center': $q.screen.lt.md }"
        >
          <q-chip dense color="white" text-color="primary" class="text-weight-medium gt-xs">
            {{ defaultCurrencyCode || 'USD' }}
          </q-chip>
          <template v-for="r in currentRates" :key="r.code">
            <q-chip
              dense
              clickable
              color="white"
              text-color="primary"
              class="rate-chip-item"
              title="Clic para editar tasa"
              @click="openRateEdit(r)"
            >
              {{ r.code }}: {{ r.rateLabel }}
              <q-badge v-if="r.is_official" color="teal" class="q-ml-xs">oficial</q-badge>
            </q-chip>
          </template>
        </div>
      </div>
      <!-- Cántaros: disponible por mes -->
      <JarsBalanceBar ref="jarsBarRef" />
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
      <div class="q-pa-md column q-gutter-sm">
        <q-btn
          :color="ui.hideValues ? 'orange' : 'grey-7'"
          outline
          :icon="ui.hideValues ? 'visibility_off' : 'visibility'"
          :label="ui.hideValues ? 'Mostrar valores' : 'Ocultar valores'"
          class="full-width"
          @click="ui.toggleHideValues()"
        />
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
          :label="link.title"
        />
      </q-tabs>
    </q-footer>

    <TransactionCreateDialog
      v-if="ui.showDialogNewTransaction"
      :prefill-transaction-id="ui.prefillTransactionId"
    />

    <!-- Botón flotante global para nueva transacción -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab color="primary" icon="add" @click="ui.openNewTransactionDialog()" />
    </q-page-sticky>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { userMenuLinks, defaultAvatarUrl } from 'src/pages/user/config';
import { TransactionCreateDialog } from 'components';
import { PeriodFilterBar } from 'components/models';
import JarsBalanceBar from 'src/components/JarsBalanceBar.vue';
import { useUiStore } from 'stores/ui';
import { useQuasar } from 'quasar';
import { useUserRates } from 'src/composables/useUserRates';
import { api } from 'boot/axios';
const auth = useAuthStore();
const avatarUrl = computed(() => defaultAvatarUrl);
const { defaultCurrencyCode, currentRates } = useUserRates();
const menuLinks = userMenuLinks;
const ui = useUiStore();
const $q = useQuasar();
const router = useRouter();
const drawerOpen = ref(false);
const jarsBarRef = ref<InstanceType<typeof JarsBalanceBar>>();
// Refresh jars bar when new-transaction dialog closes
watch(
  () => ui.showDialogNewTransaction,
  (isOpen) => {
    if (!isOpen) {
      jarsBarRef.value?.refresh();
    }
  }
);
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
// (widgets removed for now; leave hooks ready if needed later)
interface RateChip {
  code: string;
  rate: number;
  rateLabel: string;
  is_official?: boolean;
}
function openRateEdit(r: RateChip) {
  $q.dialog({
    title: `Actualizar tasa: ${r.code}`,
    message: `¿Cuántos ${r.code} equivalen a 1 USD? (actual: ${r.rateLabel})`,
    prompt: {
      model: String(r.rate),
      type: 'number',
      isValid: (v: string) => !isNaN(Number(v)) && Number(v) > 0,
    },
    cancel: true,
  }).onOk((val: string) => {
    void (async () => {
      const newRate = Number(val);
      if (!newRate || newRate <= 0) return;
      try {
        const listRes = await api.get('/user_currencies', {
          params: { user_id: auth.user?.id, per_page: 100 },
        });
        const raw = listRes.data?.data?.data || listRes.data?.data || listRes.data || [];
        const records: Array<{ id: number; currency?: { code?: string } }> = Array.isArray(raw) ? raw : [];
        const found = records.find((rec) => rec.currency?.code === r.code);
        if (found) {
          await api.put(`/user_currencies/${found.id}`, { current_rate: newRate, is_current: true });
        }
        await auth.refreshUserCurrencies();
        $q.notify({ type: 'positive', message: `Tasa ${r.code} actualizada a ${newRate}` });
      } catch {
        $q.notify({ type: 'negative', message: 'Error actualizando tasa' });
      }
    })();
  });
}

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

// Cleanup on unmount
onBeforeUnmount(() => {
  // Asegurar que el diálogo se cierre al desmontar el layout
  if (ui.showDialogNewTransaction) {
    ui.closeNewTransactionDialog();
  }
});

/**
 * Al montar el layout, detecta monedas usadas en cuentas sin tasa configurada
 * y las crea automáticamente con rate=1 para que las conversiones funcionen.
 */
onMounted(() => {
  void (async () => {
    if (!auth.user?.id) return;
    try {
      // 1. Obtener tasas existentes y cuentas en paralelo
      const [ratesRes, accountsRes] = await Promise.all([
        api.get('/user_currencies', { params: { user_id: auth.user.id, per_page: 100 } }),
        api.get('/accounts'),
      ]);
      const ratesRaw = ratesRes.data?.data?.data || ratesRes.data?.data || ratesRes.data || [];
      const rates: Array<{ currency_id: number; is_current?: boolean }> = Array.isArray(ratesRaw) ? ratesRaw : [];
      const configuredIds = new Set(rates.map((r) => r.currency_id));

      type RawAcct = { currency?: { id?: number; code?: string }; currency_id?: number };
      const flat: RawAcct[] = Array.isArray(accountsRes.data?.data)
        ? (accountsRes.data.data as RawAcct[])
        : [];

      // 2. Monedas únicas de cuentas que no tienen tasa y no son la moneda base
      const defaultCurrId = auth.user?.currency_id;
      const seen = new Set<number>();
      const missing: Array<{ id: number; code: string }> = [];
      for (const acc of flat) {
        const cid = acc.currency?.id || acc.currency_id;
        const ccode = acc.currency?.code || '';
        if (!cid || seen.has(cid) || cid === defaultCurrId || configuredIds.has(cid)) continue;
        seen.add(cid);
        missing.push({ id: cid, code: ccode });
      }

      if (!missing.length) return;

      // 3. Crear tasas faltantes con rate=1
      for (const curr of missing) {
        await api.post('/user_currencies', {
          user_id: auth.user?.id,
          currency_id: curr.id,
          current_rate: 1,
          is_current: true,
          is_official: false,
        });
      }

      // 4. Refrescar store para que los chips y conversiones se actualicen
      await auth.refreshUserCurrencies();

      const names = missing.map((c) => c.code).join(', ');
      $q.notify({
        type: 'info',
        icon: 'info',
        message: `Monedas sin tasa configurada: ${names}. Se asignó tasa 1 como inicio. Actualiza la tasa real desde Configuración → Finanzas o haciendo clic en el chip.`,
        multiLine: true,
        timeout: 8000,
        actions: [{ label: 'OK', color: 'white' }],
      });
    } catch {
      // Silencioso — no interrumpir carga principal
    }
  })();
});
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
  padding: 0px 0px;
  margin: 0px;
  min-height: 52px;
}
/* Hacer que cada tab ocupe el mismo ancho y minimizar espacios */
.bottom-nav-tabs :deep(.q-tabs__content) {
  width: 100%;
}
.bottom-nav-tabs :deep(.q-tab) {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  padding: 0 2px;
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
