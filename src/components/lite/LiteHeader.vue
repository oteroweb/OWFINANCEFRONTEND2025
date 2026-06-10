<template>
  <header class="lite-header">
    <div class="lite-header__inner">
      <!-- Left: Avatar + Greeting -->
      <div class="lite-header__left">
        <router-link class="lite-header__logo" to="/user/home" aria-label="OW Finance — inicio">
          <svg viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg" height="26">
            <text x="0" y="22" font-family="var(--font-display), system-ui, sans-serif" font-weight="700" font-size="20" fill="currentColor">OW</text>
            <text x="44" y="22" font-family="var(--font-display), system-ui, sans-serif" font-weight="400" font-size="20" fill="currentColor" opacity="0.6">Finance</text>
          </svg>
        </router-link>
      </div>

      <!-- Right: Currency + Visibility + Theme + Notifications + Menu -->
      <div class="lite-header__right">
        <div class="lite-header__currency">{{ currency }}</div>
        <span class="lite-header__divider" />

        <button
          class="lite-header__icon-btn"
          :aria-label="hideValues ? 'Mostrar saldos' : 'Ocultar saldos'"
          @click="toggleHideValues"
        >
          <q-icon :name="hideValues ? 'visibility_off' : 'visibility'" size="20px" />
        </button>

        <button
          class="lite-header__icon-btn"
          :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'"
          @click="toggleDark"
        >
          <q-icon :name="isDark ? 'light_mode' : 'dark_mode'" size="20px" />
        </button>

        <div class="lite-header__notif-wrap">
          <button
            class="lite-header__icon-btn"
            aria-label="Notificaciones"
            @click="$emit('notifications-click')"
          >
            <q-icon name="notifications" size="20px" />
          </button>
          <span v-if="(notificationCount ?? 0) > 0" class="lite-header__notif-dot" />
        </div>

        <button
          class="lite-header__icon-btn"
          aria-label="Abrir menú"
          @click="$emit('menu-click')"
        >
          <q-icon name="menu" size="20px" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useUiStore } from 'stores/ui';

interface User {
  name?: string;
  avatar?: string | null;
}

defineProps<{
  user?: User;
  currency?: string;
  notificationCount?: number;
}>();

defineEmits<{
  'avatar-click': [];
  'notifications-click': [];
  'menu-click': [];
}>();

const $q = useQuasar();
const ui = useUiStore();

const hideValues = computed(() => ui.hideValues);
const isDark = computed(() => $q.dark.isActive);

function toggleHideValues() {
  ui.toggleHideValues();
}

function toggleDark() {
  $q.dark.toggle();
  // Persistir preferencia
  try {
    localStorage.setItem('ow-theme', $q.dark.isActive ? 'dark' : 'light');
  } catch {
    // ignore
  }
}
</script>

<style scoped lang="scss">
.lite-header {
  padding: 18px 32px 14px;
  max-width: var(--container-max);
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__logo {
    display: inline-flex;
    align-items: center;
    color: var(--fg-1);
    text-decoration: none;
    flex-shrink: 0;
    transition: opacity 160ms ease;

    &:hover {
      opacity: 0.75;
    }
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 13px;
  }

  &__avatar {
    width: 42px;
    height: 42px;
    border: 0;
    padding: 0;
    cursor: pointer;
    border-radius: var(--radius-pill);
    background: var(--brand-primary);
    color: var(--fg-on-brand);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__initial {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__greeting {
    display: flex;
    flex-direction: column;
    gap: 1px;
    line-height: 1.25;

    &-label {
      font-family: var(--font-body);
      font-size: 12.5px;
      font-weight: 500;
      color: var(--fg-2);
      white-space: nowrap;
    }

    &-name {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 17px;
      color: var(--fg-1);
      white-space: nowrap;
      letter-spacing: -0.01em;
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__currency {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    color: var(--fg-2);
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    background: var(--surface-2);
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
    border-radius: 999px;
    background: var(--expense);
    box-shadow: 0 0 0 2px var(--surface-1);
  }
}

@media (max-width: 640px) {
  .lite-header {
    padding: 14px 16px 10px;

    &__greeting-name {
      font-size: 15px;
    }
  }
}
</style>
