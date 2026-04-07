<template>
  <q-layout view="lHh lpr lFf" class="lite-desktop-layout">

    <!-- Desktop Header (Quasar-managed, auto-offsets q-page) -->
    <q-header flat bordered class="dte-layout-header">
      <LiteHeaderDesktop
        :user="user"
        @nuevo-click="showQuickActions = true"
        @avatar-click="onAvatarClick"
        @notifications-click="onMenuClick"
      />
    </q-header>

    <!-- Main Content Area -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Desktop Status Pill -->
    <div class="dte-status-pill">
      <div class="dte-status-pill__status">
        <span class="dte-status-pill__dot" />
        <span class="dte-status-pill__label">Cántaros: {{ statusText }}</span>
      </div>
      <div class="dte-status-pill__actions">
        <button class="dte-status-pill__btn" aria-label="Estado óptimo" @click="showEstadoOptimo = true">
          <q-icon name="menu" size="20px" />
        </button>
        <button class="dte-status-pill__btn" aria-label="Mostrar u ocultar montos" @click="ui.toggleHideValues()">
          <q-icon :name="ui.hideValues ? 'visibility_off' : 'visibility'" size="20px" />
        </button>
      </div>
    </div>

    <DesktopEstadoOptimoPanel
      v-model="showEstadoOptimo"
      :total-available="ui.jarStatus.totalAvailable"
      :availability-percent="ui.jarStatus.availabilityPercent"
      :used-percent="ui.jarStatus.usedPercent"
      :is-hidden="ui.hideValues"
      @details="onEstadoDetails"
    />

    <!-- Quick Action Sheet -->
    <QuickActionSheet
      v-model="showQuickActions"
      @action-selected="onActionSelected"
    />

  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { useUiStore } from 'stores/ui';
import LiteHeaderDesktop from 'components/liquid/LiteHeaderDesktop.vue';
import QuickActionSheet from 'components/liquid/QuickActionSheet.vue';
import DesktopEstadoOptimoPanel from 'components/liquid/DesktopEstadoOptimoPanel.vue';

const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const showQuickActions = ref(false);
const showEstadoOptimo = ref(false);

const statusText = computed(() => {
  const availability = Number(ui.jarStatus.availabilityPercent || 0);
  if (availability >= 70) return 'Saludable';
  if (availability >= 40) return 'En control';
  return 'Atención';
});

const user = computed(() => {
  const u = auth.user;
  const result: { name?: string; avatar?: string | null; initials?: string } = {};
  if (u?.name) result.name = u.name;
  if (u?.avatar !== undefined) result.avatar = u.avatar;
  const initials = u?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  if (initials) result.initials = initials;
  return result;
});

const onAvatarClick = () => { void router.push('/user/config'); };
const onMenuClick  = () => { void router.push('/user/home'); };

const onActionSelected = () => {
  // Action handling is centralized inside QuickActionSheet.
};

const onEstadoDetails = () => {
  showEstadoOptimo.value = false;
  void router.push('/user/expense-analysis');
};
</script>

<style scoped lang="scss">
.lite-desktop-layout {
  background: #f8fafc;

  .body--dark & { background: #0f172a; }
}

.dte-layout-header {
  background: transparent;
  height: 72px;
}

.dte-status-pill {
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 26px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.12);

  .body--dark & {
    background: rgba(15, 23, 42, 0.85);
    border-color: #334155;
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-right: 22px;
    border-right: 1px solid #e2e8f0;

    .body--dark & { border-right-color: #334155; }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.12);
  }

  &__label {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #64748b;

    .body--dark & { color: #94a3b8; }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 10px;
    color: #94a3b8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 160ms ease;

    &:hover {
      color: #1e3a8a;
      background: rgba(30, 58, 138, 0.08);
    }

    &:active { transform: scale(0.96); }
  }
}
</style>
