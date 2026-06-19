<template>
  <q-layout view="lHh lpr lFf" class="lite-mobile-layout">
    <!-- Header -->
    <div class="lite-mobile-layout__header-wrap">
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

    <!-- Page container -->
    <q-page-container class="lite-mobile-layout__container">
      <slot>
        <router-view v-slot="{ Component }">
          <transition name="lite-page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </slot>
    </q-page-container>

    <!-- Bottom nav (mobile pill) -->
    <BottomNavMobile accent="var(--brand-primary)" @quick-add="showQuickActions = true" />

    <!-- Quick actions -->
    <QuickActionSheet v-model="showQuickActions" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUiStore } from 'stores/ui';
import LiteHeaderDesktop from 'components/liquid/LiteHeaderDesktop.vue';
import BottomNavMobile from 'components/liquid/BottomNavMobile.vue';
import ExpandedNavigationMenuLight from 'components/liquid/ExpandedNavigationMenuLight.vue';
import QuickActionSheet from 'components/liquid/QuickActionSheet.vue';

const ui = useUiStore();

const showQuickActions = ref(false);
const menuOpen = ref(false);
</script>

<style lang="scss" scoped>
.lite-mobile-layout {
  background: var(--bg-canvas);
  color: var(--fg-1);
  min-height: 100vh;
  padding-bottom: 120px;

  &__header-wrap {
    position: relative;
    z-index: var(--z-popover, 200);
  }

  &__container {
    padding: 8px 16px 24px;
  }
}

.lite-page-enter-active,
.lite-page-leave-active {
  transition: opacity 250ms cubic-bezier(0.23, 1, 0.32, 1),
              transform 250ms cubic-bezier(0.23, 1, 0.32, 1);
}
.lite-page-enter-from { opacity: 0; transform: translateY(8px); }
.lite-page-leave-to   { opacity: 0; transform: translateY(-8px); }
</style>
