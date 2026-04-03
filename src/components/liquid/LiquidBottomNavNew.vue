<template>
  <!-- LITE Bottom Navigation: Fixed bottom bar with 4 tabs and central FAB -->
  <q-footer class="bg-transparent overflow-visible" style="border: none">
    <nav
      class="nav-shell bg-white border-t border-[#E2E8F0] fixed bottom-0 left-0 right-0 z-40 flex items-end justify-around px-2 py-2 pb-safe"
      role="navigation"
      aria-label="Main navigation"
    >
      <!-- Left Navigation Items (Home, Transactions) -->
      <button
        v-for="item in leftItems"
        :key="item.id"
        class="nav-item"
        :class="isActive(item.to) ? 'nav-item--active' : 'nav-item--inactive'"
        @click="navigateTo(item.to)"
        :aria-label="item.label"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <span class="material-symbols-outlined text-2xl">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>

      <!-- Center FAB (Floating Action Button) -->
      <div class="fab-wrapper">
        <button
          class="fab-btn"
          @click="$emit('fab-click')"
          aria-label="Add transaction"
          title="Add transaction"
        >
          <span class="material-symbols-outlined text-3xl text-white">add</span>
        </button>
      </div>

      <!-- Right Navigation Items (Jars, Settings) -->
      <button
        v-for="item in rightItems"
        :key="item.id"
        class="nav-item"
        :class="isActive(item.to) ? 'nav-item--active' : 'nav-item--inactive'"
        @click="navigateTo(item.to)"
        :aria-label="item.label"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <span class="material-symbols-outlined text-2xl">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </q-footer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

/**
 * LiquidBottomNavNew - LITE Bottom Navigation Component
 *
 * A fixed bottom navigation bar with:
 * - 4 main tabs: Home, Transactions, Jars, Settings
 * - Central FAB (Floating Action Button) for quick actions
 * - Active tab indicator (bottom border)
 * - Safe area support for home indicator devices
 * - Material Symbols Outlined icons
 *
 * @example
 * <LiquidBottomNavNew @fab-click="showQuickActions = true" />
 *
 * @emits fab-click - When FAB is clicked
 * @emits tab-change - When a tab is clicked (custom navigation)
 */

interface NavItem {
  id: 'home' | 'transactions' | 'jars' | 'settings';
  label: string;
  icon: string;
  to: string;
}

const route = useRoute();
const router = useRouter();

defineEmits<{
  'fab-click': [];
  'tab-change': [tabId: string];
}>();

/**
 * Left navigation items (Home and Transactions)
 */
const leftItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    to: '/app/home'
  },
  {
    id: 'transactions',
    label: 'Movim.',
    icon: 'receipt_long',
    to: '/app/transactions'
  }
];

/**
 * Right navigation items (Jars and Settings)
 */
const rightItems: NavItem[] = [
  {
    id: 'jars',
    label: 'Jars',
    icon: 'savings',
    to: '/app/jars'
  },
  {
    id: 'settings',
    label: 'Config',
    icon: 'settings',
    to: '/app/config'
  }
];

/**
 * Check if a route path is currently active
 * @param path - The route path to check
 * @returns true if the path is active
 */
function isActive(path: string): boolean {
  return route.path.startsWith(path);
}

/**
 * Navigate to a given path
 * @param path - The path to navigate to
 */
function navigateTo(path: string): void {
  router.push(path).catch(() => {
    // Silently handle navigation failures
  });
}
</script>

<style lang="scss" scoped>
// Safe area CSS variable support
:root {
  --safe-bottom: env(safe-area-inset-bottom, 0);
}

.nav-shell {
  height: calc(80px + env(safe-area-inset-bottom, 0));
  box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.05);
  will-change: transform;
}

.nav-item {
  @apply relative flex flex-col items-center justify-center gap-1 flex-1 max-w-[64px] min-h-[56px] rounded-xl border-none bg-transparent cursor-pointer transition-all duration-220 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2 focus-visible:ring-offset-white;

  &--inactive {
    @apply text-[#64748B] hover:text-[#1E3A8A];
  }

  &--active {
    @apply text-[#1E3A8A] font-semibold;

    // Active indicator: bottom border (3px)
    &::after {
      content: '';
      @apply absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-6 rounded-t-full bg-[#1E3A8A];
    }
  }
}

.nav-label {
  @apply text-xs font-bold uppercase tracking-wider leading-none;
}

/* FAB (Floating Action Button) */
.fab-wrapper {
  @apply flex items-center justify-center relative z-10 flex-1;
  transform: translateY(-28px);
}

.fab-btn {
  @apply w-14 h-14 rounded-full bg-[#1E3A8A] border-none cursor-pointer flex items-center justify-center transition-all duration-220 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2 focus-visible:ring-offset-white;

  box-shadow: 0 8px 24px rgba(30, 58, 138, 0.35);

  &:hover {
    @apply bg-[#1D4ED8];
    box-shadow: 0 12px 32px rgba(30, 58, 138, 0.45);
  }

  &:active {
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);
  }
}

// Focus visible for accessibility
button:focus-visible {
  outline-offset: 2px;
}
</style>
