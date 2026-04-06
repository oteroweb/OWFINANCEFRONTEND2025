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

    <!-- Page Container: padded to avoid overlap with fixed header (64px) -->
    <q-page-container style="padding-top: 64px; min-height: 100vh">
      <router-view v-slot="{ Component }">
        <transition name="lite-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Floating Bottom Nav -->
    <LiteFloatingBottomNav @fab-click="showQuickActions = true" />

    <!-- FAB Quick Action Bottom Sheet -->
    <QuickActionSheet v-model="showQuickActions" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import LiquidHeader from 'components/liquid/LiquidHeader.vue';
import LiteFloatingBottomNav from 'components/liquid/LiteFloatingBottomNav.vue';
import QuickActionSheet from 'components/liquid/QuickActionSheet.vue';

const router = useRouter();
const authStore = useAuthStore();

const showQuickActions = ref(false);
const showBalance = ref(true);
const currentCurrency = ref('USD');
const currencyOptions = ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'MXN'];
const userBalance = ref(0);

const userData = ref({
  name: authStore.user?.name || 'User',
  avatar: (authStore.user as { avatar?: string } | null)?.avatar || '',
  initials: authStore.user?.name?.substring(0, 2).toUpperCase() || 'U'
});
watch(() => authStore.user, (u) => {
  userData.value = {
    name: u?.name || 'User',
    avatar: (u as { avatar?: string } | null)?.avatar || '',
    initials: u?.name?.substring(0, 2).toUpperCase() || 'U'
  };
});

function onCurrencyChange(currency: string): void { currentCurrency.value = currency; }
function onAvatarClick(): void { void router.push('/user/config'); }
function onMenuClick(): void { /* reserved */ }
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
