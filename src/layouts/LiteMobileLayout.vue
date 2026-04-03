<template>
  <q-layout view="lHh lpr lFf" class="bg-[#F8FAFC]">
    <!-- LITE Header -->
    <LiquidHeader
      :balance-amount="userBalance"
      :balance-currency="currentCurrency"
      :show-balance="showBalance"
      :user="userData"
      :currency-options="currencyOptions"
      @balance-toggle="showBalance = !showBalance"
      @currency-change="onCurrencyChange"
      @avatar-click="onAvatarClick"
      @menu-click="onMenuClick"
    />

    <!-- Page Container: padded to avoid overlap with header (pt-16); q-footer handles bottom offset -->
    <q-page-container class="pt-16 min-h-screen">
      <router-view v-slot="{ Component }">
        <transition name="lite-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- LITE Bottom Navigation -->
    <LiquidBottomNavNew :active-tab="activeTab" @fab-click="showQuickActions = true" @tab-change="onTabChange" />

    <!-- FAB Quick Action Bottom Sheet -->
    <QuickActionSheet v-model="showQuickActions" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import LiquidHeader from 'components/liquid/LiquidHeader.vue';
import LiquidBottomNavNew from 'components/liquid/LiquidBottomNavNew.vue';
import QuickActionSheet from 'components/liquid/QuickActionSheet.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// ============================================================
// State Management
// ============================================================

// Modal and UI state
const showQuickActions = ref(false);
const showBalance = ref(true);
const currentCurrency = ref('USD');
const activeTab = ref<'home' | 'transactions' | 'jars' | 'settings'>('home');

// Currency options (can be extended from store/config)
const currencyOptions = ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'MXN'];

// User data (from auth store)
const userData = computed(() => ({
  name: authStore.user?.name || 'User',
  avatar: authStore.user?.avatar || '',
  initials: authStore.user?.name?.substring(0, 2).toUpperCase() || 'U'
}));

// User balance (mock - should be fetched from store)
const userBalance = ref(0);

// ============================================================
// Event Handlers
// ============================================================

/**
 * Handle tab navigation changes
 * Maps tab IDs to route paths and navigates
 */
function onTabChange(tabId: string): void {
  const routes: Record<string, string> = {
    home: '/app/home',
    transactions: '/app/transactions',
    jars: '/app/jars',
    settings: '/app/config'
  };

  const targetRoute = routes[tabId];
  if (targetRoute) {
    router.push(targetRoute).catch(() => {
      // Silently handle navigation failures
    });
  }
}

/**
 * Handle currency selection change
 * Updates local state and could emit to store if needed
 */
function onCurrencyChange(currency: string): void {
  currentCurrency.value = currency;
  // TODO: Emit to Pinia store to update currency globally
  // Could dispatch: currencyStore.setCurrency(currency)
}

/**
 * Handle avatar/user menu click
 * Navigates to settings/config page
 */
function onAvatarClick(): void {
  router.push('/app/config').catch(() => {
    // Silently handle navigation failures
  });
}

/**
 * Handle menu click
 * Placeholder for mobile menu/drawer functionality
 */
function onMenuClick(): void {
  // TODO: Open mobile menu/drawer if implemented
}

// ============================================================
// Lifecycle Hooks
// ============================================================

/**
 * Sync active tab on component mount based on current route
 */
onMounted(() => {
  syncActiveTabWithRoute();
});

/**
 * Watch route changes and sync active tab
 */
watch(() => route.path, () => {
  syncActiveTabWithRoute();
});

/**
 * Synchronize the active tab state with the current route
 * Maps route paths to tab IDs for active state indication
 */
function syncActiveTabWithRoute(): void {
  const path = route.path;

  if (path.includes('/app/transactions')) {
    activeTab.value = 'transactions';
  } else if (path.includes('/app/jars')) {
    activeTab.value = 'jars';
  } else if (path.includes('/app/config') || path.includes('/app/settings')) {
    activeTab.value = 'settings';
  } else {
    activeTab.value = 'home';
  }
}
</script>

<style lang="scss" scoped>
/* Route transition: opacity + translateY(8px), 250ms, cubic-bezier(0.23,1,0.32,1) */
.lite-page-enter-active,
.lite-page-leave-active {
  transition: opacity 250ms cubic-bezier(0.23, 1, 0.32, 1),
              transform 250ms cubic-bezier(0.23, 1, 0.32, 1);
}
.lite-page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.lite-page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
