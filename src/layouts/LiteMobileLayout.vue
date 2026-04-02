<template>
  <q-layout view="lHh lpr lFf" class="bg-[#F8FAFC]">
    <!-- LITE Header (fixed top, 64px) -->
    <LiquidHeader />

    <!-- Page Container: padded to avoid overlap with header (pt-16); q-footer handles bottom offset -->
    <q-page-container class="pt-16 min-h-screen">
      <router-view v-slot="{ Component }">
        <transition name="lite-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- LITE Bottom Navigation (q-footer, Quasar layout integrated) -->
    <LiquidBottomNavNew @fab-click="showAddTransaction = true" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LiquidHeader from 'components/liquid/LiquidHeader.vue';
import LiquidBottomNavNew from 'components/liquid/LiquidBottomNavNew.vue';

const showAddTransaction = ref(false);
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
