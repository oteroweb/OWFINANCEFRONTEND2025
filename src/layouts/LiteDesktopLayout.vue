<template>
  <q-layout view="hHh lpR fFf" class="lite-desktop-layout">
    <!-- Header no-sticky -->
    <div class="lite-desktop-layout__header-wrap">
      <LiteHeader
        :user="user"
        currency="USD"
        :notification-count="2"
        @avatar-click="menuOpen = !menuOpen"
        @notifications-click="onNotificationsClick"
        @menu-click="menuOpen = !menuOpen"
      />
      <ExpandedMenu
        v-model="menuOpen"
        :user="user"
        @navigate="onMenuNavigate"
        @logout="onLogout"
      />
    </div>

    <!-- Main Content Area (max 1200px) -->
    <q-page-container class="lite-desktop-layout__container">
      <router-view />
    </q-page-container>

    <!-- Floating Nav Pill -->
    <LiteNavPill @quick-add="showQuickActions = true" />

    <!-- Estado Optimo Panel (overlay from bottom) -->
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

    <!-- Assistant Modal -->
    <q-dialog v-model="showAssistant">
      <q-card class="assistant-modal">
        <q-card-section>
          <div class="assistant-modal__title">Asistente Virtual</div>
          <p class="assistant-modal__text">
            Hola, estoy listo para ayudarte con tus finanzas. Muy pronto tendrás acciones guiadas aquí.
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" @click="showAssistant = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { useUiStore } from 'stores/ui';
import LiteHeader from 'components/lite/LiteHeader.vue';
import LiteNavPill from 'components/lite/LiteNavPill.vue';
import ExpandedMenu from 'components/lite/ExpandedMenu.vue';
import QuickActionSheet from 'components/liquid/QuickActionSheet.vue';
import DesktopEstadoOptimoPanel from 'components/liquid/DesktopEstadoOptimoPanel.vue';

const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const showQuickActions = ref(false);
const showEstadoOptimo = ref(false);
const showAssistant = ref(false);
const menuOpen = ref(false);

const user = computed(() => {
  const u = auth.user;
  return {
    name: u?.name || 'Usuario',
    email: u?.email || '',
    avatar: u?.avatar || null,
  };
});

function onNotificationsClick() {
  // TODO: abrir panel de notificaciones
  void router.push('/user/home');
}

function onMenuNavigate(to: string) {
  void router.push(to);
}

function onLogout() {
  auth.logout();
  void router.push('/login');
}

function onActionSelected() {
  // Action handling is centralized inside QuickActionSheet.
}

function onEstadoDetails() {
  showEstadoOptimo.value = false;
  void router.push('/user/expense-analysis');
}
</script>

<style scoped lang="scss">
.lite-desktop-layout {
  background: var(--bg-canvas);
  color: var(--fg-1);
  min-height: 100vh;
  position: relative;
  padding-bottom: 140px; /* space for floating nav pill */

  &__header-wrap {
    position: relative;
    z-index: var(--z-popover);
  }

  &__container {
    max-width: var(--container-max);
    margin: 0 auto;
    width: 100%;
    padding: 12px 32px 32px;
    box-sizing: border-box;
  }
}

.assistant-modal {
  border-radius: var(--radius-lg);
  min-width: 340px;
  background: var(--surface-1);

  &__title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 18px;
    color: var(--fg-1);
  }

  &__text {
    margin: 8px 0 0;
    color: var(--fg-2);
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.5;
  }
}

@media (max-width: 640px) {
  .lite-desktop-layout__container {
    padding: 12px 16px 24px;
  }
}
</style>
