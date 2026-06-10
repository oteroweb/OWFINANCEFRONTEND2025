<template>
  <nav class="lite-nav" role="navigation" aria-label="Primary">
    <button
      v-for="item in navItems"
      :key="item.id"
      class="lite-nav__item"
      :class="{ 'lite-nav__item--active': currentTab === item.id }"
      :aria-current="currentTab === item.id ? 'page' : false"
      @click="onNavClick(item)"
    >
      <q-icon :name="item.icon" size="20px" />
      <span>{{ item.label }}</span>
    </button>

    <button
      class="lite-nav__quick"
      aria-label="Agregar rápido"
      @click="$emit('quick-add')"
    >
      <q-icon name="add" size="26px" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: 'home', route: '/user/home' },
  { id: 'transactions', label: 'Movs', icon: 'receipt_long', route: '/user/transactions' },
  { id: 'analisis', label: 'Análisis', icon: 'donut_small', route: '/user/expense-analysis' },
  { id: 'jars', label: 'Cántaros', icon: 'savings', route: '/user/jars' },
  { id: 'dreams', label: 'Sueños', icon: 'auto_awesome', route: '/user/dreams' },
  { id: 'debts', label: 'Deudas', icon: 'credit_card', route: '/user/debts' },
  { id: 'config', label: 'Ajustes', icon: 'settings', route: '/user/config' },
];

defineEmits<{
  'quick-add': [];
}>();

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

function onNavClick(item: NavItem) {
  void router.push(item.route);
}
</script>

<style scoped lang="scss">
.lite-nav {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-nav);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--surface-1);
  border-radius: var(--radius-pill);
  padding: 6px;
  box-shadow: var(--shadow-float);
  transition: box-shadow var(--dur-base) var(--ease-out);

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    border: 0;
    cursor: pointer;
    border-radius: var(--radius-pill);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--fg-2);
    background: transparent;
    transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
    white-space: nowrap;

    &:hover {
      background: var(--surface-2);
      color: var(--fg-1);
    }

    &:active {
      transform: scale(0.98);
    }

    &--active {
      font-weight: 600;
      color: var(--fg-on-brand);
      background: var(--brand-primary);
    }
  }

  &__quick {
    margin-left: 4px;
    width: 48px;
    height: 48px;
    border: 0;
    cursor: pointer;
    border-radius: var(--radius-pill);
    background: var(--brand-primary);
    color: var(--fg-on-brand);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(30, 58, 138, 0.30);
    transition: transform 80ms ease, box-shadow var(--dur-base) var(--ease-out);

    &:hover {
      background: var(--brand-primary-hover);
    }

    &:active {
      transform: scale(0.96);
    }
  }
}

@media (max-width: 900px) {
  .lite-nav {
    bottom: 16px;
    gap: 2px;
    padding: 5px;

    &__item {
      padding: 8px 10px;
      font-size: 12px;
      gap: 4px;

      span {
        display: none;
      }
    }
  }
}

@media (max-width: 520px) {
  .lite-nav {
    left: 8px;
    right: 8px;
    transform: none;
    justify-content: space-between;

    &__item {
      flex: 1 1 0;
      min-width: 0;
      justify-content: center;
      padding: 8px 6px;
    }
  }
}
</style>
