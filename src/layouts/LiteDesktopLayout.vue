<template>
  <q-layout view="hHh lpR fFf" class="lite-desktop-layout">
    <!-- Header + expanded menu -->
    <div class="lite-desktop-layout__header-wrap">
      <LiteHeaderDesktop
        :balance-visible="!ui.hideValues"
        :notification-count="0"
        @avatar-click="menuOpen = !menuOpen"
        @toggle-visibility="ui.toggleHideValues()"
        @open-notifications="menuOpen = false"
        @open-menu="menuOpen = !menuOpen"
      />
      <ExpandedNavigationMenuLight v-model:open="menuOpen" />
    </div>

    <!-- Main content -->
    <q-page-container class="lite-desktop-layout__container">
      <slot><router-view /></slot>
    </q-page-container>

    <!-- Floating nav pill -->
    <LiteFloatingBottomNav @quick-add="showQuickActions = true" />

    <!-- Quick actions -->
    <QuickActionSheet v-model="showQuickActions" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUiStore } from 'stores/ui';
import LiteHeaderDesktop from 'components/liquid/LiteHeaderDesktop.vue';
import LiteFloatingBottomNav from 'components/liquid/LiteFloatingBottomNav.vue';
import ExpandedNavigationMenuLight from 'components/liquid/ExpandedNavigationMenuLight.vue';
import QuickActionSheet from 'components/liquid/QuickActionSheet.vue';

const ui = useUiStore();

const showQuickActions = ref(false);
const menuOpen = ref(false);
</script>

<style scoped lang="scss">
.lite-desktop-layout {
  background: var(--bg-canvas);
  color: var(--fg-1);
  min-height: 100vh;
  position: relative;
  padding-bottom: 140px;

  &__header-wrap {
    position: relative;
    z-index: var(--z-popover, 200);
  }

  &__container {
    max-width: var(--container-max, 1200px);
    margin: 0 auto;
    width: 100%;
    padding: 12px 32px 32px;
    box-sizing: border-box;
  }
}

@media (max-width: 640px) {
  .lite-desktop-layout__container {
    padding: 12px 16px 24px;
  }
}
</style>
