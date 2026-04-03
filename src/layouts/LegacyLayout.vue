<template>
  <q-layout view="hHh lpR fFf" :class="['user-shell', `user-shell--${activeLayoutMode}`]">
    <q-header
      :class="['user-shell__header', 'shell-surface', 'shell-surface--header', headerToneClass]"
    >
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
          <q-avatar size="36px" class="profile-mini__avatar">
            <img :src="avatarUrl" alt="avatar" />
          </q-avatar>
          <div class="profile-mini__meta">
            <div class="user-line ellipsis">
              <span class="name text-weight-medium">{{ auth.user?.name || 'Usuario' }}</span>
              <span v-if="!$q.screen.lt.md" class="sep">•</span>
              <span v-if="!$q.screen.lt.md" class="email">{{ auth.user?.email }}</span>
              <span v-if="defaultCurrencyCode" class="currency-chip q-ml-sm">{{
                defaultCurrencyCode
              }}</span>
            </div>
            <div v-if="!$q.screen.lt.md" class="profile-mini__layout-row">
              <span class="profile-mini__layout-label">Shell</span>
              <q-select
                :model-value="activeLayoutMode"
                :options="layoutModeOptions"
                emit-value
                map-options
                dense
                outlined
                options-dense
                behavior="menu"
                dropdown-icon="swap_vert"
                class="layout-select"
                popup-content-class="layout-select__menu"
                :disable="layoutModeSaving"
                @update:model-value="onLayoutModeChange"
              />
            </div>
          </div>
        </div>

        <div v-if="!$q.screen.lt.md" class="shell-mode-summary">
          <div class="shell-mode-summary__eyebrow">{{ shellTitle }}</div>
          <div class="shell-mode-summary__caption">{{ shellSubtitle }}</div>
        </div>

        <q-space />

        <!-- Menú (derecha) + Logout (oculto en móvil, menú pasa a drawer/bottom-nav) -->
        <div class="actions" v-if="!$q.screen.lt.md">
          <div class="menu-row">
            <q-btn
              v-for="link in desktopMenuLinks"
              :key="link.to"
              dense
              no-caps
              flat
              :to="link.to"
              :icon="link.icon"
              :label="link.title"
              :class="['menu-btn', { 'menu-btn--active': isActiveLink(link.to) }]"
            />
          </div>
          <q-btn
            flat
            round
            dense
            :icon="ui.hideValues ? 'visibility_off' : 'visibility'"
            :aria-label="ui.hideValues ? 'Mostrar valores' : 'Ocultar valores'"
            :title="ui.hideValues ? 'Mostrar valores' : 'Ocultar valores'"
            class="toolbar-icon-btn"
            @click="ui.toggleHideValues()"
          />
          <q-btn
            flat
            round
            dense
            icon="logout"
            aria-label="Cerrar sesión"
            class="toolbar-icon-btn"
            @click="handleLogout"
          />
        </div>
      </q-toolbar>

      <div :class="['q-px-md q-pb-sm q-pt-xs rates-strip', headerToneClass]">
        <div
          class="row items-center q-gutter-xs no-wrap"
          :class="{ 'scroll-x': !$q.screen.lt.md, 'justify-center': $q.screen.lt.md }"
        >
          <q-chip dense class="base-currency-chip text-weight-bold gt-xs">
            {{ defaultCurrencyCode || 'USD' }}
          </q-chip>
          <template v-for="r in currentRates" :key="r.code">
            <q-chip
              dense
              clickable
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
      <JarsBalanceBar
        ref="jarsBarRef"
        class="user-shell__jars shell-surface shell-surface--subtle"
      />
      <div class="period-strip shell-surface shell-surface--panel" :class="`period-strip--${activeLayoutMode}`">
        <PeriodFilterBar />
      </div>
    </q-header>

    <q-page-container class="user-shell__page-container">
      <div class="user-shell__content q-pa-md q-pb-xl" :class="pageContainerClasses">
        <router-view v-slot="{ Component }">
          <transition name="slide-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </q-page-container>

    <q-drawer
      v-model="drawerOpen"
      side="left"
      overlay
      :width="250"
      content-class="user-shell__drawer-content"
      class="user-shell__drawer"
      v-if="$q.screen.lt.md"
    >
      <div class="drawer-profile q-pa-md row items-center q-gutter-sm">
        <q-avatar size="40px" class="profile-mini__avatar">
          <img :src="avatarUrl" alt="avatar" />
        </q-avatar>
        <div class="col">
          <div class="text-body2 text-weight-medium ellipsis">
            {{ auth.user?.name || 'Usuario' }}
          </div>
          <div class="text-caption ellipsis">{{ auth.user?.email }}</div>
        </div>
      </div>
      <div class="q-px-md q-pb-sm">
        <div class="profile-mini__layout-label q-mb-xs">Shell</div>
        <q-select
          :model-value="activeLayoutMode"
          :options="layoutModeOptions"
          emit-value
          map-options
          dense
          outlined
          options-dense
          behavior="menu"
          dropdown-icon="swap_vert"
          class="layout-select layout-select--drawer full-width"
          popup-content-class="layout-select__menu"
          :disable="layoutModeSaving"
          @update:model-value="onLayoutModeChange"
        />
      </div>
      <q-separator />
      <q-list padding>
        <q-item
          v-for="link in menuLinks"
          :key="link.to"
          clickable
          v-ripple
          :to="link.to"
          :active="isActiveLink(link.to)"
          active-class="drawer-link--active"
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
          :color="ui.hideValues ? 'accent' : 'secondary'"
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

    <q-footer v-if="$q.screen.lt.md" class="user-shell__footer shell-surface shell-surface--panel">
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

    <q-page-sticky position="bottom-right" :offset="fabOffset">
      <q-btn fab color="primary" icon="add" @click="ui.openNewTransactionDialog()" />
    </q-page-sticky>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { userMenuLinks, defaultAvatarUrl } from 'src/pages/User/config';
import { TransactionCreateDialog } from 'components';
import { PeriodFilterBar } from 'components/models';
import JarsBalanceBar from 'src/components/JarsBalanceBar.vue';
import { useUiStore } from 'stores/ui';
import { useQuasar } from 'quasar';
import { useUserRates } from 'src/composables/useUserRates';
import { api } from 'boot/axios';
import { layoutModeOptions, normalizeLayoutMode, type UserLayoutMode } from 'src/utils/layoutMode';

const auth = useAuthStore();
const avatarUrl = computed(() => defaultAvatarUrl);
const { defaultCurrencyCode, currentRates } = useUserRates();
const menuLinks = userMenuLinks;
const ui = useUiStore();
const $q = useQuasar();
const router = useRouter();
const drawerOpen = ref(false);
const jarsBarRef = ref<InstanceType<typeof JarsBalanceBar>>();
const fabOffset = computed<[number, number]>(() => ($q.screen.lt.md ? [18, 86] : [24, 24]));
const layoutModeSaving = ref(false);

const activeLayoutMode = computed<UserLayoutMode>(() => normalizeLayoutMode(auth.user?.layout_mode));
const headerToneClass = computed(() =>
  activeLayoutMode.value === 'legacy' ? 'text-dark' : 'text-white'
);
const shellTitle = computed(() => {
  if (activeLayoutMode.value === 'legacy') return 'Workspace Legacy';
  if (activeLayoutMode.value === 'lite') return 'Workspace Lite';
  return 'Workspace Pro';
});
const shellSubtitle = computed(() => {
  if (activeLayoutMode.value === 'legacy') return 'Mas contexto, mas densidad y navegacion clasica.';
  if (activeLayoutMode.value === 'lite') return 'Menos ruido, foco rapido y cabecera compacta.';
  return 'Balance entre densidad, atajos y lectura.';
});
const desktopMenuLinks = computed(() =>
  activeLayoutMode.value === 'lite' ? menuLinks.slice(0, 4) : menuLinks
);
const pageContainerClasses = computed(() => ({
  'user-shell__content--legacy': activeLayoutMode.value === 'legacy',
  'user-shell__content--lite': activeLayoutMode.value === 'lite',
}));

function isActiveLink(target: string) {
  return router.currentRoute.value.path.startsWith(target);
}

async function onLayoutModeChange(nextMode: UserLayoutMode | null) {
  const normalizedMode = normalizeLayoutMode(nextMode);
  if (normalizedMode === activeLayoutMode.value || layoutModeSaving.value) return;

  layoutModeSaving.value = true;
  try {
    await auth.updateLayoutMode(normalizedMode);
  } catch {
    $q.notify({
      type: 'negative',
      message: 'No se pudo actualizar el shell visual. Intenta nuevamente.',
    });
  } finally {
    layoutModeSaving.value = false;
  }
}

// Refresh jars bar when new-transaction dialog closes
watch(
  () => ui.showDialogNewTransaction,
  (isOpen) => {
    if (!isOpen) {
      jarsBarRef.value?.refresh();
    }
  },
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
  { immediate: true },
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
        const records: Array<{ id: number; currency?: { code?: string } }> = Array.isArray(raw)
          ? raw
          : [];
        const found = records.find((rec) => rec.currency?.code === r.code);
        if (found) {
          await api.put(`/user_currencies/${found.id}`, {
            current_rate: newRate,
            is_current: true,
          });
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
      const rates: Array<{ currency_id: number; is_current?: boolean }> = Array.isArray(ratesRaw)
        ? ratesRaw
        : [];
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
.user-shell {
  color: var(--ow-text-primary);
}

.user-shell__header {
  border-bottom: none;
}

.topbar {
  min-height: 68px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-mini {
  max-width: 420px;
}

.shell-mode-summary {
  min-width: 200px;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shell-mode-summary__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.shell-mode-summary__caption {
  font-size: 12px;
  opacity: 0.82;
  line-height: 1.3;
}

.profile-mini__meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-mini__avatar {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.32);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
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
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.5px;
  font-weight: 600;
  backdrop-filter: saturate(180%) blur(4px);
}

.profile-mini__layout-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-mini__layout-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.72;
}

.layout-select {
  width: 148px;
}

.layout-select :deep(.q-field__control) {
  min-height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.layout-select :deep(.q-field__native),
.layout-select :deep(.q-field__marginal),
.layout-select :deep(.q-field__label) {
  color: currentColor;
}

.layout-select :deep(.q-field__control::before),
.layout-select :deep(.q-field__control::after) {
  border-radius: 999px;
}

.layout-select--drawer {
  width: 100%;
}

.layout-select--drawer :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08);
}

.rates-strip .q-chip {
  height: 28px;
}

.base-currency-chip,
.rate-chip-item {
  background: rgba(255, 255, 255, 0.92);
  color: var(--ow-color-primary-strong);
  border: 1px solid rgba(255, 255, 255, 0.56);
  box-shadow: 0 10px 24px rgba(8, 47, 73, 0.12);
}

.scroll-x {
  overflow-x: auto;
}

.rate-chip-item {
  white-space: nowrap;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.rate-chip-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(8, 47, 73, 0.16);
}

.actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.menu-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 8px;
}

.menu-btn {
  min-height: 40px;
  padding-inline: 12px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.82);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.menu-btn--active {
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.toolbar-icon-btn {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.user-shell__jars {
  margin-inline: 12px;
  border-radius: var(--radius-md);
  border-color: rgba(255, 255, 255, 0.12);
}

.period-strip {
  margin: 10px 12px 0;
  border-radius: var(--radius-md);
  color: var(--ow-text-primary);
}

.period-strip--legacy {
  margin-top: 8px;
}

.period-strip--lite {
  margin-top: 6px;
}

.user-shell__page-container {
  padding-top: 12px;
}

.user-shell__content {
  min-height: 100%;
  width: 100%;
  max-width: var(--user-shell-content-max-width, 1440px);
  margin: 0 auto;
  transition:
    max-width 0.2s ease,
    padding 0.2s ease;
}

.user-shell__content--legacy {
  padding-inline: 8px;
}

.user-shell__content--lite {
  padding-inline: 6px;
}

.bottom-nav-tabs :deep(.q-tab__content) {
  padding: 0px 0px;
  margin: 0px;
  min-height: 52px;
}

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

.user-shell__drawer {
  color: var(--ow-text-primary);
}

.user-shell__drawer-content {
  background: linear-gradient(180deg, rgba(248, 252, 255, 0.98) 0%, rgba(239, 246, 255, 0.98) 100%);
}

.drawer-link--active {
  color: var(--ow-color-primary-strong);
  background: rgba(14, 165, 233, 0.12);
}

.user-shell__footer {
  margin: 0 12px 12px;
  border-radius: 22px;
  border: 1px solid var(--ow-surface-border);
  overflow: hidden;
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

  .topbar {
    min-height: 62px;
  }

  .user-shell__page-container {
    padding-top: 8px;
  }
}

.drawer-profile {
  background: var(--ow-shell-header-bg);
  color: #fff;
}

.drawer-profile .text-caption {
  opacity: 0.85;
}

.user-shell--pro {
  --user-shell-content-max-width: 1440px;
}

.user-shell--lite {
  --ow-shell-header-bg: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.94) 0%,
    rgba(8, 47, 73, 0.9) 45%,
    rgba(14, 165, 233, 0.82) 100%
  );
  --user-shell-content-max-width: 1120px;
}

.user-shell--lite .shell-mode-summary__caption {
  max-width: 220px;
}

.user-shell--lite .menu-row {
  gap: 4px;
}

.user-shell--lite .menu-btn {
  padding-inline: 10px;
}

.user-shell--legacy {
  --ow-shell-header-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.96) 100%);
  --ow-surface-border-strong: rgba(148, 163, 184, 0.28);
  --ow-shadow-strong: 0 16px 34px rgba(15, 23, 42, 0.08);
  --user-shell-content-max-width: 100%;
}

.user-shell--legacy .shell-mode-summary__caption {
  color: var(--ow-text-muted);
}

.user-shell--legacy .profile-mini__avatar {
  background: rgba(14, 165, 233, 0.1);
  border-color: rgba(14, 165, 233, 0.2);
  color: var(--ow-color-primary-strong);
}

.user-shell--legacy .menu-btn,
.user-shell--legacy .toolbar-icon-btn,
.user-shell--legacy .user-line .email,
.user-shell--legacy .user-line .sep,
.user-shell--legacy .profile-mini__layout-label,
.user-shell--legacy .drawer-profile .text-caption {
  color: var(--ow-text-muted);
}

.user-shell--legacy .menu-btn--active {
  color: var(--ow-color-primary-strong);
  background: rgba(14, 165, 233, 0.12);
  box-shadow: inset 0 0 0 1px rgba(14, 165, 233, 0.12);
}

.user-shell--legacy .toolbar-icon-btn,
.user-shell--legacy .currency-chip,
.user-shell--legacy .layout-select :deep(.q-field__control),
.user-shell--legacy .layout-select--drawer :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.86);
}

.user-shell--legacy .drawer-profile {
  color: var(--ow-text-primary);
}
</style>
