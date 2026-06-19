<template>
  <header class="lhd">
    <div class="lhd__inner">
      <!-- Left: avatar + greeting -->
      <div class="lhd__left">
        <button class="lhd__avatar" aria-label="Abrir menú de perfil" @click="$emit('avatar-click')">
          {{ initial }}
        </button>
        <div class="lhd__greeting">
          <span class="lhd__greeting-sub">{{ greeting }}</span>
          <span class="lhd__greeting-name">{{ userName }}</span>
        </div>
      </div>

      <!-- Right: utility actions -->
      <div class="lhd__right">
        <!-- Currency chip -->
        <span class="lhd__currency-chip">{{ currencyCode }}</span>

        <span class="lhd__divider" aria-hidden="true" />

        <!-- Hide/show balance -->
        <button
          class="lhd__icon-btn"
          :aria-label="balanceVisible ? 'Ocultar saldos' : 'Mostrar saldos'"
          @click="$emit('toggle-visibility')"
        >
          <span class="material-icons">{{ balanceVisible ? 'visibility' : 'visibility_off' }}</span>
        </button>

        <!-- Dark mode toggle -->
        <button
          class="lhd__icon-btn"
          :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'"
          @click="toggleDark"
        >
          <span class="material-icons">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>

        <!-- Notifications -->
        <div class="lhd__notif-wrap">
          <button class="lhd__icon-btn" aria-label="Notificaciones" @click="$emit('open-notifications')">
            <span class="material-icons">notifications</span>
          </button>
          <span v-if="(notificationCount ?? 0) > 0" class="lhd__notif-badge" aria-hidden="true" />
        </div>

        <!-- Hamburger menu -->
        <button class="lhd__icon-btn" aria-label="Abrir menú" @click="$emit('open-menu')">
          <span class="material-icons">menu</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';

withDefaults(defineProps<{
  balanceVisible?: boolean;
  notificationCount?: number;
}>(), {
  balanceVisible: true,
  notificationCount: 0,
});

defineEmits<{
  'avatar-click': [];
  'toggle-visibility': [];
  'open-notifications': [];
  'open-menu': [];
}>();

const $q = useQuasar();
const auth = useAuthStore();

const isDark = computed(() => $q.dark.isActive);
const userName = computed(() => auth.user?.name || 'Usuario');
const currencyCode = computed(() => auth.defaultCurrencyCode || 'USD');
const initial = computed(() => userName.value.charAt(0).toUpperCase());

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días,';
  if (h < 19) return 'Buenas tardes,';
  return 'Buenas noches,';
});

function toggleDark() {
  $q.dark.toggle();
}
</script>

<style lang="scss" scoped>
.lhd {
  width: 100%;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 32px 14px;
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
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
    transition: opacity 150ms;

    &:hover { opacity: 0.85; }
  }

  &__greeting {
    display: flex;
    flex-direction: column;
    gap: 1px;
    line-height: 1.25;
  }

  &__greeting-sub {
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--fg-2);
    white-space: nowrap;
  }

  &__greeting-name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 17px;
    color: var(--fg-1);
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__currency-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--fg-1);
    white-space: nowrap;
  }

  &__divider {
    width: 1px;
    height: 22px;
    background: var(--border-hairline);
    margin: 0 2px;
    flex-shrink: 0;
  }

  &__icon-btn {
    width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg-2);
    cursor: pointer;
    transition: background var(--dur-base, 150ms), color var(--dur-base, 150ms);

    .material-icons { font-size: 20px; }

    &:hover {
      background: var(--surface-2);
      color: var(--fg-1);
    }
  }

  &__notif-wrap {
    position: relative;
  }

  &__notif-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--expense, #ef4444);
    box-shadow: 0 0 0 2px var(--surface-1);
  }
}
</style>
