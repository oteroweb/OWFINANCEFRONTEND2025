<template>
  <nav class="bnm" role="navigation" aria-label="Primary">
    <button
      v-for="item in navItems"
      :key="item.id"
      class="bnm__tab"
      :class="{ 'bnm__tab--active': currentTab === item.id }"
      :aria-current="currentTab === item.id ? 'page' : false"
      @click="navigate(item)"
    >
      <span class="material-icons">{{ item.icon }}</span>
      {{ item.label }}
    </button>

    <button class="bnm__fab" aria-label="Agregar transacción" @click="$emit('quick-add')">
      <span class="material-icons">add</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

const props = withDefaults(defineProps<{
  items?: NavItem[];
  accent?: string;
}>(), {
  accent: 'var(--brand-primary)',
  items: undefined,
});

const { t } = useI18n();

const navItems = computed<NavItem[]>(() => props.items ?? [
  { id: 'home',         label: t('nav.home'),         icon: 'home',         route: '/user/home' },
  { id: 'transactions', label: t('nav.transactions'), icon: 'receipt_long', route: '/user/transactions' },
  { id: 'jars',         label: t('nav.jars'),         icon: 'savings',      route: '/user/jars' },
  { id: 'dreams',       label: t('nav.dreams'),       icon: 'auto_awesome', route: '/user/dreams' },
  { id: 'config',       label: t('nav.config'),       icon: 'settings',     route: '/user/config' },
]);

defineEmits<{ 'quick-add': [] }>();

const router = useRouter();
const route  = useRoute();

const currentTab = computed(() => {
  const p = route.path;
  if (p.includes('/transactions'))                      return 'transactions';
  if (p.includes('/expense-analysis'))                  return 'analisis';
  if (p.includes('/jars'))                              return 'jars';
  if (p.includes('/dreams'))                            return 'dreams';
  if (p.includes('/debts'))                             return 'debts';
  if (p.includes('/config') || p.includes('/settings')) return 'config';
  return 'home';
});

function navigate(item: NavItem) {
  void router.push(item.route);
}

</script>

<style lang="scss" scoped>
.bnm {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-nav, 100);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--surface-1);
  border-radius: var(--radius-pill);
  padding: 6px;
  box-shadow: var(--shadow-float);
  white-space: nowrap;

  @media (max-width: 480px) {
    bottom: 16px;
    left: 12px;
    right: 12px;
    transform: none;
    justify-content: space-between;
    flex-wrap: nowrap;
    gap: 2px;
    padding: 4px;
  }

  &__tab {
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
    transition: background var(--dur-base, 150ms), color var(--dur-base, 150ms);

    .material-icons { font-size: 20px; }

    @media (max-width: 480px) {
      flex-direction: column;
      gap: 2px;
      padding: 8px 6px;
      font-size: 10px;
      flex: 1;
      min-width: 0;
      justify-content: center;
      white-space: nowrap;
      overflow: hidden;

      .material-icons { font-size: 22px; }
    }

    &:hover {
      background: var(--surface-2);
      color: var(--fg-1);
    }

    &--active {
      background: v-bind(accent);
      color: #fff;
      font-weight: 600;

      &:hover {
        background: v-bind(accent);
        color: #fff;
      }
    }
  }

  &__fab {
    margin-left: 4px;
    width: 48px;
    height: 48px;

    @media (max-width: 480px) {
      width: 40px;
      height: 40px;
      margin-left: 2px;
      flex-shrink: 0;
    }
    border: 0;
    cursor: pointer;
    border-radius: var(--radius-pill);
    background: v-bind(accent);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.20);
    transition: transform 150ms, box-shadow 150ms;
    flex-shrink: 0;

    .material-icons { font-size: 26px; }

    &:hover {
      transform: scale(1.07);
    }

    &:active { transform: scale(0.93); }
  }
}
</style>
