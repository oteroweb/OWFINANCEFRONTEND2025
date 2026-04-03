<template>
  <!-- LITE Header: Fixed top bar with balance, currency, and user menu -->
  <header
    class="fixed top-0 left-0 right-0 z-40 h-16 bg-[#F8FAFC] flex items-center px-4 sm:px-6 pt-safe"
    role="banner"
  >
    <!-- Left Section: Logo/Menu -->
    <div class="flex items-center gap-3 flex-shrink-0">
      <button
        class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#DBEAFE] transition-colors duration-200 active:scale-95"
        @click="$emit('menu-click')"
        aria-label="Open menu"
        title="Menu"
      >
        <span class="material-symbols-outlined text-[#1E3A8A] text-xl">menu</span>
      </button>
    </div>

    <!-- Center Section: Balance Display -->
    <div class="flex-1 flex justify-center items-baseline gap-2 px-4">
      <div class="flex flex-col items-center">
        <span class="text-xs uppercase tracking-wider text-[#64748B] font-medium">Total Balance</span>
        <div class="flex items-baseline gap-1 mt-0.5">
          <span v-if="localShowBalance" class="text-2xl font-bold text-[#1E3A8A]">
            {{ formatBalance(balanceAmount ?? 0) }}
          </span>
          <span v-else class="text-2xl font-bold text-[#1E3A8A]" style="letter-spacing:2px">••••••</span>
          <span class="text-sm font-semibold text-[#64748B]">{{ balanceCurrency }}</span>
        </div>
      </div>
      <button
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#DBEAFE] transition-colors duration-200 active:scale-95 flex-shrink-0"
        @click="handleBalanceToggle"
        :aria-label="`${localShowBalance ? 'Hide' : 'Show'} balance`"
        :title="`${localShowBalance ? 'Hide' : 'Show'} balance`"
      >
        <span class="material-symbols-outlined text-[#1E3A8A] text-lg">
          {{ localShowBalance ? 'visibility' : 'visibility_off' }}
        </span>
      </button>
    </div>

    <!-- Right Section: Currency Selector & Avatar -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- Currency Selector Dropdown -->
      <select
        v-model="selectedCurrency"
        @change="handleCurrencyChange"
        class="px-3 py-1.5 text-xs font-semibold text-[#1E3A8A] bg-[#DBEAFE] rounded-lg border border-[#93C5FD] hover:bg-[#93C5FD] transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 focus:ring-offset-[#F8FAFC]"
        :aria-label="`Select currency (currently ${selectedCurrency})`"
      >
        <option v-for="currency in currencyOptions" :key="currency" :value="currency">
          {{ currency }}
        </option>
      </select>

      <!-- Avatar Menu Button -->
      <button
        class="w-10 h-10 flex items-center justify-center rounded-full bg-[#DBEAFE] hover:bg-[#93C5FD] transition-colors duration-200 active:scale-95 flex-shrink-0 border-2 border-[#1E3A8A]"
        @click="$emit('avatar-click')"
        :aria-label="`User menu for ${user?.name || 'user'}`"
        :title="`User menu for ${user?.name || 'user'}`"
      >
        <img
          v-if="user?.avatar"
          :src="user.avatar"
          :alt="user.name || 'Avatar'"
          class="w-full h-full object-cover rounded-full"
        />
        <span v-else class="text-xs font-bold text-[#1E3A8A]">
          {{ user?.initials || 'U' }}
        </span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

/**
 * LiquidHeader - LITE Header Component
 *
 * A fixed top navigation bar featuring:
 * - Menu button (left)
 * - Balance display with visibility toggle (center)
 * - Currency selector and avatar (right)
 * - Safe area support for notch devices
 *
 * @example
 * <LiquidHeader
 *   :balance-amount="12450.50"
 *   balance-currency="USD"
 *   :show-balance="true"
 *   :user="{ name: 'José', initials: 'JO', avatar: 'url' }"
 *   :currency-options="['USD', 'EUR', 'CHF']"
 *   @menu-click="handleMenu"
 *   @balance-toggle="handleToggle"
 *   @currency-change="handleCurrencyChange"
 *   @avatar-click="handleAvatarClick"
 * />
 */

interface User {
  name?: string;
  avatar?: string;
  initials?: string;
}

interface Props {
  // Balance display
  balanceAmount?: number;
  balanceCurrency?: string;
  showBalance?: boolean;

  // User info
  user?: User;

  // Currency options
  currencyOptions?: string[];

  // Loading state
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  balanceAmount: 0,
  balanceCurrency: 'USD',
  showBalance: true,
  currencyOptions: () => ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'MXN'],
  isLoading: false
});

const emit = defineEmits<{
  'menu-click': [];
  'balance-toggle': [showBalance: boolean];
  'currency-change': [currency: string];
  'avatar-click': [];
}>();

// Local state for balance visibility
const localShowBalance = ref(props.showBalance);
const selectedCurrency = ref(props.balanceCurrency);

// No writable computed needed — localShowBalance is the source of truth

/**
 * Format balance amount with thousand separators and decimal places
 * @param amount - The balance amount
 * @returns Formatted string (e.g., "$12,450.50")
 */
function formatBalance(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: selectedCurrency.value,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace(/^\D/, '$'); // Replace currency symbol with $
}

/**
 * Handle balance visibility toggle
 */
function handleBalanceToggle(): void {
  localShowBalance.value = !localShowBalance.value;
  emit('balance-toggle', localShowBalance.value);
}

/**
 * Handle currency selection change
 */
function handleCurrencyChange(): void {
  emit('currency-change', selectedCurrency.value);
}
</script>

<style lang="scss" scoped>
/* Safe area CSS variable support */
:root {
  --safe-top: env(safe-area-inset-top, 0);
}

/* Ensure smooth transitions */
header {
  will-change: transform;
}

/* Focus visible for accessibility */
button:focus-visible,
select:focus-visible {
  outline-offset: 2px;
}
</style>
