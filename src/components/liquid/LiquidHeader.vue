<template>
  <header class="lite-header" role="banner">
    <!-- Left: Avatar + Greeting -->
    <div class="lite-header__left">
      <button
        class="lite-header__avatar"
        @click="$emit('avatar-click')"
        aria-label="Perfil de usuario"
      >
        <img v-if="user?.avatar" :src="user.avatar" :alt="user?.name || 'Usuario'" />
        <span v-else class="lite-header__initials">{{ user?.initials || 'U' }}</span>
      </button>
      <h1 class="lite-header__greeting">Hola, {{ firstName }} 👋</h1>
    </div>
    <!-- Right: Notification Bell -->
    <button
      class="lite-header__bell"
      @click="$emit('menu-click')"
      aria-label="Notificaciones"
    >
      <q-icon name="notifications" size="24px" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface User {
  name?: string;
  avatar?: string;
  initials?: string;
}

interface Props {
  balanceAmount?: number;
  balanceCurrency?: string;
  showBalance?: boolean;
  user?: User;
  currencyOptions?: string[];
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  balanceAmount: 0,
  balanceCurrency: 'USD',
  showBalance: true,
  currencyOptions: () => ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'MXN'],
  isLoading: false,
});

defineEmits<{
  'menu-click': [];
  'balance-toggle': [showBalance: boolean];
  'currency-change': [currency: string];
  'avatar-click': [];
}>();

const firstName = computed(() => props.user?.name?.split(' ')[0] || 'José');
</script>

<style lang="scss" scoped>
.lite-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: 64px;
  background: #f7f9fb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    background: #dbeafe;
    flex-shrink: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    padding: 0;
    transition: transform 150ms ease-out;

    &:active { transform: scale(0.93); }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__initials {
    font-size: 13px;
    font-weight: 700;
    color: #006591;
  }

  &__greeting {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    font-family: 'Outfit', sans-serif;
    line-height: 1.2;
  }

  &__bell {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: #006591;
    transition: background 200ms ease-out, transform 150ms ease-out;

    &:hover { background: #f1f5f9; }
    &:active { transform: scale(0.93); }
  }
}
</style>
