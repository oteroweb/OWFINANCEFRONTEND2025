<template>
  <div class="dte-header">
    <div class="dte-header__inner">
      <!-- Left: Logo -->
      <div class="dte-header__logo" @click="router.push('/user/home')" role="button" tabindex="0">
        <div class="dte-header__logo-icon">
          <q-icon name="savings" color="white" size="18px" />
        </div>
        <span class="dte-header__logo-text">OW Finance <span class="dte-header__logo-lite">Lite</span></span>
      </div>

      <!-- Center: Nav + Compact Interval -->
      <div class="dte-header__center">
      <nav class="dte-header__nav" role="navigation">
        <button
          v-for="tab in navTabs"
          :key="tab.id"
          class="dte-header__tab"
          :class="{ 'dte-header__tab--active': currentTab === tab.id }"
          :title="tab.label"
          :aria-label="tab.label"
          @click="onTabClick(tab)"
        >
          <q-icon :name="currentTab === tab.id ? tab.icon : 'o_' + tab.icon" size="20px" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>
      <div v-if="showIntervalMenu" class="dte-header__interval">
        <q-btn dense flat round icon="chevron_left" @click="$emit('interval-shift', -1)" />
        <q-select
          :model-value="intervalValue"
          :options="intervalOptions"
          emit-value
          map-options
          dense
          outlined
          class="dte-header__interval-select"
          @update:model-value="(val) => $emit('interval-change', val)"
        />
        <q-btn dense flat round icon="chevron_right" @click="$emit('interval-shift', 1)" />
      </div>
      </div>

      <!-- Right: Actions -->
      <div class="dte-header__actions">
        <button class="dte-header__btn-plus" @click="$emit('nuevo-click')" aria-label="Nuevo">
          <q-icon name="add" size="18px" />
        </button>
        <button class="dte-header__btn-assistant" @click="$emit('assistant-click')" aria-label="Asistente virtual">
          <q-icon name="psychology" size="20px" />
        </button>
        <button class="dte-header__icon-btn" @click="$emit('notifications-click')" aria-label="Notificaciones">
          <q-icon name="notifications" size="20px" />
        </button>
        <button class="dte-header__avatar" @click="$emit('avatar-click')" aria-label="Perfil">
          <img v-if="user?.avatar" :src="user.avatar" :alt="user?.name || 'U'" />
          <span v-else class="dte-header__avatar-initials">{{ user?.initials || 'JO' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

interface User {
  name?: string;
  avatar?: string | null;
  initials?: string;
}

type HeaderInterval = 'month' | 'week' | 'year';

withDefaults(defineProps<{
  user?: User;
  intervalValue?: HeaderInterval;
  showIntervalMenu?: boolean;
}>(), {
  intervalValue: 'month',
  showIntervalMenu: false,
});

defineEmits<{
  'nuevo-click': [];
  'assistant-click': [];
  'avatar-click': [];
  'notifications-click': [];
  'interval-change': [value: HeaderInterval];
  'interval-shift': [direction: -1 | 1];
}>();

const router = useRouter();
const route = useRoute();

const navTabs = [
  { id: 'home', label: 'Inicio', icon: 'home', route: '/user/home' },
  { id: 'transactions', label: 'Movimientos', icon: 'receipt_long', route: '/user/transactions' },
  { id: 'jars', label: 'Cántaros', icon: 'savings', route: '/user/jars' },
  { id: 'settings', label: 'Ajustes', icon: 'settings', route: '/user/config' },
];

const intervalOptions: Array<{ label: string; value: HeaderInterval }> = [
  { label: 'Mensual', value: 'month' },
  { label: 'Semanal', value: 'week' },
  { label: 'Anual', value: 'year' },
];

const currentTab = computed(() => {
  const path = route.path;
  if (path.includes('/transactions')) return 'transactions';
  if (path.includes('/jars')) return 'jars';
  if (path.includes('/config') || path.includes('/settings')) return 'settings';
  return 'home';
});

function onTabClick(tab: { route: string }) {
  void router.push(tab.route);
}
</script>

<style lang="scss" scoped>
.dte-header {
  width: 100%;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  height: 72px;

  .body--dark & {
    background: rgba(15, 23, 42, 0.92);
  }

  &__inner {
    max-width: 1280px;
    margin: 0 auto;
    height: 100%;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    flex-shrink: 0;
    user-select: none;
  }

  &__logo-icon {
    width: 32px;
    height: 32px;
    background: #1e3a8a;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__logo-text {
    font-family: 'Manrope', 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 17px;
    color: #1e3a8a;
    white-space: nowrap;

    .body--dark & { color: #93c5fd; }
  }

  &__logo-lite {
    font-weight: 500;
    opacity: 0.5;
  }

  &__nav {
    display: flex;
    align-items: center;
    background: #f8fafc;
    padding: 4px;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    gap: 4px;
    flex-shrink: 0;

    .body--dark & {
      background: #1e293b;
      border-color: #334155;
    }
  }

  &__center {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  &__interval {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #ffffff;
    border-radius: 12px;
    padding: 3px 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

    .body--dark & {
      background: #1a1a2e;
    }
  }

  &__interval-select {
    min-width: 126px;
  }

  &__tab {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    height: 38px;
    padding: 0 14px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    transition: all 160ms cubic-bezier(0.23, 1, 0.32, 1);

    .body--dark & { color: #64748b; }

    span {
      font-size: 14px;
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
    }

    &:hover {
      color: #1e3a8a;
      .body--dark & { color: #93c5fd; }
    }

    &--active {
      background: white;
      color: #1e3a8a;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(30, 58, 138, 0.12);

      span { font-weight: 700; }

      .body--dark & {
        background: #0f172a;
        color: #93c5fd;
      }
    }

    &:active { transform: scale(0.97); }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  &__btn-plus {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    background: #1e3a8a;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);
    transition: all 160ms cubic-bezier(0.23, 1, 0.32, 1);

    &:hover { background: #1d3278; }
    &:active { transform: scale(0.97); }
  }

  &__btn-assistant {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    background: rgba(139, 92, 246, 0.12);
    color: #7c3aed;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 160ms cubic-bezier(0.23, 1, 0.32, 1);

    &:hover {
      background: rgba(139, 92, 246, 0.2);
    }

    &:active { transform: scale(0.97); }

    .body--dark & {
      background: rgba(139, 92, 246, 0.18);
      color: #c4b5fd;
    }
  }

  &__icon-btn {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: #94a3b8;
    border-radius: 10px;
    cursor: pointer;
    transition: all 160ms ease;

    &:hover {
      background: #f1f5f9;
      color: #475569;

      .body--dark & {
        background: #1e293b;
        color: #cbd5e1;
      }
    }
  }

  &__avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid #e2e8f0;
    overflow: hidden;
    cursor: pointer;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 160ms ease;
    padding: 0;

    .body--dark & { border-color: #334155; }

    &:hover { border-color: #0ea5e9; }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__avatar-initials {
    font-size: 13px;
    font-weight: 700;
    color: #1e3a8a;

    .body--dark & { color: #93c5fd; }
  }
}
</style>
