<template>
  <q-layout view="hHh lpR fFf" class="pro-layout">
    <!-- Left Sidebar (desktop only) -->
    <aside v-if="!isMobile" class="pro-sidebar">
      <!-- Logo -->
      <div class="pro-sidebar__logo" @click="router.push('/user/home')">
        <div class="pro-sidebar__logo-mark">OW</div>
        <div class="pro-sidebar__logo-text">
          <span>Finance</span>
          <span class="pro-sidebar__logo-badge">PRO</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="pro-sidebar__nav">
        <div class="pro-sidebar__nav-label">Menú</div>
        <button
          v-for="item in proNav"
          :key="item.id"
          class="pro-sidebar__nav-item"
          :class="{ 'pro-sidebar__nav-item--active': currentTab === item.id }"
          @click="router.push(item.route)"
        >
          <q-icon :name="item.icon" size="20px" />
          <span>{{ item.label }}</span>
        </button>

        <div class="pro-sidebar__nav-divider" />

        <button class="pro-sidebar__nav-item pro-sidebar__nav-item--ai" @click="showAssistant = true">
          <q-icon name="auto_awesome" size="20px" />
          <span>Asesor IA</span>
        </button>
      </nav>

      <!-- User -->
      <div class="pro-sidebar__user">
        <div class="pro-sidebar__user-avatar">{{ initials }}</div>
        <div class="pro-sidebar__user-info">
          <span class="pro-sidebar__user-name">{{ user?.name || 'Usuario' }}</span>
          <span class="pro-sidebar__user-email">{{ user?.email || '' }}</span>
        </div>
        <q-icon name="more_vert" size="16px" class="pro-sidebar__user-menu" />
      </div>
    </aside>

    <!-- Main content area -->
    <div class="pro-layout__main">
      <!-- Top bar -->
      <header class="pro-topbar">
        <div class="pro-topbar__title">{{ pageTitle }}</div>
        <div class="pro-topbar__actions">
          <button class="pro-topbar__btn-primary" @click="showQuickActions = true">
            <q-icon name="add" size="18px" />
            <span>Agregar</span>
          </button>
          <span class="pro-topbar__divider" />
          <button
            class="pro-topbar__icon-btn"
            :aria-label="ui.hideValues ? 'Mostrar saldos' : 'Ocultar saldos'"
            @click="ui.toggleHideValues()"
          >
            <q-icon :name="ui.hideValues ? 'visibility_off' : 'visibility'" size="20px" />
          </button>
          <button
            class="pro-topbar__icon-btn"
            :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'"
            @click="toggleDark"
          >
            <q-icon :name="isDark ? 'light_mode' : 'dark_mode'" size="20px" />
          </button>
          <div class="pro-topbar__notif-wrap">
            <button class="pro-topbar__icon-btn" aria-label="Notificaciones">
              <q-icon name="notifications" size="20px" />
            </button>
            <span class="pro-topbar__notif-dot" />
          </div>
        </div>
      </header>

      <!-- Page content -->
      <q-page-container class="pro-layout__content">
        <slot name="page-content" />
      </q-page-container>
    </div>

    <!-- Right panel placeholder (desktop only) -->
    <aside v-if="!isMobile" class="pro-right-panel">
      <div class="pro-right-panel__header">
        <span class="pro-right-panel__title">Resumen</span>
      </div>
      <div class="pro-right-panel__body">
        <p class="t-body-sm" style="color: var(--fg-2); text-align: center; padding: 40px 20px;">
          Panel de resumen en construcción.
        </p>
      </div>
    </aside>

    <!-- Mobile bottom tab bar -->
    <div v-if="isMobile" class="pro-mobile-nav">
      <button
        v-for="item in proNav"
        :key="item.id"
        class="pro-mobile-nav__item"
        :class="{ 'pro-mobile-nav__item--active': currentTab === item.id }"
        @click="router.push(item.route)"
      >
        <q-icon :name="item.icon" size="22px" />
        <span>{{ item.shortLabel }}</span>
      </button>
      <button class="pro-mobile-nav__fab" @click="showQuickActions = true">
        <q-icon name="add" size="26px" />
      </button>
    </div>

    <!-- Overlays -->
    <QuickActionSheet
      v-model="showQuickActions"
      @action-selected="onActionSelected"
    />

    <q-dialog v-model="showAssistant">
      <q-card class="assistant-modal">
        <q-card-section>
          <div class="assistant-modal__title">Asesor Virtual</div>
          <p class="assistant-modal__text">
            Estoy listo para ayudarte con tus finanzas. Muy pronto tendrás acciones guiadas aquí.
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" @click="showAssistant = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';
import { useUiStore } from 'stores/ui';
import QuickActionSheet from 'components/liquid/QuickActionSheet.vue';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const auth = useAuthStore();
const ui = useUiStore();

const showQuickActions = ref(false);
const showAssistant = ref(false);

const isMobile = computed(() => $q.screen.lt.md);
const isDark = computed(() => $q.dark.isActive);

const user = computed(() => {
  const u = auth.user;
  return {
    name: u?.name || 'Usuario',
    email: u?.email || '',
    avatar: u?.avatar || null,
  };
});

const initials = computed(() => {
  const name = user.value.name || '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const proNav = [
  { id: 'home', label: 'Inicio', shortLabel: 'Inicio', icon: 'home', route: '/user/home' },
  { id: 'transactions', label: 'Transacciones', shortLabel: 'Movs', icon: 'receipt_long', route: '/user/transactions' },
  { id: 'analisis', label: 'Análisis', shortLabel: 'Análisis', icon: 'donut_small', route: '/user/expense-analysis' },
  { id: 'jars', label: 'Cántaros', shortLabel: 'Cántaros', icon: 'savings', route: '/user/jars' },
  { id: 'dreams', label: 'Sueños', shortLabel: 'Sueños', icon: 'auto_awesome', route: '/user/dreams' },
  { id: 'debts', label: 'Deudas', shortLabel: 'Deudas', icon: 'credit_card', route: '/user/debts' },
  { id: 'config', label: 'Configuración', shortLabel: 'Ajustes', icon: 'settings', route: '/user/config' },
];

const currentTab = computed(() => {
  const path = route.path;
  if (path.includes('/transactions')) return 'transactions';
  if (path.includes('/expense-analysis') || path.includes('/analisis')) return 'analisis';
  if (path.includes('/jars')) return 'jars';
  if (path.includes('/dreams')) return 'dreams';
  if (path.includes('/debts')) return 'debts';
  if (path.includes('/config') || path.includes('/settings')) return 'config';
  return 'home';
});

const pageTitle = computed(() => {
  const item = proNav.find((n) => n.id === currentTab.value);
  return item?.label || 'Inicio';
});

function toggleDark() {
  $q.dark.toggle();
  try {
    localStorage.setItem('ow-theme', $q.dark.isActive ? 'dark' : 'light');
  } catch {
    // ignore
  }
}

function onActionSelected() {
  // Action handling is centralized inside QuickActionSheet.
}
</script>

<style scoped lang="scss">
.pro-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-canvas);
  overflow: hidden;

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }
}

.pro-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--surface-1);
  border-right: 1px solid var(--border-hairline);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  box-sizing: border-box;

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px 28px;
    cursor: pointer;

    &-mark {
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

    &-text {
      display: flex;
      flex-direction: column;

      span:first-child {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 14px;
        color: var(--fg-1);
      }
    }

    &-badge {
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--info);
      padding: 1px 6px;
      background: var(--info-soft);
      border-radius: 4px;
      align-self: flex-start;
    }
  }

  &__nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;

    &-label {
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--fg-3);
      padding: 0 8px;
      margin-bottom: 6px;
    }

    &-item {
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

      &:hover {
        background: var(--surface-2);
        color: var(--fg-1);
      }

      &--active {
        background: var(--info-soft);
        color: var(--info);
        font-weight: 600;
      }

      &--ai {
        background: linear-gradient(90deg, rgba(124, 58, 237, 0.10) 0%, rgba(14, 165, 233, 0.10) 100%);
        color: #8b5cf6;
        font-weight: 600;
      }
    }

    &-divider {
      height: 1px;
      background: var(--border-hairline);
      margin: 12px 0;
    }
  }

  &__user {
    padding-top: 16px;
    border-top: 1px solid var(--border-hairline);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 8px 0;

    &-avatar {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      background: var(--info);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    &-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    &-name {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      color: var(--fg-1);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-email {
      font-family: var(--font-body);
      font-size: 11px;
      color: var(--fg-2);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-menu {
      color: var(--fg-3);
      flex-shrink: 0;
      cursor: pointer;
    }
  }
}

.pro-topbar {
  height: 60px;
  flex-shrink: 0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-hairline);

  &__title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 18px;
    color: var(--fg-1);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 0;
    cursor: pointer;
    border-radius: var(--radius-pill);
    background: var(--info);
    color: #fff;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 14px rgba(14, 165, 233, 0.30);
    transition: transform 80ms ease, box-shadow var(--dur-base) var(--ease-out);

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &__divider {
    width: 1px;
    height: 22px;
    background: var(--border-hairline);
    margin: 0 2px;
    flex-shrink: 0;
  }

  &__icon-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    border-radius: 10px;
    color: var(--fg-2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 160ms ease;

    &:hover {
      background: var(--surface-2);
      color: var(--fg-1);
    }

    &:active {
      transform: scale(0.96);
    }
  }

  &__notif-wrap {
    position: relative;
  }

  &__notif-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: var(--expense);
    box-shadow: 0 0 0 2px var(--surface-1);
  }
}

.pro-right-panel {
  width: 280px;
  flex-shrink: 0;
  background: var(--surface-1);
  border-left: 1px solid var(--border-hairline);
  display: flex;
  flex-direction: column;

  &__header {
    padding: 20px 20px 12px;
    border-bottom: 1px solid var(--border-hairline);
  }

  &__title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 14px;
    color: var(--fg-1);
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
}

.pro-mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 2px;
  padding: 8px 6px;
  background: var(--surface-1);
  border-top: 1px solid var(--border-hairline);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 5px 2px;
    border: 0;
    cursor: pointer;
    border-radius: 12px;
    background: transparent;
    color: var(--fg-2);
    font-family: var(--font-body);
    font-size: 9px;
    font-weight: 500;
    flex: 1 1 0;
    min-width: 0;
    white-space: nowrap;
    transition: background 150ms, color 150ms;

    &--active {
      color: var(--info);
      background: var(--info-soft);
      font-weight: 600;
    }
  }

  &__fab {
    width: 52px;
    height: 52px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: white;
    background: var(--info);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(14, 165, 233, 0.30);
    margin: 0 4px;
    flex-shrink: 0;
    transition: transform 80ms ease;

    &:active {
      transform: scale(0.96);
    }
  }
}

.assistant-modal {
  border-radius: var(--radius-lg);
  min-width: 340px;
  background: var(--surface-1);

  &__title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 18px;
    color: var(--fg-1);
  }

  &__text {
    margin: 8px 0 0;
    color: var(--fg-2);
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.5;
  }
}

@media (max-width: 1024px) {
  .pro-layout__content {
    padding: 16px;
  }
}
</style>
