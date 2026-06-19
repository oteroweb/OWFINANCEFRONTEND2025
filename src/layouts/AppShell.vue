<template>
  <q-layout
    view="hHh lpR fFf"
    class="shell"
    :class="{
      'shell--pro': isPro,
      'shell--mobile': isMobile,
      'shell--desktop': !isMobile,
    }"
  >
    <!-- ═══ PRO DESKTOP: sidebar izquierdo ═══════════════════════════════ -->
    <aside v-show="isPro && !isMobile" class="shell__sidebar">
      <!-- Logo -->
      <div class="shell__sidebar-logo" @click="router.push('/user/home')">
        <div class="shell__sidebar-logo-mark">OW</div>
        <div class="shell__sidebar-logo-text">
          <span>Finance</span>
          <span class="shell__sidebar-logo-badge">PRO</span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="shell__sidebar-nav">
        <div class="shell__sidebar-nav-label">Menú</div>
        <button
          v-for="item in NAV_ITEMS"
          :key="item.id"
          class="shell__sidebar-nav-item"
          :class="{ 'shell__sidebar-nav-item--active': currentTab === item.id }"
          @click="router.push(item.route)"
        >
          <span class="material-icons">{{ item.icon }}</span>
          {{ item.label }}
        </button>

        <div class="shell__sidebar-divider" />

        <button class="shell__sidebar-nav-item shell__sidebar-nav-item--ai" @click="showAssistant = true">
          <span class="material-icons">auto_awesome</span>
          Asesor IA
        </button>
      </nav>

      <!-- User footer -->
      <div class="shell__sidebar-user">
        <div class="shell__sidebar-user-avatar">{{ initial }}</div>
        <div class="shell__sidebar-user-info">
          <span class="shell__sidebar-user-name">{{ userName }}</span>
          <span class="shell__sidebar-user-email">{{ userEmail }}</span>
        </div>
      </div>
    </aside>

    <!-- ═══ ÁREA PRINCIPAL ════════════════════════════════════════════════ -->
    <div class="shell__main">

      <!-- Header superior — Lite siempre, Pro solo en mobile o como topbar -->
      <div class="shell__header-wrap">
        <!-- Lite header (Lite siempre · Pro mobile) -->
        <LiteHeaderDesktop
          v-if="!isPro || isMobile"
          :balance-visible="!ui.hideValues"
          :notification-count="0"
          @avatar-click="menuOpen = !menuOpen"
          @toggle-visibility="ui.toggleHideValues()"
          @open-notifications="menuOpen = false"
          @open-menu="menuOpen = !menuOpen"
        />

        <!-- Pro topbar (Pro desktop) -->
        <header v-if="isPro && !isMobile" class="shell__pro-topbar">
          <span class="shell__pro-topbar-title">{{ pageTitle }}</span>
          <div class="shell__pro-topbar-actions">
            <button class="shell__btn-primary" @click="quickAddOpen = true">
              <span class="material-icons" style="font-size:18px">add</span>
              Agregar
            </button>
            <span class="shell__pro-topbar-divider" />
            <button class="shell__icon-btn" :aria-label="ui.hideValues ? 'Mostrar saldos' : 'Ocultar saldos'" @click="ui.toggleHideValues()">
              <span class="material-icons">{{ ui.hideValues ? 'visibility_off' : 'visibility' }}</span>
            </button>
            <button class="shell__icon-btn" :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'" @click="$q.dark.toggle()">
              <span class="material-icons">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
            </button>
            <button class="shell__icon-btn" aria-label="Notificaciones">
              <span class="material-icons">notifications</span>
            </button>
            <button class="shell__sidebar-user-avatar shell__icon-avatar" @click="menuOpen = !menuOpen">
              {{ initial }}
            </button>
          </div>
        </header>

        <!-- Expanded menu overlay (ambos modos) -->
        <ExpandedNavigationMenuLight v-model:open="menuOpen" />
      </div>

    </div>

    <!-- Contenido de la ruta — q-page-container satisface q-page en las vistas -->
    <q-page-container class="shell__page-container">
      <router-view v-slot="{ Component }">
        <transition name="shell-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- ═══ NAV INFERIOR ══════════════════════════════════════════════════ -->

    <!-- Lite: pill flotante con todos los tabs -->
    <LiteFloatingBottomNav
      v-if="!isPro"
      @quick-add="quickAddOpen = true"
    />

    <!-- Pro mobile: pill con accent cyan -->
    <BottomNavMobile
      v-if="isPro && isMobile"
      accent="var(--info)"

      @quick-add="quickAddOpen = true"
    />

    <!-- ═══ OVERLAYS GLOBALES ══════════════════════════════════════════════ -->
    <QuickActionSheet v-model="quickAddOpen" />

    <!-- Onboarding — primer login o repetición desde Config -->
    <OnboardingFlow v-model="showOnboarding" @done="onOnboardingDone" />

    <q-dialog v-model="showAssistant">
      <q-card class="shell__assistant-card">
        <q-card-section>
          <div class="shell__assistant-title">Asesor IA</div>
          <p class="shell__assistant-text">El asesor inteligente está disponible en la vista de inicio.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Ir al inicio" color="primary" @click="router.push('/user/home'); showAssistant = false" />
          <q-btn flat label="Cerrar" @click="showAssistant = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';
import { useUiStore } from 'stores/ui';
import LiteHeaderDesktop from 'components/liquid/LiteHeaderDesktop.vue';
import LiteFloatingBottomNav from 'components/liquid/LiteFloatingBottomNav.vue';
import BottomNavMobile from 'components/liquid/BottomNavMobile.vue';
import ExpandedNavigationMenuLight from 'components/liquid/ExpandedNavigationMenuLight.vue';
import QuickActionSheet from 'components/liquid/QuickActionSheet.vue';
import OnboardingFlow from 'components/OnboardingFlow.vue';

const router = useRouter();
const route  = useRoute();
const $q     = useQuasar();
const auth   = useAuthStore();
const ui     = useUiStore();

// ── Overlays ──────────────────────────────────────────────────────────────
const menuOpen      = ref(false);
const quickAddOpen  = ref(false);
const showAssistant = ref(false);
const showOnboarding = ref(false);

// Auto-trigger onboarding si el usuario nunca lo ha visto
function checkOnboarding() {
  if (auth.settings && auth.settings.has_seen_onboarding === false) {
    showOnboarding.value = true;
  }
}
onMounted(checkOnboarding);
// También reacciona cuando settings carga async después del mount
watch(() => auth.settings?.has_seen_onboarding, (val) => {
  if (val === false) showOnboarding.value = true;
});

async function onOnboardingDone() {
  showOnboarding.value = false;
  await auth.updateSettings({ has_seen_onboarding: true });
}

// ── Mode & device ─────────────────────────────────────────────────────────
const mode     = computed(() => auth.settings?.layout_mode || auth.user?.layout_mode || 'lite');
const isMobile = computed(() => $q.platform.is.mobile || $q.screen.lt.md);
const isPro    = computed(() => mode.value === 'pro');
const isDark   = computed(() => $q.dark.isActive);

// ── User ──────────────────────────────────────────────────────────────────
const userName  = computed(() => auth.user?.name  || 'Usuario');
const userEmail = computed(() => auth.user?.email || '');
const initial   = computed(() => userName.value.charAt(0).toUpperCase());

// ── Navigation ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home',         label: 'Inicio',        icon: 'home',         route: '/user/home' },
  { id: 'transactions', label: 'Transacciones',  icon: 'receipt_long', route: '/user/transactions' },
  { id: 'analisis',     label: 'Análisis',       icon: 'donut_small',  route: '/user/expense-analysis' },
  { id: 'jars',         label: 'Cántaros',       icon: 'savings',      route: '/user/jars' },
  { id: 'dreams',       label: 'Sueños',         icon: 'auto_awesome', route: '/user/dreams' },
  { id: 'debts',        label: 'Deudas',         icon: 'credit_card',  route: '/user/debts' },
  { id: 'config',       label: 'Configuración',  icon: 'settings',     route: '/user/config' },
];

const currentTab = computed(() => {
  const p = route.path;
  if (p.includes('/transactions'))                       return 'transactions';
  if (p.includes('/expense-analysis'))                   return 'analisis';
  if (p.includes('/jars'))                               return 'jars';
  if (p.includes('/dreams'))                             return 'dreams';
  if (p.includes('/debts'))                              return 'debts';
  if (p.includes('/config') || p.includes('/settings')) return 'config';
  return 'home';
});

const pageTitle = computed(() => {
  const item = NAV_ITEMS.find(n => n.id === currentTab.value);
  return item?.label || 'Inicio';
});
</script>

<style lang="scss" scoped>
// ── Root shell ──────────────────────────────────────────────────────────────
.shell {
  background: var(--bg-canvas);
  color: var(--fg-1);

  // iOS safe area
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left:   env(safe-area-inset-left,   0px);
  padding-right:  env(safe-area-inset-right,  0px);
}

// ── Sidebar (Pro desktop — fixed left) ──────────────────────────────────────
.shell__sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  background: var(--surface-1);
  border-right: 1px solid var(--border-hairline);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
  z-index: var(--z-nav, 100);

  &-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px 28px;
    cursor: pointer;
  }

  &-logo-mark {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: var(--info);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 12px;
    color: #fff;
    letter-spacing: -0.04em;
  }

  &-logo-text {
    display: flex;
    flex-direction: column;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 14px;
    color: var(--fg-1);
  }

  &-logo-badge {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--info);
    padding: 1px 6px;
    background: color-mix(in srgb, var(--info) 12%, transparent);
    border-radius: 4px;
    align-self: flex-start;
    margin-top: 2px;
  }

  &-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &-nav-label {
    font-family: var(--font-body);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-3, var(--fg-2));
    padding: 0 8px;
    margin-bottom: 6px;
  }

  &-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: 0;
    cursor: pointer;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg-2);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    text-align: left;
    width: 100%;
    transition: background 150ms, color 150ms;

    .material-icons { font-size: 20px; }

    &:hover {
      background: var(--surface-2);
      color: var(--fg-1);
    }

    &--active {
      background: color-mix(in srgb, var(--info) 12%, transparent);
      color: var(--info);
      font-weight: 600;

      &:hover {
        background: color-mix(in srgb, var(--info) 18%, transparent);
        color: var(--info);
      }
    }

    &--ai {
      color: var(--info);
    }
  }

  &-divider {
    height: 1px;
    background: var(--border-hairline);
    margin: 12px 0;
  }

  &-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-radius: var(--radius-sm);
    margin-top: 8px;
  }

  &-user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--info);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
  }

  &-user-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &-user-name {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    color: var(--fg-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-user-email {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--fg-2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// ── Main content column (header + topbar) ───────────────────────────────────
.shell__main {
  // Pro desktop: offset left para el sidebar fixed
  .shell--pro.shell--desktop & {
    margin-left: 240px;
  }
}

// ── Header wrap ──────────────────────────────────────────────────────────────
.shell__header-wrap {
  position: relative;
  z-index: var(--z-popover, 200);
  flex-shrink: 0;
}

// ── Pro topbar ───────────────────────────────────────────────────────────────
.shell__pro-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 24px;
  height: 64px;
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-hairline);
  flex-shrink: 0;

  &-title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 20px;
    color: var(--fg-1);
    letter-spacing: -0.02em;
  }

  &-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &-divider {
    width: 1px;
    height: 22px;
    background: var(--border-hairline);
    margin: 0 2px;
  }
}

// ── Shared buttons ───────────────────────────────────────────────────────────
.shell__btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 0;
  cursor: pointer;
  border-radius: var(--radius-pill);
  background: var(--info);
  color: #fff;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  transition: opacity 150ms;

  &:hover { opacity: 0.88; }
}

.shell__icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--fg-2);
  cursor: pointer;
  transition: background 150ms;

  .material-icons { font-size: 20px; }

  &:hover { background: var(--surface-2); color: var(--fg-1); }
}

.shell__icon-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--info) !important;
  font-size: 13px;
  font-family: var(--font-display);
  font-weight: 600;
  cursor: pointer;
}

// ── Page container offset (Pro desktop sidebar) ───────────────────────────────
.shell__page-container {
  .shell--pro.shell--desktop & {
    margin-left: 240px;
  }
}

// ── Assistant dialog ─────────────────────────────────────────────────────────
.shell__assistant-card {
  border-radius: var(--radius-lg);
  min-width: 320px;
  background: var(--surface-1);
}
.shell__assistant-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  color: var(--fg-1);
}
.shell__assistant-text {
  margin: 8px 0 0;
  color: var(--fg-2);
  font-size: 14px;
  line-height: 1.5;
}

// ── Transition ───────────────────────────────────────────────────────────────
.shell-page-enter-active,
.shell-page-leave-active {
  transition: opacity 200ms cubic-bezier(0.23, 1, 0.32, 1),
              transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
}
.shell-page-enter-from { opacity: 0; transform: translateY(6px); }
.shell-page-leave-to   { opacity: 0; transform: translateY(-6px); }
</style>
