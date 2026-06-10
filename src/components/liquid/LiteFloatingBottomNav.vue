<template>
  <div class="fnav">
    <div class="fnav__bar">
      <!-- Left tabs: Home + Transactions -->
      <button
        v-for="tab in leftTabs"
        :key="tab.id"
        class="fnav__tab"
        :class="{ 'fnav__tab--active': currentTab === tab.id }"
        :title="tab.label"
        :aria-label="tab.label"
        @click="onTabClick(tab)"
      >
        <q-icon :name="currentTab === tab.id ? tab.icon : 'o_' + tab.icon" size="22px" />
        <span>{{ tab.shortLabel }}</span>
      </button>

      <!-- Center: FAB -->
      <button class="fnav__fab" aria-label="Nueva transacción" @click="$emit('fab-click')">
        <q-icon name="add" size="26px" />
      </button>

      <!-- Right tabs: Jars + Settings -->
      <button
        v-for="tab in rightTabs"
        :key="tab.id"
        class="fnav__tab"
        :class="{ 'fnav__tab--active': currentTab === tab.id }"
        :title="tab.label"
        :aria-label="tab.label"
        @click="onTabClick(tab)"
      >
        <q-icon :name="currentTab === tab.id ? tab.icon : 'o_' + tab.icon" size="22px" />
        <span>{{ tab.shortLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

defineEmits<{ 'fab-click': [] }>();

const router = useRouter();
const route = useRoute();

const allTabs = [
  { id: 'home',         label: 'Inicio',      shortLabel: 'HOME',     icon: 'home',         route: '/user/home' },
  { id: 'transactions', label: 'Movimientos', shortLabel: 'TRANS',    icon: 'receipt_long', route: '/user/transactions' },
  { id: 'jars',         label: 'Cántaros',    shortLabel: 'JARS',     icon: 'savings',      route: '/user/jars' },
  { id: 'settings',     label: 'Ajustes',     shortLabel: 'SETTINGS', icon: 'settings',     route: '/user/config' },
];

const leftTabs  = allTabs.slice(0, 2);
const rightTabs = allTabs.slice(2);

const currentTab = computed(() => {
  const path = route.path;
  if (path.includes('/transactions')) return 'transactions';
  if (path.includes('/jars'))         return 'jars';
  if (path.includes('/config') || path.includes('/settings')) return 'settings';
  return 'home';
});

function onTabClick(tab: { route: string }) {
  void router.push(tab.route);
}
</script>

<style lang="scss" scoped>
.fnav {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  pointer-events: none; /* let clicks through except bar itself */

  /* On very small screens, widen to near edge */
  @media (max-width: 480px) {
    bottom: 16px;
    left: 16px;
    right: 16px;
    transform: none;
    display: flex;
    justify-content: center;
  }
}

.fnav__bar {
  pointer-events: all;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 8px 32px rgba(30, 58, 138, 0.14),
    0 2px 8px rgba(0, 0, 0, 0.06);

  .body--dark & {
    background: rgba(15, 23, 42, 0.90);
    border-color: rgba(51, 65, 85, 0.6);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

.fnav__tab {
  min-width: 64px;
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: none;
  background: transparent;
  border-radius: 9999px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 180ms cubic-bezier(0.23, 1, 0.32, 1);
  padding: 6px 10px;

  .body--dark & { color: #475569; }

  span {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
  }

  &:hover {
    background: rgba(14, 165, 233, 0.1);
    color: #0ea5e9;
  }

  &--active {
    color: #1e3a8a;
    background: rgba(30, 58, 138, 0.1);

    .body--dark & {
      color: #93c5fd;
      background: rgba(147, 197, 253, 0.12);
    }
  }

  &:active { transform: scale(0.94); }
}

.fnav__fab {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  background: linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 100%);
  box-shadow:
    0 6px 20px rgba(30, 58, 138, 0.45),
    0 2px 6px rgba(14, 165, 233, 0.3);
  transition: all 200ms cubic-bezier(0.23, 1, 0.32, 1);
  margin: 0 4px;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.08);
    box-shadow:
      0 10px 28px rgba(30, 58, 138, 0.5),
      0 4px 10px rgba(14, 165, 233, 0.35);
  }

  &:active { transform: scale(0.92); }
}
</style>
